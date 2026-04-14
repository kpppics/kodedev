import { describe, it, expect } from 'vitest'
import { computeArbitrage, stats, round2 } from './math'

describe('computeArbitrage', () => {
  it('UK — non-VAT-registered resale on eBay', () => {
    const r = computeArbitrage({
      price: 20,
      sourceCost: 5,
      shipIn: 0,
      shipOut: 2.95,
      prep: 0.5,
      platformFees: 20 * 0.128 + 0.30, // eBay UK FVF
      vatRegistered: false,
      region: 'uk',
      targetRoi: 0.30,
    })
    // netRevenue = 20 - 2.86 - 2.95 = 14.19
    // totalCost = 5 + 0 + 0.5 = 5.5
    // profit ≈ 8.69, ROI ≈ 1.58
    expect(round2(r.netRevenue)).toBeCloseTo(14.19, 1)
    expect(round2(r.profit)).toBeCloseTo(8.69, 1)
    expect(r.roi).toBeGreaterThan(1.5)
  })

  it('UK — VAT-registered: FVF applied on ex-VAT price', () => {
    const price = 24 // inc VAT
    const ex = price / 1.20
    const fees = ex * 0.128 + 0.30
    const r = computeArbitrage({
      price,
      sourceCost: 6,
      platformFees: fees,
      vatRegistered: true,
      region: 'uk',
    })
    // sellExVat = 20, netRevenue = 20 - fees
    expect(r.netRevenue).toBeCloseTo(20 - fees, 2)
  })

  it('US — Amazon with real fee estimate', () => {
    const r = computeArbitrage({
      price: 29.99,
      sourceCost: 8,
      shipIn: 1.5,
      prep: 1,
      platformFees: 29.99 * 0.15 + 3.22, // referral + FBA small-standard
      region: 'us',
    })
    expect(r.profit).toBeGreaterThan(0)
    expect(r.totalCost).toBeCloseTo(10.5, 2)
  })

  it('maxBuyPrice back-solves for target ROI', () => {
    const r = computeArbitrage({
      price: 20,
      sourceCost: 0,
      platformFees: 3,
      targetRoi: 0.30,
      region: 'uk',
    })
    // netRevenue = 17, maxBuy = 17 / 1.30 ≈ 13.08
    expect(round2(r.maxBuyPrice)).toBeCloseTo(13.08, 1)
  })
})

describe('stats', () => {
  it('returns zeros on empty', () => {
    const s = stats([])
    expect(s.count).toBe(0)
    expect(s.median).toBe(0)
  })
  it('computes quartiles on sample', () => {
    const s = stats([5, 10, 15, 20, 25, 30, 35, 40])
    expect(s.count).toBe(8)
    expect(s.median).toBeGreaterThan(15)
    expect(s.median).toBeLessThan(30)
    expect(s.min).toBe(5)
    expect(s.max).toBe(40)
  })
})
