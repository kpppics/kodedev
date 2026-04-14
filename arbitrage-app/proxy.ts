import { NextRequest, NextResponse } from 'next/server'

// HTTP Basic Auth gate. Disabled if AUTH_USER/AUTH_PASS not set.
// Exempts /api/share so iOS share-sheet POSTs still land (they can't carry auth headers).
export function proxy(req: NextRequest) {
  const user = process.env.AUTH_USER
  const pass = process.env.AUTH_PASS
  if (!user || !pass) return NextResponse.next()

  const { pathname } = req.nextUrl
  if (pathname === '/api/share') return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.startsWith('/icons') ||
      pathname === '/manifest.webmanifest' || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded)
        const [u, ...rest] = decoded.split(':')
        const p = rest.join(':')
        if (u === user && p === pass) return NextResponse.next()
      } catch { /* fall through */ }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Arbitrage", charset="UTF-8"' },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest).*)'],
}
