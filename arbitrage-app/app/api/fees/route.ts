import { NextResponse } from 'next/server'
import { estimateFees } from '@/app/lib/spapi/fees'
import { estimateEbayFees } from '@/app/lib/ebay/fees'
import { estimateSyncFees } from '@/app/lib/fees'
import type { FeeModel } from '@/app/lib/marketplaces'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { provider, id, price, model, category } = await req.json() as {
    provider?: 'amazon' | 'ebay'; id?: string; price: number; model?: FeeModel; category?: string
  }
  if (!price || price <= 0) return NextResponse.json({ error: 'price required' }, { status: 400 })

  if (provider === 'amazon' && id) {
    const fees = await estimateFees(id, price)
    return NextResponse.json({ fees })
  }
  if (provider === 'ebay') {
    const fees = estimateEbayFees(price, category)
    return NextResponse.json({ fees })
  }
  if (model) {
    const fees = estimateSyncFees(model, price, { category })
    return NextResponse.json({ fees })
  }
  return NextResponse.json({ error: 'provider or model required' }, { status: 400 })
}
