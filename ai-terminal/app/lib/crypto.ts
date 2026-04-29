export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function generateToken(pinHash: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(pinHash))
  const sigArray = Array.from(new Uint8Array(signature))
  return sigArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyToken(token: string, pinHash: string, secret: string): Promise<boolean> {
  const expected = await generateToken(pinHash, secret)
  return token === expected
}
