// POST /api/cv-tailor/checkout
// ---------------------------------------------------------------
// Creates a Stripe Checkout Session for a £5 CV generation and
// returns the hosted-checkout URL to the client. The client then
// redirects the browser there.
// ---------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server'
import {
  getStripe,
  CV_PRICE_PENCE,
  CV_CURRENCY,
} from '@/app/cv-tailor/lib/stripe'

// Tell Next this route should run in the Node.js runtime — the
// Stripe SDK is not edge-compatible.
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing email or name' },
        { status: 400 },
      )
    }

    const stripe = getStripe()
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      req.nextUrl.origin // fallback if env var not set

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: CV_CURRENCY,
            product_data: {
              name: 'CV Tailor AI — Tailored CV',
              description:
                'One ATS-optimised CV tailored to your target job description.',
            },
            unit_amount: CV_PRICE_PENCE,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      // Stripe will replace {CHECKOUT_SESSION_ID} automatically.
      success_url: `${appUrl}/cv-tailor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cv-tailor/cancel`,
      metadata: {
        product: 'cv-tailor-ai',
        candidate_name: String(name).slice(0, 200),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[cv-tailor/checkout] error', err)
    const message =
      err instanceof Error ? err.message : 'Unknown checkout error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
