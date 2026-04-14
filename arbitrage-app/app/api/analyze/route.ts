import { NextResponse } from 'next/server'
import { analyze, type AnalyzeInput } from '@/app/lib/analyze'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: AnalyzeInput
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad JSON' }, { status: 400 }) }
  if (!body.identifier) return NextResponse.json({ error: 'identifier required' }, { status: 400 })
  try {
    const result = await analyze(body)
    return NextResponse.json({ result })
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 })
  }
}
