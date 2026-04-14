import type { ResolvedProduct } from './jsonld'
import { resolveJsonLd } from './jsonld'

export async function resolveBestBuy(url: string): Promise<ResolvedProduct | null> {
  const key = process.env.BEST_BUY_API_KEY
  if (!key) return resolveJsonLd(url)

  const skuMatch = url.match(/\/(\d{6,10})\.p\?skuId=(\d+)|\/p\/?\?id=(\d+)|\/(\d{6,10})\.p/i)
  const sku = skuMatch?.[2] || skuMatch?.[3] || skuMatch?.[1] || skuMatch?.[4]
  if (!sku) return resolveJsonLd(url)

  const res = await fetch(
    `https://api.bestbuy.com/v1/products/${sku}.json?apiKey=${key}&show=sku,name,salePrice,image,upc,manufacturer,modelNumber`,
  )
  if (!res.ok) return resolveJsonLd(url)
  const p = await res.json()
  return {
    url,
    title: p.name,
    price: Number(p.salePrice),
    currency: 'USD',
    image: p.image,
    identifier: p.upc || p.modelNumber,
    identifierType: p.upc ? 'upc' : 'sku',
    brand: p.manufacturer,
    sourceName: 'Best Buy',
  }
}
