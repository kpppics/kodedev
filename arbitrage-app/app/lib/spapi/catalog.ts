import { CONFIG, USE_MOCK } from '../region'
import { spFetch } from './client'
import { mockCatalog } from './mock'
import type { CatalogItem } from './types'

export async function lookupByIdentifier(identifier: string): Promise<CatalogItem | null> {
  if (USE_MOCK) return mockCatalog(identifier)

  // ASIN pattern: 10 chars alphanumeric starting with B or digit
  const isAsin = /^[A-Z0-9]{10}$/i.test(identifier)
  const path = isAsin
    ? `/catalog/2022-04-01/items/${identifier}?marketplaceIds=${CONFIG.amazon.marketplaceId}&includedData=attributes,images,identifiers,summaries`
    : `/catalog/2022-04-01/items?marketplaceIds=${CONFIG.amazon.marketplaceId}&identifiers=${identifier}&identifiersType=UPC&includedData=attributes,images,identifiers,summaries`

  const res = await spFetch(path)
  if (!res.ok) return null
  const data = await res.json()
  const item = isAsin ? data : data.items?.[0]
  if (!item) return null

  const summary = item.summaries?.[0] || {}
  const image = item.images?.[0]?.images?.[0]?.link
  const upc = item.identifiers?.[0]?.identifiers?.find((i: { identifierType: string }) => i.identifierType === 'UPC')?.identifier

  return {
    asin: item.asin,
    title: summary.itemName || 'Unknown',
    brand: summary.brand,
    upc,
    image,
    category: summary.browseClassification?.displayName,
  }
}
