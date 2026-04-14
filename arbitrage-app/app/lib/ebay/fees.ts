import { REGION } from '../region'
import { feeRuleFor } from './feeRules'
import type { EbayFees } from './types'

export function estimateEbayFees(price: number, categoryPath?: string): EbayFees {
  const rule = feeRuleFor(REGION, categoryPath)
  const fvf = price * rule.fvfRate
  return {
    finalValueFee: fvf,
    fixedPerOrder: rule.fixedPerOrder,
    totalFees: fvf + rule.fixedPerOrder,
    categoryId: undefined,
  }
}
