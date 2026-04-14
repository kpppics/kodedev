import { parse } from 'node-html-parser'

export interface ResolvedProduct {
  url: string
  title: string
  price?: number
  currency?: string
  image?: string
  identifier?: string         // UPC / EAN / ISBN / GTIN
  identifierType?: 'upc' | 'ean' | 'isbn' | 'gtin' | 'asin' | 'sku'
  brand?: string
  sourceName?: string
  raw?: unknown
}

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

export async function resolveJsonLd(url: string): Promise<ResolvedProduct | null> {
  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
    })
  } catch {
    return null
  }
  if (!res.ok) return null
  const html = await res.text()

  const root = parse(html)
  const scripts = root.querySelectorAll('script[type="application/ld+json"]')
  const out: ResolvedProduct = { url, title: '' }

  // Try JSON-LD first
  for (const s of scripts) {
    try {
      const json = JSON.parse(s.text.trim())
      const products = findProducts(json)
      for (const p of products) {
        applyProduct(out, p)
        if (out.identifier && out.price && out.title) return out
      }
    } catch { /* ignore */ }
  }

  // OpenGraph fallback
  const og = (prop: string) => root.querySelector(`meta[property="${prop}"]`)?.getAttribute('content')
  const name = (n: string) => root.querySelector(`meta[name="${n}"]`)?.getAttribute('content')
  if (!out.title) out.title = og('og:title') || root.querySelector('title')?.text.trim() || ''
  if (!out.image) out.image = og('og:image') || undefined
  if (!out.price) {
    const pa = og('product:price:amount') || og('og:price:amount') || name('twitter:data1')
    if (pa) {
      const n = parseFloat(pa.replace(/[^0-9.]/g, ''))
      if (Number.isFinite(n) && n > 0) out.price = n
    }
  }
  if (!out.currency) out.currency = og('product:price:currency') || og('og:price:currency') || undefined

  // Micro-data gtin
  if (!out.identifier) {
    const gtin = root.querySelector('[itemprop="gtin13"], [itemprop="gtin12"], [itemprop="gtin"], [itemprop="gtin14"]')?.getAttribute('content')
      || root.querySelector('[itemprop="gtin13"], [itemprop="gtin12"], [itemprop="gtin"], [itemprop="gtin14"]')?.text?.trim()
    if (gtin && /^\d{8,14}$/.test(gtin.replace(/\D/g, ''))) {
      out.identifier = gtin.replace(/\D/g, '')
      out.identifierType = gtin.replace(/\D/g, '').length === 13 ? 'ean' : 'upc'
    }
  }

  if (!out.title && !out.price) return null
  return out
}

// Recursively walk JSON-LD to find @type: Product
function findProducts(node: unknown, acc: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (!node) return acc
  if (Array.isArray(node)) { for (const n of node) findProducts(n, acc); return acc }
  if (typeof node !== 'object') return acc
  const n = node as Record<string, unknown>
  const t = n['@type']
  const types = Array.isArray(t) ? t : [t]
  if (types.some(x => typeof x === 'string' && /Product/i.test(x))) acc.push(n)
  if (n['@graph']) findProducts(n['@graph'], acc)
  for (const k of Object.keys(n)) {
    if (k === '@graph') continue
    if (typeof n[k] === 'object') findProducts(n[k], acc)
  }
  return acc
}

function applyProduct(out: ResolvedProduct, p: Record<string, unknown>) {
  const getStr = (k: string): string | undefined => {
    const v = p[k]
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
    return undefined
  }
  const getNum = (k: string): number | undefined => {
    const v = p[k]
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(/[^0-9.]/g, ''))
      if (Number.isFinite(n)) return n
    }
    return undefined
  }

  if (!out.title && getStr('name')) out.title = getStr('name')!
  if (!out.brand) {
    const b = p['brand']
    if (typeof b === 'string') out.brand = b
    else if (b && typeof b === 'object') out.brand = (b as Record<string, unknown>)['name'] as string
  }
  if (!out.image) {
    const img = p['image']
    if (typeof img === 'string') out.image = img
    else if (Array.isArray(img) && typeof img[0] === 'string') out.image = img[0]
    else if (img && typeof img === 'object') out.image = (img as Record<string, unknown>)['url'] as string
  }
  // Offers
  const offers = p['offers']
  const pickOffer = (o: unknown) => {
    if (!o || typeof o !== 'object') return
    const or = o as Record<string, unknown>
    if (!out.price) {
      const price = typeof or['price'] === 'number' ? or['price'] as number :
        typeof or['price'] === 'string' ? parseFloat((or['price'] as string).replace(/[^0-9.]/g, '')) :
        typeof or['lowPrice'] === 'number' ? or['lowPrice'] as number : undefined
      if (price && Number.isFinite(price) && price > 0) out.price = price
    }
    if (!out.currency) {
      const c = or['priceCurrency']
      if (typeof c === 'string') out.currency = c
    }
  }
  if (Array.isArray(offers)) offers.forEach(pickOffer)
  else if (offers) pickOffer(offers)
  if (!out.price) {
    const direct = getNum('price')
    if (direct && direct > 0) out.price = direct
  }

  const gtin13 = getStr('gtin13')
  const gtin12 = getStr('gtin12')
  const gtin14 = getStr('gtin14')
  const gtin = getStr('gtin')
  const isbn = getStr('isbn')
  const sku = getStr('sku') || getStr('mpn')
  if (!out.identifier && gtin13 && /^\d{13}$/.test(gtin13)) { out.identifier = gtin13; out.identifierType = 'ean' }
  if (!out.identifier && gtin12 && /^\d{12}$/.test(gtin12)) { out.identifier = gtin12; out.identifierType = 'upc' }
  if (!out.identifier && gtin14 && /^\d{14}$/.test(gtin14)) { out.identifier = gtin14; out.identifierType = 'gtin' }
  if (!out.identifier && gtin && /^\d{8,14}$/.test(gtin)) { out.identifier = gtin; out.identifierType = 'gtin' }
  if (!out.identifier && isbn) { out.identifier = isbn.replace(/[^0-9X]/gi, ''); out.identifierType = 'isbn' }
  if (!out.identifier && sku) { out.identifier = sku; out.identifierType = 'sku' }
}
