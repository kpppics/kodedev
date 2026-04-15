import { XMLParser } from 'fast-xml-parser'

export interface FeedItem {
  title: string
  url: string
  price?: number
  description?: string
  image?: string
  pubDate?: string
  source: string
}

export async function hotukdeals(): Promise<FeedItem[]> {
  return fetchFeed('https://www.hotukdeals.com/rss/new', 'HotUKDeals')
}

export async function fetchFeed(url: string, sourceName: string): Promise<FeedItem[]> {
  let xml: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
      redirect: 'follow',
      next: { revalidate: 900 },
    })
    if (!res.ok) return []
    xml = await res.text()
  } catch {
    return []
  }
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const data = parser.parse(xml) as { rss?: { channel?: { item?: unknown[] | unknown } } }
  const items = data.rss?.channel?.item
  const list = Array.isArray(items) ? items : items ? [items] : []
  return list.map((i: unknown) => {
    const it = i as Record<string, unknown>
    const title = String(it.title ?? '').trim()
    const link = String(it.link ?? '').trim()
    const description = typeof it.description === 'string' ? it.description : ''
    const pubDate = typeof it.pubDate === 'string' ? it.pubDate : undefined
    const priceMatch = (title + ' ' + description).match(/£\s?(\d+(?:\.\d{1,2})?)|\$\s?(\d+(?:\.\d{1,2})?)/)
    const price = priceMatch ? parseFloat(priceMatch[1] || priceMatch[2]) : undefined
    return { title, url: link, price, description, pubDate, source: sourceName }
  }).filter(i => i.title && i.url)
}
