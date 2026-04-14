// Mercari US: 10% selling fee + $0.30 payment processing + 2.9% payment fee.
// Mercari UK closed 2022 — US only now.
export function mercariFees(price: number): number {
  const sellingFee = price * 0.10
  const paymentFee = price * 0.029 + 0.30
  return sellingFee + paymentFee
}
