import { CONFIG, USE_MOCK } from '../region'
import { spFetch } from './client'
import { mockFees } from './mock'
import type { FeesEstimate } from './types'

export async function estimateFees(asin: string, price: number): Promise<FeesEstimate> {
  if (USE_MOCK) return mockFees(asin, price)

  const body = {
    FeesEstimateRequest: {
      MarketplaceId: CONFIG.amazon.marketplaceId,
      PriceToEstimateFees: {
        ListingPrice: { CurrencyCode: CONFIG.currency, Amount: price },
      },
      Identifier: `${asin}-${Date.now()}`,
      IsAmazonFulfilled: true,
    },
  }

  const res = await spFetch(`/products/fees/v0/items/${asin}/feesEstimate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) return { asin, price, referralFee: 0, fulfilmentFee: 0, closingFee: 0, totalFees: 0, currency: CONFIG.currency }

  const data = await res.json()
  const r = data?.payload?.FeesEstimateResult
  const detail = r?.FeesEstimate?.FeeDetailList || []

  const pick = (type: string): number =>
    Number(detail.find((d: { FeeType: string; FinalFee?: { Amount: number } }) => d.FeeType === type)?.FinalFee?.Amount ?? 0)

  const referralFee = pick('ReferralFee')
  const fulfilmentFee = pick('FBAFees') + pick('FBAPerUnitFulfillmentFee')
  const closingFee = pick('VariableClosingFee')
  const total = Number(r?.FeesEstimate?.TotalFeesEstimate?.Amount ?? referralFee + fulfilmentFee + closingFee)

  return { asin, price, referralFee, fulfilmentFee, closingFee, totalFees: total, currency: CONFIG.currency }
}
