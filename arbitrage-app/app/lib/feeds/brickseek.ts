import Papa from 'papaparse'
import type { FeedItem } from './hotukdeals'

// Brickseek doesn't expose a public API. Users can upload a CSV exported
// from their Brickseek account. We parse title/price/url columns (flexible headers).
export function parseBrickseekCsv(csvText: string): FeedItem[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true })
  return (parsed.data || []).map(row => {
    const title = row.title || row.product || row.name || ''
    const url = row.url || row.link || ''
    const priceStr = row.price || row.clearance_price || row.sale_price || ''
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
    return { title, url, price: Number.isFinite(price) ? price : undefined, source: 'Brickseek' } as FeedItem
  }).filter(i => i.title && i.url)
}

export async function fetchAllFeeds(feeds: Array<'hotukdeals' | 'latestdeals' | 'techradar' | 'savethestudent' | 'slickdeals' | 'dealnews' | 'hip2save' | 'bradsdeals' | 'pennypinchinmom' | 'walmart' | 'homedepot'>): Promise<FeedItem[]> {
  const { hotukdeals } = await import('./hotukdeals')
  const { latestdeals } = await import('./latestdeals')
  const { techradar } = await import('./techradar')
  const { savethestudent } = await import('./savethestudent')
  const { slickdeals } = await import('./slickdeals')
  const { dealnews } = await import('./dealnews')
  const { hip2save } = await import('./hip2save')
  const { bradsdeals } = await import('./bradsdeals')
  const { pennypinchinmom } = await import('./pennypinchinmom')
  const { walmart } = await import('./walmart')
  const { homedepot } = await import('./homedepot')
  const map = { hotukdeals, latestdeals, techradar, savethestudent, slickdeals, dealnews, hip2save, bradsdeals, pennypinchinmom, walmart, homedepot }
  const results = await Promise.all(feeds.map(f => map[f]().catch(() => [])))
  return results.flat()
}
