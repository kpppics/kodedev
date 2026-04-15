import { NextResponse } from 'next/server'
import { CONFIG } from '@/app/lib/region'
import { fetchAllFeeds } from '@/app/lib/feeds/brickseek'
import { analyze } from '@/app/lib/analyze'
import { resolveUrl } from '@/app/lib/resolver/resolver'

export const runtime = 'nodejs'
export const revalidate = 900

export async function GET() {
  const items = await fetchAllFeeds(CONFIG.deals.feeds)
  const limited = items.slice(0, 5)

  const enriched = await Promise.all(limited.map(async item => {
    let identifier = ''
    let sourcePrice = item.price
    try {
      const r = await resolveUrl(item.url)
      if (r?.identifier) identifier = r.identifier
      if (r?.price) sourcePrice = r.price
      if (!item.title && r?.title) item.title = r.title
    } catch { /* ignore */ }
    if (!identifier && !item.title) return { item, analysis: null }
    if (!sourcePrice) return { item, analysis: null }

    try {
      const analysis = await analyze({
        identifier: identifier || item.title,
        sourceCost: sourcePrice,
        sourceProvider: 'retail',
        targetProvider: 'amazon',
        sourceUrl: item.url,
      })
      // If Amazon didn't have it, try eBay
      if (!analysis.targetPrice) {
        const alt = await analyze({
          identifier: identifier || item.title,
          sourceCost: sourcePrice,
          sourceProvider: 'retail',
          targetProvider: 'ebay',
          sourceUrl: item.url,
        })
        return { item, analysis: alt }
      }
      return { item, analysis }
    } catch {
      return { item, analysis: null }
    }
  }))

  enriched.sort((a, b) => (b.analysis?.profit ?? -Infinity) - (a.analysis?.profit ?? -Infinity))
  return NextResponse.json({ deals: enriched })
}
