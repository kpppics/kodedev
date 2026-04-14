import { CONFIG, USE_MOCK } from '../region'
import { spFetch } from './client'
import { mockPricing } from './mock'
import type { PricingOffer } from './types'

export async function getItemOffers(asins: string[]): Promise<PricingOffer[]> {
  if (USE_MOCK) return asins.map(mockPricing)
  if (asins.length === 0) return []

  const body = {
    requests: asins.slice(0, 20).map(asin => ({
      uri: `/products/pricing/v0/items/${asin}/offers`,
      method: 'GET',
      MarketplaceId: CONFIG.amazon.marketplaceId,
      ItemCondition: 'New',
    })),
  }

  const res = await spFetch('/batches/products/pricing/v0/itemOffers', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    // Fall back to per-ASIN calls if batch fails
    return Promise.all(asins.map(singleItemOffer))
  }
  const data = await res.json()
  return (data.responses || []).map(parseOfferResponse)
}

async function singleItemOffer(asin: string): Promise<PricingOffer> {
  const res = await spFetch(`/products/pricing/v0/items/${asin}/offers?MarketplaceId=${CONFIG.amazon.marketplaceId}&ItemCondition=New`)
  if (!res.ok) return emptyOffer(asin)
  const data = await res.json()
  return parseOfferResponse({ body: data })
}

function emptyOffer(asin: string): PricingOffer {
  return { asin, buyBoxPrice: null, lowestNewPrice: null, offerCount: 0, fbaOfferCount: 0, amazonOnListing: false, currency: CONFIG.currency }
}

interface BatchResponse {
  body?: {
    payload?: {
      ASIN?: string
      Summary?: {
        BuyBoxPrices?: Array<{ condition?: string; LandedPrice?: { Amount: number; CurrencyCode: string } }>
        LowestPrices?: Array<{ condition?: string; fulfillmentChannel?: string; LandedPrice?: { Amount: number } }>
        TotalOfferCount?: number
        NumberOfOffers?: Array<{ condition: string; fulfillmentChannel: string; OfferCount: number }>
      }
      Offers?: Array<{ SellerId?: string; IsFulfilledByAmazon?: boolean }>
    }
  }
}

function parseOfferResponse(r: BatchResponse): PricingOffer {
  const payload = r.body?.payload
  if (!payload) return emptyOffer('')
  const summary = payload.Summary || {}
  const buyBox = summary.BuyBoxPrices?.find(p => p.condition === 'New' || !p.condition)
  const lowNew = summary.LowestPrices?.find(p => p.condition === 'New')
  const fbaOffers = summary.NumberOfOffers?.find(n => n.condition === 'New' && n.fulfillmentChannel === 'Amazon')?.OfferCount ?? 0
  const amazonOn = !!payload.Offers?.some(o => o.SellerId === 'ATVPDKIKX0DER' || o.SellerId === 'A3P5ROKL5A1OLE')
  return {
    asin: payload.ASIN || '',
    buyBoxPrice: buyBox?.LandedPrice?.Amount ?? null,
    lowestNewPrice: lowNew?.LandedPrice?.Amount ?? null,
    offerCount: summary.TotalOfferCount ?? 0,
    fbaOfferCount: fbaOffers,
    amazonOnListing: amazonOn,
    currency: buyBox?.LandedPrice?.CurrencyCode || CONFIG.currency,
  }
}
