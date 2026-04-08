import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/hotels — proxies Hotellook's cache endpoint and normalises
 * the response into goholiday's StayDeal shape. Does a lookup.json call
 * first to resolve the city to a stable locationId, which is far more
 * reliable than raw city names for the cache endpoint.
 *
 * Click-through links carry NEXT_PUBLIC_TRAVELPAYOUTS_MARKER so every
 * booking earns commission.
 */

export const runtime = 'nodejs'
export const revalidate = 300

interface LookupLocation {
  id: string
  cityName?: string
  fullName?: string
  locationName?: string
  countryName?: string
}

interface LookupResponse {
  status?: string
  results?: {
    locations?: LookupLocation[]
  }
}

interface HotellookHotel {
  hotelId: number
  hotelName: string
  location?: { name?: string; country?: string }
  stars?: number
  priceFrom?: number
  priceAvg?: number
}

const PERKS_BY_STARS: Record<number, string[]> = {
  5: ['5★ luxury', 'Best rate guarantee', 'Free cancellation'],
  4: ['4★ rated', 'Multi-provider price', 'Free cancellation'],
  3: ['3★ rated', 'Best rate guarantee', 'Instant confirmation'],
  2: ['Budget pick', 'Free cancellation', 'Best price'],
  1: ['Great value', 'Instant booking', 'Best price'],
}

async function lookupLocationId(query: string, token: string): Promise<string | null> {
  try {
    const url = new URL('https://engine.hotellook.com/api/v2/lookup.json')
    url.searchParams.set('query', query)
    url.searchParams.set('lang', 'en')
    url.searchParams.set('lookFor', 'city')
    url.searchParams.set('limit', '1')
    if (token) url.searchParams.set('token', token)

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json', 'User-Agent': 'goholiday/1.0' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const body: LookupResponse = await res.json()
    const loc = body.results?.locations?.[0]
    return loc?.id ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const location = (searchParams.get('location') || '').trim() || 'London'
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const adults = Math.max(1, Number(searchParams.get('adults') || '2'))
  const currency = (searchParams.get('currency') || 'gbp').toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit') || '30'), 50)
  const token = process.env.TRAVELPAYOUTS_TOKEN || ''
  const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || ''

  if (!checkIn || !checkOut) {
    return NextResponse.json({ deals: [], error: 'checkIn and checkOut required' })
  }

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  )

  const cityQuery = location.split(',')[0].trim()

  // Step 1: resolve city -> locationId (more reliable than raw names)
  const locationId = await lookupLocationId(cityQuery, token)

  // Step 2: fetch cached prices. cache.json does NOT accept `adults`;
  // passing it can trigger a 404. Pair with either locationId or location.
  const upstream = new URL('https://engine.hotellook.com/api/v2/cache.json')
  if (locationId) {
    upstream.searchParams.set('locationId', locationId)
  } else {
    upstream.searchParams.set('location', cityQuery)
  }
  upstream.searchParams.set('currency', currency)
  upstream.searchParams.set('checkIn', checkIn)
  upstream.searchParams.set('checkOut', checkOut)
  upstream.searchParams.set('limit', String(limit))
  if (token) upstream.searchParams.set('token', token)

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: 'application/json', 'User-Agent': 'goholiday/1.0' },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return NextResponse.json({
        deals: [],
        error: `Hotellook ${res.status}`,
        debug: { upstream: upstream.toString().replace(token, 'REDACTED'), locationId },
      })
    }
    const rows: HotellookHotel[] = await res.json()

    const currencySymbol =
      currency === 'gbp' ? '£' : currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency.toUpperCase()

    const deals = rows
      .filter((h) => (h.priceFrom ?? h.priceAvg ?? 0) > 0)
      .map((h, i) => {
        const priceAvg = h.priceAvg ?? h.priceFrom ?? 0
        const priceFrom = h.priceFrom ?? priceAvg
        const perNight = Math.max(1, Math.round(priceFrom / nights))
        const stars = Math.max(0, Math.min(5, Math.round(h.stars ?? 0)))
        const kind: 'hotel' | 'apartment' | 'villa' | 'house' =
          stars >= 4 ? 'hotel' : stars >= 2 ? 'hotel' : 'apartment'

        const bookingUrl =
          `https://search.hotellook.com/hotels?` +
          `hotelId=${h.hotelId}` +
          `&checkIn=${encodeURIComponent(checkIn)}` +
          `&checkOut=${encodeURIComponent(checkOut)}` +
          `&adults=${adults}` +
          (marker ? `&marker=${marker}` : '')

        const savings = Math.max(
          0,
          priceAvg > priceFrom ? Math.round(((priceAvg - priceFrom) / priceAvg) * 100) : 0,
        )

        return {
          id: `tp-hotel-${h.hotelId}-${i}`,
          kind,
          title: h.hotelName,
          area: h.location?.name || cityQuery,
          image: `https://photo.hotellook.com/image_v2/limit/h${h.hotelId}_1/800/560.auto`,
          rating: +(6.5 + stars * 0.7).toFixed(1),
          reviews: 0,
          pricePerNight: perNight,
          totalPrice: Math.round(priceFrom),
          currency: currencySymbol,
          nights,
          providerId: 'hotellook',
          providerName: 'Hotellook',
          providerColor: '#FF7A00',
          dealUrl: bookingUrl,
          perks: PERKS_BY_STARS[stars] || PERKS_BY_STARS[3],
          savings,
        }
      })

    return NextResponse.json(
      { deals },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  } catch (e) {
    return NextResponse.json({ deals: [], error: String(e) })
  }
}
