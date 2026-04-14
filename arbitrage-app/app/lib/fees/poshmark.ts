// Poshmark: flat $2.95 for sales < $15; 20% for sales ≥ $15.
export function poshmarkFees(price: number): number {
  if (price < 15) return 2.95
  return price * 0.20
}
