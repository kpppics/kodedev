import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { identifyFromImage } from '@/app/lib/vision/client'
import { searchCombined, ebaySearchUrl } from '@/app/lib/ebay/browse'
import { estimateEbayFees } from '@/app/lib/ebay/fees'
import { REGION } from '@/app/lib/region'
import { computeArbitrage, stats } from '@/app/lib/math'
import type { ThriftResponse } from '@/app/lib/vision/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const cache = new Map<string, ThriftResponse>()
const CACHE_TTL = 24 * 60 * 60 * 1000
const cacheExpiry = new Map<string, number>()

export async function POST(req: Request) {
  const form = await req.formData()
  const image = form.get('image')
  const askingPriceRaw = form.get('askingPrice')
  if (!(image instanceof File)) return NextResponse.json({ error: 'image required' }, { status: 400 })

  const askingPrice = parseFloat(String(askingPriceRaw || '0')) || 0

  const buf = Buffer.from(await image.arrayBuffer())
  const mediaType = image.type || 'image/jpeg'
  const sha = crypto.createHash('sha256').update(buf).digest('hex')
  const cacheKey = `${sha}:${askingPrice}`

  const now = Date.now()
  const cached = cache.get(cacheKey)
  const expiry = cacheExpiry.get(cacheKey) || 0
  if (cached && expiry > now) return NextResponse.json({ result: cached })

  let identification
  try {
    identification = await identifyFromImage(buf.toString('base64'), mediaType)
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 })
  }

  // Run search terms in order — use first that yields ≥ 5 active listings or ≥ 3 sold
  let best = { query: identification.searchTerms[0] || identification.title, results: null as Awaited<ReturnType<typeof searchCombined>> | null }
  for (const term of (identification.searchTerms.length ? identification.searchTerms : [identification.title])) {
    const res = await searchCombined(term, 25)
    if (!best.results || (res.sold.length > best.results.sold.length)) best = { query: term, results: res }
    if (res.sold.length >= 5 || res.active.length >= 10) break
  }
  const results = best.results ?? { active: [], sold: [], activeMedian: 0, soldMedian: 0, soldP25: 0, soldP75: 0, query: best.query, total: 0 }

  // Valuation
  const soldPrices = results.sold.map(s => s.price)
  const s = stats(soldPrices)
  const valuation = {
    lowEnd: s.p25 || results.activeMedian * 0.75 || 0,
    median: s.median || results.activeMedian || 0,
    highEnd: s.p75 || results.activeMedian * 1.25 || 0,
  }

  const fees = estimateEbayFees(valuation.median)
  const calc = computeArbitrage({
    price: valuation.median,
    sourceCost: askingPrice,
    shipOut: 3.5,
    prep: 0.5,
    platformFees: fees.totalFees,
    region: REGION,
  })
  const feesLow = estimateEbayFees(valuation.lowEnd)
  const calcLow = computeArbitrage({
    price: valuation.lowEnd,
    sourceCost: askingPrice,
    shipOut: 3.5,
    prep: 0.5,
    platformFees: feesLow.totalFees,
    region: REGION,
  })

  const sampleListings = results.sold.slice(0, 5).map(l => ({
    title: l.title, price: l.price, image: l.image, url: l.url, soldDate: l.soldDate,
  }))

  const result: ThriftResponse = {
    identification,
    comps: {
      activeCount: results.active.length,
      soldCount: results.sold.length,
      soldMedian: valuation.median,
      soldP25: valuation.lowEnd,
      soldP75: valuation.highEnd,
      sampleListings,
    },
    valuation,
    profit: { atMedian: calc.profit, atLowEnd: calcLow.profit, roiAtMedian: calc.roi },
    buyLinks: { ebaySearchUrl: ebaySearchUrl(best.query) },
    askingPrice,
  }

  cache.set(cacheKey, result)
  cacheExpiry.set(cacheKey, now + CACHE_TTL)

  return NextResponse.json({ result })
}
