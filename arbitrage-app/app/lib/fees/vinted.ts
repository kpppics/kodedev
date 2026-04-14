// Vinted: buyer-protection fee is paid by buyer, so seller fees are effectively zero.
// Return 0 to reflect the typical seller economics.
export function vintedFees(_price: number): number {
  return 0
}
