import { CONFIG, type Region, REGION_CONFIG } from './region'

export interface ArbitrageInput {
  price: number                 // target-marketplace sell price
  sourceCost: number            // what you pay to buy it
  shipIn?: number               // inbound shipping (to you or to FBA)
  shipOut?: number              // outbound shipping (to buyer) if FBM / eBay
  prep?: number                 // prep labour / packaging cost
  platformFees: number          // real fees for the target marketplace
  vatRegistered?: boolean       // UK only — if true, FVF/referral is on ex-VAT
  targetRoi?: number            // e.g. 0.30 → used by maxBuyPrice
  region?: Region
}

export interface ArbitrageOutput {
  netRevenue: number
  totalCost: number
  profit: number
  roi: number
  margin: number
  breakEven: number
  maxBuyPrice: number
}

export function computeArbitrage(input: ArbitrageInput): ArbitrageOutput {
  const region = input.region ?? 'uk'
  const cfg = REGION_CONFIG[region] ?? CONFIG
  const shipIn = input.shipIn ?? 0
  const shipOut = input.shipOut ?? 0
  const prep = input.prep ?? 0
  const targetRoi = input.targetRoi ?? 0.30

  const sellExVat = cfg.vat.enabled && input.vatRegistered
    ? input.price / (1 + cfg.vat.rate)
    : input.price

  const netRevenue = sellExVat - input.platformFees - shipOut
  const totalCost = input.sourceCost + shipIn + prep
  const profit = netRevenue - totalCost
  const roi = totalCost > 0 ? profit / totalCost : 0
  const margin = input.price > 0 ? profit / input.price : 0
  const breakEven = totalCost + input.platformFees + shipOut
  const maxBuyPrice = Math.max(0, (netRevenue - shipIn - prep) / (1 + targetRoi))

  return { netRevenue, totalCost, profit, roi, margin, breakEven, maxBuyPrice }
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function pct(n: number): string {
  if (!Number.isFinite(n)) return '–'
  return `${(n * 100).toFixed(1)}%`
}

export interface CompsStats {
  count: number
  median: number
  p25: number
  p75: number
  min: number
  max: number
}

export function stats(prices: number[]): CompsStats {
  const clean = prices.filter(p => Number.isFinite(p) && p > 0).sort((a, b) => a - b)
  const n = clean.length
  if (n === 0) return { count: 0, median: 0, p25: 0, p75: 0, min: 0, max: 0 }
  const q = (f: number) => clean[Math.min(n - 1, Math.max(0, Math.floor(f * (n - 1))))]
  return {
    count: n,
    median: q(0.5),
    p25: q(0.25),
    p75: q(0.75),
    min: clean[0],
    max: clean[n - 1],
  }
}
