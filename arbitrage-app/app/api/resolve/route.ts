import { NextResponse } from 'next/server'
import { resolveUrl } from '@/app/lib/resolver/resolver'
import { matchMarketplace } from '@/app/lib/marketplaces'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { url } = await req.json() as { url?: string }
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })
  try {
    const product = await resolveUrl(url)
    const marketplace = matchMarketplace(url)
    return NextResponse.json({ product, marketplace: marketplace ? { id: marketplace.id, name: marketplace.name, country: marketplace.country, kind: marketplace.kind } : null })
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 })
  }
}
