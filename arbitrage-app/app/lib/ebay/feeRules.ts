import type { Region } from '../region'

export interface FeeRule {
  categoryMatch?: RegExp
  fvfRate: number         // final value fee % (includes managed payments since 2021)
  fixedPerOrder: number   // per-order fixed fee
}

export const EBAY_FEE_RULES: Record<Region, FeeRule[]> = {
  uk: [
    { categoryMatch: /watch/i, fvfRate: 0.05, fixedPerOrder: 0.30 },
    { categoryMatch: /sneaker|trainer/i, fvfRate: 0.08, fixedPerOrder: 0.30 },
    { categoryMatch: /book|media|dvd|cd|vinyl/i, fvfRate: 0.1535, fixedPerOrder: 0.30 },
    { fvfRate: 0.128, fixedPerOrder: 0.30 }, // default
  ],
  us: [
    { categoryMatch: /sneaker/i, fvfRate: 0.08, fixedPerOrder: 0 },
    { categoryMatch: /watch/i, fvfRate: 0.15, fixedPerOrder: 0.30 },
    { categoryMatch: /book|media|dvd|cd|vinyl/i, fvfRate: 0.1495, fixedPerOrder: 0.30 },
    { fvfRate: 0.1325, fixedPerOrder: 0.30 },
  ],
}

export function feeRuleFor(region: Region, categoryPath?: string): FeeRule {
  const rules = EBAY_FEE_RULES[region]
  for (const r of rules) {
    if (r.categoryMatch && categoryPath && r.categoryMatch.test(categoryPath)) return r
  }
  return rules[rules.length - 1]
}
