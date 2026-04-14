import type { FeeModel } from '../marketplaces'
import { REGION } from '../region'
import { estimateEbayFees } from '../ebay/fees'
import { mercariFees } from './mercari'
import { poshmarkFees } from './poshmark'
import { vintedFees } from './vinted'
import { depopFees } from './depop'
import { facebookFees } from './facebook'

export interface FeeEstimate {
  model: FeeModel
  total: number
  breakdown?: Record<string, number>
}

// For Amazon we require the async estimate (SP-API) — so this only covers sync models.
export function estimateSyncFees(model: FeeModel, price: number, ctx?: { category?: string; shipped?: boolean }): FeeEstimate {
  switch (model) {
    case 'ebay': {
      const f = estimateEbayFees(price, ctx?.category)
      return { model, total: f.totalFees, breakdown: { fvf: f.finalValueFee, fixed: f.fixedPerOrder } }
    }
    case 'mercari':  return { model, total: mercariFees(price) }
    case 'poshmark': return { model, total: poshmarkFees(price) }
    case 'vinted':   return { model, total: vintedFees(price) }
    case 'depop':    return { model, total: depopFees(price, REGION) }
    case 'facebook': return { model, total: facebookFees(price, ctx?.shipped) }
    case 'none':
    case 'amazon':
    default:
      return { model, total: 0 }
  }
}
