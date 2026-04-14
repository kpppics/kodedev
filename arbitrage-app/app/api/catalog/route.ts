import { NextResponse } from 'next/server'
import { lookupByIdentifier } from '@/app/lib/spapi/catalog'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('identifier')
  if (!id) return NextResponse.json({ error: 'identifier required' }, { status: 400 })
  try {
    const item = await lookupByIdentifier(id)
    return NextResponse.json({ item })
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 })
  }
}
