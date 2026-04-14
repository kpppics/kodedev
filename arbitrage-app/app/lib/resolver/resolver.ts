import { matchMarketplace } from '../marketplaces'
import type { ResolvedProduct } from '../adapters/jsonld'
import { resolveJsonLd } from '../adapters/jsonld'
import { resolveBestBuy } from '../adapters/bestbuy'
import { resolveWalmart } from '../adapters/walmart'
import { resolveMercari } from '../adapters/mercari'
import { resolveVinted } from '../adapters/vinted'

export type { ResolvedProduct } from '../adapters/jsonld'

export async function resolveUrl(url: string): Promise<ResolvedProduct | null> {
  const m = matchMarketplace(url)
  let out: ResolvedProduct | null = null
  switch (m?.adapter) {
    case 'bestbuy': out = await resolveBestBuy(url); break
    case 'walmart': out = await resolveWalmart(url); break
    case 'mercari': out = await resolveMercari(url); break
    case 'vinted':  out = await resolveVinted(url); break
    default:        out = await resolveJsonLd(url)
  }
  if (out && m && !out.sourceName) out.sourceName = m.name
  return out
}

export function detectIdentifierType(s: string): 'upc' | 'ean' | 'isbn' | 'asin' | 'url' | 'ebayId' | 'unknown' {
  const trimmed = s.trim()
  if (/^https?:\/\//i.test(trimmed)) return 'url'
  if (/^[A-Z0-9]{10}$/i.test(trimmed) && /[A-Z]/i.test(trimmed)) return 'asin'
  if (/^\d{12}$/.test(trimmed)) return 'upc'
  if (/^97[89]\d{10}$/.test(trimmed)) return 'isbn'
  if (/^\d{9}[\dX]$/i.test(trimmed)) return 'isbn'
  if (/^\d{13}$/.test(trimmed)) return 'ean'
  if (/^\d{11,14}$/.test(trimmed)) return 'ebayId'
  return 'unknown'
}
