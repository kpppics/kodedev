import type { ResolvedProduct } from './jsonld'
import { resolveJsonLd } from './jsonld'

// Walmart doesn't expose a public shopper product API. We default to JSON-LD
// which works on their product pages via embedded schema.org data.
export async function resolveWalmart(url: string): Promise<ResolvedProduct | null> {
  const out = await resolveJsonLd(url)
  if (out) out.sourceName = 'Walmart'
  return out
}
