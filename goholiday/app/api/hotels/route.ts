import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/hotels — Hotellook was shut down by Travelpayouts on 20 Oct 2025
 * so there is no direct Travelpayouts hotel inventory API any more. This
 * route returns an empty result so the client can fall back to mock data
 * (which still deep-links to Booking/Airbnb/Vrbo/Expedia with full search
 * parameters pre-filled).
 *
 * To return real live hotel data, swap this route's upstream to one of:
 *   - LiteAPI (liteapi.travel) — 2M+ hotels, 20% commission
 *   - Amadeus Hotel Search (developers.amadeus.com)
 *   - RapidAPI Booking.com scrapers (against TOS, not recommended)
 *   - Booking.com Affiliate Partner API (requires partner approval)
 */

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location') || ''

  return NextResponse.json({
    deals: [],
    notice:
      'Travelpayouts closed the Hotellook API on 20 Oct 2025. Falling back to deep-link mode.',
    requested: { location },
  })
}
