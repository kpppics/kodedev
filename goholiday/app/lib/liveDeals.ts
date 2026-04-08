// Thin client helpers that call our /api routes and fall back to the mock
// generator if the upstream returns nothing or errors. This keeps the UI
// working during local dev (no env vars) and gracefully degrades if a
// search has no live inventory.

import type { StayDeal, FlightDeal } from './mockDeals'
import { generateStays, generateFlights } from './mockDeals'
import type { SearchParams, StayCategory } from './providers'

function baseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function fetchStays(p: SearchParams, category: StayCategory): Promise<StayDeal[]> {
  try {
    const url = new URL('/api/hotels', baseUrl())
    url.searchParams.set('location', p.destination)
    url.searchParams.set('checkIn', p.checkIn)
    url.searchParams.set('checkOut', p.checkOut)
    url.searchParams.set('adults', String(p.adults))
    url.searchParams.set('currency', 'gbp')
    url.searchParams.set('limit', '30')

    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error('hotels fetch failed')
    const body = (await res.json()) as { deals?: StayDeal[] }
    const live = body.deals || []

    if (live.length === 0) return generateStays(p, category)

    if (category === 'all') return live
    const targetKind =
      category === 'hotels' ? 'hotel'
      : category === 'apartments' ? 'apartment'
      : category === 'villas' ? 'villa'
      : 'house'
    const filtered = live.filter((d) => d.kind === targetKind)
    return filtered.length > 0 ? filtered : live
  } catch {
    return generateStays(p, category)
  }
}

export async function fetchFlights(p: SearchParams): Promise<FlightDeal[]> {
  try {
    const url = new URL('/api/flights', baseUrl())
    url.searchParams.set('origin', p.origin || 'London')
    url.searchParams.set('destination', p.destination)
    url.searchParams.set('departure_at', p.checkIn)
    url.searchParams.set('return_at', p.checkOut)
    url.searchParams.set('adults', String(p.adults))
    url.searchParams.set('currency', 'gbp')
    url.searchParams.set('limit', '20')

    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error('flights fetch failed')
    const body = (await res.json()) as { deals?: FlightDeal[] }
    const live = body.deals || []
    return live.length > 0 ? live : generateFlights(p)
  } catch {
    return generateFlights(p)
  }
}
