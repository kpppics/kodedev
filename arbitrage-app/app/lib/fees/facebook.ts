// Facebook Marketplace: local pickup = 0% seller fee. Shipping sales = 5% (min $0.40).
export function facebookFees(price: number, shipped = false): number {
  if (!shipped) return 0
  return Math.max(0.40, price * 0.05)
}
