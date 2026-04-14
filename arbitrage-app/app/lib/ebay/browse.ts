import { CONFIG, USE_MOCK } from '../region'
import { ebayHost, ebayToken } from './client'
import { mockEbaySearch } from './mock'
import type { EbayListing, EbaySearchResult } from './types'
import { stats } from '../math'

export async function searchActive(query: string, limit = 25): Promise<EbayListing[]> {
  if (USE_MOCK) return mockEbaySearch(query, limit).active

  const token = await ebayToken()
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    filter: 'conditions:{NEW|USED|UNSPECIFIED},buyingOptions:{FIXED_PRICE|AUCTION}',
  })
  const res = await fetch(`https://${ebayHost()}/buy/browse/v1/item_summary/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': CONFIG.ebay.marketplace,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.itemSummaries || []).map((i: {
    itemId: string; title: string; price?: { value: string; currency: string };
    condition?: string; image?: { imageUrl: string }; itemWebUrl: string;
    leafCategoryIds?: string[]; categoryPath?: string;
  }) => ({
    itemId: i.itemId,
    title: i.title,
    price: Number(i.price?.value || 0),
    currency: i.price?.currency || CONFIG.currency,
    condition: i.condition,
    image: i.image?.imageUrl,
    url: i.itemWebUrl,
    categoryId: i.leafCategoryIds?.[0],
    categoryPath: i.categoryPath,
  }))
}

export async function searchSold(query: string, limit = 25): Promise<EbayListing[]> {
  if (USE_MOCK) return mockEbaySearch(query, limit).sold

  // Marketplace Insights API — may require application. Fail silently if not granted.
  try {
    const token = await ebayToken()
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      filter: 'lastSoldDate:[2024-01-01..]',
    })
    const res = await fetch(`https://${ebayHost()}/buy/marketplace_insights/v1_beta/item_sales/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': CONFIG.ebay.marketplace,
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.itemSales || []).map((i: {
      itemId: string; title: string; lastSoldPrice?: { value: string; currency: string };
      condition?: string; image?: { imageUrl: string }; itemWebUrl: string; lastSoldDate?: string;
    }) => ({
      itemId: i.itemId,
      title: i.title,
      price: Number(i.lastSoldPrice?.value || 0),
      currency: i.lastSoldPrice?.currency || CONFIG.currency,
      condition: i.condition,
      image: i.image?.imageUrl,
      url: i.itemWebUrl,
      soldDate: i.lastSoldDate,
    }))
  } catch {
    return []
  }
}

export async function searchCombined(query: string, limit = 25): Promise<EbaySearchResult> {
  const [active, sold] = await Promise.all([searchActive(query, limit), searchSold(query, limit)])
  const aStats = stats(active.map(a => a.price))
  const sStats = stats(sold.map(s => s.price))
  return {
    query,
    total: active.length + sold.length,
    active,
    sold,
    activeMedian: aStats.median,
    soldMedian: sStats.median,
    soldP25: sStats.p25,
    soldP75: sStats.p75,
  }
}

export function ebaySearchUrl(query: string): string {
  return `https://www.${CONFIG.ebay.host}/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`
}
