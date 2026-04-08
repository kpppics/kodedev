import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/flights — proxies Travelpayouts' Aviasales v3 prices_for_dates
 * endpoint. Requires TRAVELPAYOUTS_TOKEN in env. Click-through links carry
 * TRAVELPAYOUTS_MARKER so bookings earn commission.
 */

export const runtime = 'nodejs'
export const revalidate = 300

interface AviasalesFlight {
  origin: string
  destination: string
  origin_airport: string
  destination_airport: string
  price: number
  airline: string
  flight_number: string
  departure_at: string
  return_at?: string
  transfers: number
  return_transfers?: number
  duration: number
  duration_to?: number
  duration_back?: number
  link: string
}

const AIRLINES: Record<string, { name: string; color: string }> = {
  BA: { name: 'British Airways', color: '#075AAA' },
  FR: { name: 'Ryanair', color: '#073590' },
  U2: { name: 'easyJet', color: '#FF6600' },
  LH: { name: 'Lufthansa', color: '#05164D' },
  AF: { name: 'Air France', color: '#002157' },
  KL: { name: 'KLM', color: '#00A1DE' },
  EK: { name: 'Emirates', color: '#D71921' },
  QR: { name: 'Qatar Airways', color: '#5C0632' },
  TK: { name: 'Turkish Airlines', color: '#E81932' },
  W6: { name: 'Wizz Air', color: '#C6007E' },
  VY: { name: 'Vueling', color: '#FFCC00' },
  IB: { name: 'Iberia', color: '#D7192D' },
  AY: { name: 'Finnair', color: '#0A2973' },
  SK: { name: 'SAS', color: '#003E7E' },
  LX: { name: 'Swiss', color: '#E30614' },
  OS: { name: 'Austrian', color: '#DC0000' },
  DL: { name: 'Delta', color: '#E31837' },
  UA: { name: 'United', color: '#002244' },
  AA: { name: 'American Airlines', color: '#C41E3A' },
  SU: { name: 'Aeroflot', color: '#00256B' },
  TP: { name: 'TAP Portugal', color: '#00A859' },
  EI: { name: 'Aer Lingus', color: '#00845C' },
  JU: { name: 'Air Serbia', color: '#004B85' },
  PC: { name: 'Pegasus', color: '#FFC20E' },
  MS: { name: 'EgyptAir', color: '#00508E' },
  AC: { name: 'Air Canada', color: '#D82F2C' },
  NH: { name: 'ANA', color: '#13448F' },
  JL: { name: 'Japan Airlines', color: '#E60000' },
  SQ: { name: 'Singapore Airlines', color: '#F99F1C' },
}

const CITY_TO_IATA: Record<string, string> = {
  london: 'LON',
  paris: 'PAR',
  rome: 'ROM',
  madrid: 'MAD',
  barcelona: 'BCN',
  lisbon: 'LIS',
  amsterdam: 'AMS',
  berlin: 'BER',
  munich: 'MUC',
  vienna: 'VIE',
  prague: 'PRG',
  warsaw: 'WAW',
  budapest: 'BUD',
  zurich: 'ZRH',
  geneva: 'GVA',
  brussels: 'BRU',
  copenhagen: 'CPH',
  stockholm: 'STO',
  oslo: 'OSL',
  helsinki: 'HEL',
  dublin: 'DUB',
  edinburgh: 'EDI',
  manchester: 'MAN',
  athens: 'ATH',
  istanbul: 'IST',
  dubai: 'DXB',
  doha: 'DOH',
  'abu dhabi': 'AUH',
  bangkok: 'BKK',
  'hong kong': 'HKG',
  tokyo: 'TYO',
  seoul: 'SEL',
  singapore: 'SIN',
  'kuala lumpur': 'KUL',
  'new york': 'NYC',
  'los angeles': 'LAX',
  miami: 'MIA',
  'san francisco': 'SFO',
  chicago: 'CHI',
  toronto: 'YTO',
  vancouver: 'YVR',
  sydney: 'SYD',
  melbourne: 'MEL',
  auckland: 'AKL',
  bali: 'DPS',
  phuket: 'HKT',
  maldives: 'MLE',
  mallorca: 'PMI',
  ibiza: 'IBZ',
  tenerife: 'TFS',
  'gran canaria': 'LPA',
  lanzarote: 'ACE',
  malaga: 'AGP',
  alicante: 'ALC',
  valencia: 'VLC',
  seville: 'SVQ',
  bilbao: 'BIO',
  nice: 'NCE',
  marseille: 'MRS',
  bordeaux: 'BOD',
  toulouse: 'TLS',
  lyon: 'LYS',
  venice: 'VCE',
  milan: 'MIL',
  naples: 'NAP',
  florence: 'FLR',
  bologna: 'BLQ',
  palermo: 'PMO',
  catania: 'CTA',
  marrakech: 'RAK',
  casablanca: 'CAS',
  cairo: 'CAI',
  'cape town': 'CPT',
  johannesburg: 'JNB',
  cancun: 'CUN',
  orlando: 'MCO',
  'las vegas': 'LAS',
  boston: 'BOS',
  washington: 'WAS',
  reykjavik: 'REK',
  'tel aviv': 'TLV',
}

