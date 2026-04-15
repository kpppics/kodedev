import { NextResponse } from 'next/server'
import { REGION_CONFIG } from '@/app/lib/region'
import { fetchAllFeeds } from '@/app/lib/feeds/brickseek'
import { analyze } from '@/app/lib/analyze'
import { resolveUrl } from '@/app/lib/resolver/resolver'

export const runtime = 'nodejs'
export const revalidate = 900

export async function GET(req: Request) {
  const region = (new URL(req.url).searchParams.get('region') || 'uk') as 'uk' | 'us'
  const config = REGION_CONFIG[region] ?? REGION_CONFIG.uk
  const items = await fetchAllFeeds(config.deals.feeds)

  // Round-robin across sources so no single feed dominates
  const bySource = new Map<string, typeof items>()
  for (const item of items) {
    if (!bySource.has(item.source)) bySource.set(item.source, [])
    bySource.get(item.source)!.push(item)
  }
  const sources = Array.from(bySource.values())
  const interleaved: typeof items = []
  let i = 0
  while (interleaved.length < 10 && sources.some(s => s.length > 0)) {
    const src = sources[i % sources.length]
    if (src.length > 0) interleaved.push(src.shift()!)
    i++
  }
  const limited = interleaved

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
