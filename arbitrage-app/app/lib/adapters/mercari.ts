import type { ResolvedProduct } from './jsonld'
import { resolveJsonLd } from './jsonld'

export async function resolveMercari(url: string): Promise<ResolvedProduct | null> {
  const out = await resolveJsonLd(url)
  if (out) out.sourceName = 'Mercari'
  return out
}
