export interface CatalogItem {
  asin: string
  title: string
  brand?: string
  upc?: string
  image?: string
  category?: string
}

export interface PricingOffer {
  asin: string
  buyBoxPrice: number | null
  lowestNewPrice: number | null
  offerCount: number
  fbaOfferCount: number
  amazonOnListing: boolean
  currency: string
}

export interface FeesEstimate {
  asin: string
  price: number
  referralFee: number
  fulfilmentFee: number
  closingFee: number
  totalFees: number
  currency: string
}
