let cached: { token: string; expires: number } | null = null

export async function ebayToken(): Promise<string> {
  const now = Date.now()
  if (cached && cached.expires > now + 30_000) return cached.token

  const id = process.env.EBAY_CLIENT_ID
  const secret = process.env.EBAY_CLIENT_SECRET
  const env = process.env.EBAY_ENV || 'production'
  if (!id || !secret) throw new Error('eBay credentials missing (EBAY_CLIENT_ID / EBAY_CLIENT_SECRET)')

  const host = env === 'sandbox' ? 'api.sandbox.ebay.com' : 'api.ebay.com'
  const basic = Buffer.from(`${id}:${secret}`).toString('base64')

  const res = await fetch(`https://${host}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope',
    }),
  })
  if (!res.ok) throw new Error(`eBay token ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cached = { token: data.access_token, expires: now + data.expires_in * 1000 - 60_000 }
  return data.access_token
}

export function ebayHost(): string {
  return (process.env.EBAY_ENV || 'production') === 'sandbox' ? 'api.sandbox.ebay.com' : 'api.ebay.com'
}
