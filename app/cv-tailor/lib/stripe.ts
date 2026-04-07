// --------------------------------------------------------------
// Stripe client for CV Tailor AI.
// Using Stripe Checkout (hosted page) so we never touch card
// details directly — cleanest PCI story for a simple one-off £5
// purchase.
// --------------------------------------------------------------
import Stripe from 'stripe'

// Price in pence. £5.00 = 500.
export const CV_PRICE_PENCE = 500
export const CV_CURRENCY = 'gbp'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  // Use the SDK's bundled default API version so we stay in sync
  // with the stripe package we pinned in package.json.
  _stripe = new Stripe(key)
  return _stripe
}

/**
 * Returns `true` if the given Checkout Session is fully paid.
 * The success page calls this before handing the form data to
 * Claude so users can't skip payment by hitting the URL directly.
 */
export async function isSessionPaid(sessionId: string): Promise<boolean> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return session.payment_status === 'paid'
}
