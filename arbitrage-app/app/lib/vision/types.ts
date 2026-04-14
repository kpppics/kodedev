export interface ThriftIdentification {
  title: string
  brand: string | null
  model: string | null
  category: string
  searchTerms: string[]
  visibleText: string[]
  confidence: 'high' | 'medium' | 'low'
}

export interface ThriftResponse {
  identification: ThriftIdentification
  comps: {
    activeCount: number
    soldCount: number
    soldMedian: number
    soldP25: number
    soldP75: number
    sampleListings: Array<{ title: string; price: number; image?: string; url: string; soldDate?: string }>
  }
  valuation: { lowEnd: number; median: number; highEnd: number }
  profit: { atMedian: number; atLowEnd: number; roiAtMedian: number }
  buyLinks: { ebaySearchUrl: string }
  askingPrice: number
}
