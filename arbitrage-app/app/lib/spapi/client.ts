import { CONFIG } from '../region'

let cached: { token: string; expires: number } | null = null

export async function lwaToken(): Promise<string> {
  const now = Date.now()
  if (cached && cached.expires > now + 30_000) return cached.token

  const clientId = process.env.LWA_CLIENT_ID
  const clientSecret = process.env.LWA_CLIENT_SECRET
  const refreshToken = process.env.SP_API_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('SP-API credentials missing (LWA_CLIENT_ID / LWA_CLIENT_SECRET / SP_API_REFRESH_TOKEN)')
  }

  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) throw new Error(`LWA token ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cached = { token: data.access_token, expires: now + data.expires_in * 1000 - 60_000 }
  return data.access_token
}

export async function spFetch(path: string, init: RequestInit = {}, attempt = 0): Promise<Response> {
  const token = await lwaToken()
  const url = `https://${CONFIG.amazon.endpoint}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'x-amz-access-token': token,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (res.status === 429 && attempt < 3) {
    const retry = Number(res.headers.get('retry-after') || '1') * 1000
    await new Promise(r => setTimeout(r, retry * (attempt + 1)))
    return spFetch(path, init, attempt + 1)
  }
  return res
}
