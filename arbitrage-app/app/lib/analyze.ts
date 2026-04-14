import { CONFIG, REGION } from './region'
import { lookupByIdentifier } from './spapi/catalog'
import { getItemOffers } from './spapi/pricing'
import { estimateFees } from './spapi/fees'
import { searchCombined, ebaySearchUrl } from './ebay/browse'
import { estimateEbayFees } from './ebay/fees'
import { computeArbitrage } from './math'

export type Provider = 'amazon' | 'ebay'

export interface AnalyzeInput {
  identifier: string         // UPC/EAN/ASIN/eBay title query
  sourceCost: number
  sourceProvider: Provider | 'retail'
  targetProvider: Provider
  shipIn?: number
  shipOut?: number
  prep?: number
  vatRegistered?: boolean
  targetRoi?: number
  sourceUrl?: string
}

export interface AnalyzeOutput {
  identifier: string
  title?: string
  image?: string
  target: Provider
  targetPrice: number
  targetFees: number
  feeBreakdown: Record<string, number>
  buyBoxInfo?: { offerCount: number; fbaOfferCount: number; amazonOnListing: boolean; lowestPrice: number | null }
  ebayInfo?: { activeMedian: number; soldMedian: number; soldP25: number; soldP75: number; listingCount: number; soldCount: number }
  profit: number
  roi: number
  margin: number
  maxBuyPrice: number
  netRevenue: number
  buyUrl?: string
  sellUrl?: string
  lowCompetition?: boolean
  region: typeof REGION
}

export async function analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const { identifier, targetProvider } = input
  const targetRoi = input.targetRoi ?? 0.30

  let title: string | undefined
  let image: string | undefined
  let targetPrice = 0
  let targetFees = 0
  const feeBreakdown: Record<string, number> = {}

  let buyBoxInfo: AnalyzeOutput['buyBoxInfo']
  let ebayInfo: AnalyzeOutput['ebayInfo']
  let sellUrl: string | undefined

  // Amazon lookup — always get catalog if the identifier supports it
  const isAsinLike = /^[A-Z0-9]{10}$/i.test(identifier) || /^\d{12,13}$/.test(identifier)
  let asin: string | undefined
  if (isAsinLike) {
    try {
      const cat = await lookupByIdentifier(identifier)
      if (cat) {
        title = cat.title
        image = cat.image
        asin = cat.asin
      }
    } catch { /* continue */ }
  }

  if (targetProvider === 'amazon' && asin) {
    const [offers] = await getItemOffers([asin])
    const price = offers?.buyBoxPrice ?? offers?.lowestNewPrice ?? 0
    if (price) {
      targetPrice = price
      const fees = await estimateFees(asin, price)
      targetFees = fees.totalFees
      feeBreakdown.referral = fees.referralFee
      feeBreakdown.fulfilment = fees.fulfilmentFee
      feeBreakdown.closing = fees.closingFee
      buyBoxInfo = {
        offerCount: offers.offerCount,
        fbaOfferCount: offers.fbaOfferCount,
        amazonOnListing: offers.amazonOnListing,
        lowestPrice: offers.lowestNewPrice,
      }
    }
    sellUrl = `https://www.${CONFIG.amazon.host}/dp/${asin}`
  }

  if (targetProvider === 'ebay' || !asin || targetPrice === 0) {
    // Use eBay as the target when Amazon lookup failed or target is explicitly eBay
    const q = title || identifier
    const combined = await searchCombined(q, 20)
    if (targetProvider === 'ebay') {
      // Prefer sold median if available, else active median
      const price = combined.soldMedian > 0 ? combined.soldMedian : combined.activeMedian
      targetPrice = price
      const fees = estimateEbayFees(price)
      targetFees = fees.totalFees
      feeBreakdown.fvf = fees.finalValueFee
      feeBreakdown.fixed = fees.fixedPerOrder
      sellUrl = ebaySearchUrl(q)
    }
    ebayInfo = {
      activeMedian: combined.activeMedian,
      soldMedian: combined.soldMedian,
      soldP25: combined.soldP25,
      soldP75: combined.soldP75,
      listingCount: combined.active.length,
      soldCount: combined.sold.length,
    }
  }

  const calc = computeArbitrage({
    price: targetPrice,
    sourceCost: input.sourceCost,
    shipIn: input.shipIn,
    shipOut: targetProvider === 'ebay' ? (input.shipOut ?? 0) : 0,
    prep: input.prep,
    platformFees: targetFees,
    vatRegistered: input.vatRegistered,
    targetRoi,
    region: REGION,
  })

  return {
    identifier,
    title,
    image,
    target: targetProvider,
    targetPrice,
    targetFees,
    feeBreakdown,
    buyBoxInfo,
    ebayInfo,
    profit: calc.profit,
    roi: calc.roi,
    margin: calc.margin,
    maxBuyPrice: calc.maxBuyPrice,
    netRevenue: calc.netRevenue,
    buyUrl: input.sourceUrl,
    sellUrl,
    lowCompetition: buyBoxInfo ? (buyBoxInfo.fbaOfferCount <= 3 && !buyBoxInfo.amazonOnListing) : undefined,
    region: REGION,
  }
}
