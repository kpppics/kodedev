import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const form = await req.formData()
  const url = form.get('url') || form.get('text') || form.get('title')
  const str = typeof url === 'string' ? url : ''
  const match = str.match(/https?:\/\/[^\s)]+/)
  const target = match ? match[0] : str
  const destination = `/compare?prefill=${encodeURIComponent(target)}`
  return NextResponse.redirect(new URL(destination, req.url), 303)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const target = url.searchParams.get('url') || url.searchParams.get('text') || ''
  const destination = `/compare?prefill=${encodeURIComponent(target)}`
  return NextResponse.redirect(new URL(destination, req.url), 303)
}