function cityToIata(city: string): string {
  const key = city.toLowerCase().split(',')[0].trim()
  return CITY_TO_IATA[key] || key.slice(0, 3).toUpperCase()
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export async function GET(req: NextRequest) {
  const token = process.env.TRAVELPAYOUTS_TOKEN
  const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || ''
  if (!token) {
    return NextResponse.json({ deals: [], error: 'Missing TRAVELPAYOUTS_TOKEN' })
  }

  const { searchParams } = new URL(req.url)
  const origin = cityToIata(searchParams.get('origin') || 'London')
  const destination = cityToIata(searchParams.get('destination') || 'Barcelona')
  const departure_at = searchParams.get('departure_at') || ''
  const return_at = searchParams.get('return_at') || ''
  const adults = Math.max(1, Number(searchParams.get('adults') || '1'))
  const currency = (searchParams.get('currency') || 'gbp').toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit') || '20'), 30)

  const upstream = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
  upstream.searchParams.set('origin', origin)
  upstream.searchParams.set('destination', destination)
  if (departure_at) upstream.searchParams.set('departure_at', departure_at)
  if (return_at) upstream.searchParams.set('return_at', return_at)
  upstream.searchParams.set('unique', 'false')
  upstream.searchParams.set('sorting', 'price')
  upstream.searchParams.set('direct', 'false')
  upstream.searchParams.set('currency', currency)
  upstream.searchParams.set('limit', String(limit))
  upstream.searchParams.set('token', token)

  try {
    const res = await fetch(upstream.toString(), {
      headers: { 'X-Access-Token': token, Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`Aviasales ${res.status}`)
    const body = (await res.json()) as { success?: boolean; data?: AviasalesFlight[] }
    const flights = body.data || []

    const currencySymbol = currency === 'gbp' ? '£' : currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency.toUpperCase()

    const deals = flights.map((f, i) => {
      const airline = AIRLINES[f.airline] || { name: f.airline, color: '#4F46E5' }
      const dep = new Date(f.departure_at)
      const depH = dep.getUTCHours()
      const depM = dep.getUTCMinutes()
      const durTo = f.duration_to ?? f.duration ?? 0
      const arriveMin = depH * 60 + depM + durTo
      const arriveH = Math.floor(arriveMin / 60) % 24
      const arriveM = arriveMin % 60
      const durH = Math.floor(durTo / 60)
      const durM = durTo % 60
      const stops = f.transfers ?? 0
      const stopsLabel = stops === 0 ? 'Direct' : stops === 1 ? '1 stop' : `${stops} stops`

      const dealUrl = `https://www.aviasales.com${f.link}${f.link.includes('?') ? '&' : '?'}marker=${marker || '516555'}`

      return {
        id: `tp-flight-${f.flight_number}-${i}`,
        airline: airline.name,
        airlineCode: f.airline,
        airlineColor: airline.color,
        from: f.origin,
        fromCode: f.origin_airport,
        to: f.destination,
        toCode: f.destination_airport,
        departTime: `${pad(depH)}:${pad(depM)}`,
        arriveTime: `${pad(arriveH)}:${pad(arriveM)}`,
        duration: `${durH}h ${pad(durM)}m`,
        stops,
        stopsLabel,
        price: Math.round(f.price * adults),
        currency: currencySymbol,
        providerId: 'aviasales',
        providerName: 'Aviasales',
        providerColor: '#00C4AE',
        dealUrl,
        isOutbound: true,
        co2kg: Math.round(durH * 85 + stops * 20),
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
