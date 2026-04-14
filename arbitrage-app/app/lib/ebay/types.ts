export interface EbayListing {
  itemId: string
  title: string
  price: number
  currency: string
  condition?: string
  image?: string
  url: string
  soldDate?: string
  categoryId?: string
  categoryPath?: string
}

export interface EbaySearchResult {
  query: string
  total: number
  active: EbayListing[]
  sold: EbayListing[]
  activeMedian: number
  soldMedian: number
  soldP25: number
  soldP75: number
}

export interface EbayFees {
  finalValueFee: number
  fixedPerOrder: number
  totalFees: number
  categoryId?: string
}
