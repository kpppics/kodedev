// Depop: 10% selling fee (since 2022), plus ~3.3% + £0.20 / $0.30 PayPal-style processing.
export function depopFees(price: number, region: 'uk' | 'us' = 'uk'): number {
  const sellingFee = price * 0.10
  const processing = price * 0.033 + (region === 'uk' ? 0.20 : 0.30)
  return sellingFee + processing
}
