import { NextResponse } from 'next/server'
import { getItemOffers } from '@/app/lib/spapi/pricing'
import { searchCombined } from '@/app/lib/ebay/browse'

export const runtime = 'nodejs'

interface PricingRequest {
  ids: Array<{ provider: 'amazon' | 'ebay'; id: string }>
}

export async function POST(req: Request) {
  let body: PricingRequest
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad JSON' }, { status: 400 }) }

  const amazon = body.ids.filter(i => i.provider === 'amazon').map(i => i.id)
  const ebay = body.ids.filter(i => i.provider === 'ebay').map(i => i.id)

  const [amzOffers, ebayResults] = await Promise.all([
    amazon.length ? getItemOffers(amazon) : Promise.resolve([]),
    Promise.all(ebay.map(q => searchCombined(q, 10))),
  ])

  return NextResponse.json({ amazon: amzOffers, ebay: ebayResults })
}
