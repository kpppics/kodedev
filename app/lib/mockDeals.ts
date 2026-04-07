// Deterministic mock deal generator. Given a search query it produces
// a stable, plausible set of results so the UI always has something
// to display. The "Open on <provider>" buttons still deep-link to the
// real provider search so users can verify live prices.

import { STAY_PROVIDERS, FLIGHT_PROVIDERS, type SearchParams, type StayCategory } from './providers'

/* ------------------------- random helpers ------------------------- */

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)]

/* ------------------------------ stays ----------------------------- */

export interface StayDeal {
  id: string
  kind: 'hotel' | 'apartment' | 'villa' | 'house'
  title: string
  area: string
  image: string
  rating: number
  reviews: number
  pricePerNight: number
  totalPrice: number
  currency: string
  nights: number
  providerId: string
  providerName: string
  providerColor: string
  dealUrl: string
  perks: string[]
  savings: number // percent off "rack rate"
}

const HOTEL_NAMES = [
  'Grand Harbour', 'The Continental', 'Azure Bay Resort', 'Maison de Soleil',
  'Palazzo Reale', 'Sunset Boulevard Hotel', 'The Lighthouse', 'Casa Blanca',
  'Mandarin Gardens', 'Royal Orchid', 'Le Petit Palais', 'Terra Nova Inn',
  'The Grand Majestic', 'Ocean View Suites', 'Monte Carlo Plaza', 'Villa Serena',
]
const APT_NAMES = [
  'Skyline Loft', 'Old Town Studio', 'Harbourside Apartment', 'Riverside Flat',
  'Central Penthouse', 'Boutique 1-Bed', 'Design Apartment', 'Marina View Suite',
  'Garden Courtyard Flat', 'Rooftop Escape', 'Art District Loft', 'The Mews',
]
const VILLA_NAMES = [
  'Villa Bellavista', 'Casa del Mar', 'Finca Los Olivos', 'Villa Serenidad',
  'The Cliff House', 'Maison Côte d\'Azur', 'Villa Tramonto', 'Hacienda Luna',
  'Villa Pomegranate', 'Coastal Retreat', 'Villa Cascada', 'The White Villa',
]
const HOUSE_NAMES = [
  'Coastal Cottage', 'Mountain Chalet', 'Lakeside Cabin', 'Stone Farmhouse',
  'Beach House Retreat', 'Countryside Manor', 'Alpine Lodge', 'Riverside Cottage',
  'Forest Hideaway', 'Clifftop House', 'Harbour Cottage', 'The Old Rectory',
]
const AREAS = [
  'City Centre', 'Old Town', 'Seafront', 'Marina District', 'Historic Quarter',
  'Downtown', 'Beach Area', 'Riverside', 'Hillside', 'Airport Zone',
]
const PERKS = [
  'Free cancellation', 'Breakfast included', 'Pool', 'Sea view', 'Wi-Fi',
  'Free parking', 'Air con', 'Kitchen', 'Hot tub', 'Pet friendly',
  'Balcony', 'Beachfront', 'Gym', 'Spa access', 'Airport shuttle',
]

// Use Picsum seeded image service — no API key, always works, visually pleasant.
const img = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/560`

function nightsBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime()
  const d2 = new Date(b).getTime()
  const n = Math.round((d2 - d1) / 86400000)
  return n > 0 ? n : 3
}

export function generateStays(p: SearchParams, category: StayCategory = 'all'): StayDeal[] {
  const nights = nightsBetween(p.checkIn, p.checkOut)
  const seed = hash(`${p.destination}|${p.checkIn}|${p.checkOut}|${p.adults}|${category}`)
  const r = rng(seed)

  const kinds: StayDeal['kind'][] =
    category === 'all'
      ? ['hotel', 'apartment', 'villa', 'house']
      : [category.slice(0, -1) as StayDeal['kind']]

  const results: StayDeal[] = []
  const count = category === 'all' ? 16 : 12

  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length]
    const provider = STAY_PROVIDERS[Math.floor(r() * STAY_PROVIDERS.length)]

    const nameList =
      kind === 'hotel' ? HOTEL_NAMES
      : kind === 'apartment' ? APT_NAMES
      : kind === 'villa' ? VILLA_NAMES
      : HOUSE_NAMES

    const name = nameList[Math.floor(r() * nameList.length)]
    const area = pick(r, AREAS)

    // Price range depends on kind + guest count.
    const base =
      kind === 'hotel' ? 55 + r() * 280
      : kind === 'apartment' ? 45 + r() * 220
      : kind === 'villa' ? 120 + r() * 520
      : 80 + r() * 320

    const guestMultiplier = 1 + Math.max(0, p.adults - 2) * 0.12
    const pricePerNight = Math.round(base * guestMultiplier)
    const totalPrice = pricePerNight * nights

    const rating = +(7.8 + r() * 2.1).toFixed(1)
    const reviews = Math.floor(80 + r() * 4200)
    const savings = Math.floor(8 + r() * 45)

    // pick 3 perks deterministically
    const perks: string[] = []
    const perkStart = Math.floor(r() * PERKS.length)
    for (let j = 0; j < 3; j++) perks.push(PERKS[(perkStart + j) % PERKS.length])

    results.push({
      id: `${provider.id}-${i}-${seed}`,
      kind,
      title: `${name} ${p.destination.split(',')[0]}`,
      area,
      image: img(`${name}-${p.destination}-${i}`),
      rating,
      reviews,
      pricePerNight,
      totalPrice,
      currency: '£',
      nights,
      providerId: provider.id,
      providerName: provider.name,
      providerColor: provider.color,
      dealUrl: provider.build(p),
      perks,
      savings,
    })
  }

  return results.sort((a, b) => a.pricePerNight - b.pricePerNight)
}

/* ------------------------------ flights ----------------------------- */

export interface FlightDeal {
  id: string
  airline: string
  airlineCode: string
  airlineColor: string
  from: string
  fromCode: string
  to: string
  toCode: string
  departTime: string
  arriveTime: string
  duration: string
  stops: number
  stopsLabel: string
  price: number
  currency: string
  providerId: string
  providerName: string
  providerColor: string
  dealUrl: string
  isOutbound: boolean
  co2kg: number
}

const AIRLINES: { name: string; code: string; color: string }[] = [
  { name: 'British Airways', code: 'BA', color: '#075AAA' },
  { name: 'Ryanair',         code: 'FR', color: '#073590' },
  { name: 'easyJet',          code: 'U2', color: '#FF6600' },
  { name: 'Lufthansa',        code: 'LH', color: '#05164D' },
  { name: 'Air France',       code: 'AF', color: '#002157' },
  { name: 'KLM',              code: 'KL', color: '#00A1DE' },
  { name: 'Emirates',         code: 'EK', color: '#D71921' },
  { name: 'Qatar Airways',    code: 'QR', color: '#5C0632' },
  { name: 'Turkish Airlines', code: 'TK', color: '#E81932' },
  { name: 'Wizz Air',         code: 'W6', color: '#C6007E' },
  { name: 'Vueling',          code: 'VY', color: '#FFCC00' },
  { name: 'Iberia',           code: 'IB', color: '#D7192D' },
]

// A small subset of IATA codes for visual realism.
function iataFor(city: string): string {
  const map: Record<string, string> = {
    london: 'LHR', paris: 'CDG', rome: 'FCO', madrid: 'MAD', barcelona: 'BCN',
    lisbon: 'LIS', amsterdam: 'AMS', berlin: 'BER', vienna: 'VIE', prague: 'PRG',
    athens: 'ATH', istanbul: 'IST', dubai: 'DXB', bangkok: 'BKK', tokyo: 'HND',
    singapore: 'SIN', 'new york': 'JFK', 'los angeles': 'LAX', miami: 'MIA',
    sydney: 'SYD', bali: 'DPS', phuket: 'HKT', mallorca: 'PMI', ibiza: 'IBZ',
    tenerife: 'TFS', malaga: 'AGP', alicante: 'ALC', nice: 'NCE', venice: 'VCE',
    naples: 'NAP', marrakech: 'RAK', cancun: 'CUN', orlando: 'MCO',
  }
  const key = city.toLowerCase().split(',')[0].trim()
  if (map[key]) return map[key]
  // fallback: first 3 letters uppercase
  return key.slice(0, 3).toUpperCase()
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function generateFlights(p: SearchParams): FlightDeal[] {
  const seed = hash(`flights|${p.origin || 'LON'}|${p.destination}|${p.checkIn}|${p.checkOut}|${p.adults}`)
  const r = rng(seed)
  const fromCode = iataFor(p.origin || 'London')
  const toCode = iataFor(p.destination)
  const fromCity = (p.origin || 'London').split(',')[0]
  const toCity = p.destination.split(',')[0]

  const out: FlightDeal[] = []
  const count = 14

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[Math.floor(r() * AIRLINES.length)]
    const provider = FLIGHT_PROVIDERS[Math.floor(r() * FLIGHT_PROVIDERS.length)]

    const depH = Math.floor(r() * 22)
    const depM = Math.floor(r() * 12) * 5
    const durH = 1 + Math.floor(r() * 13)
    const durM = Math.floor(r() * 12) * 5
    const arriveH = (depH + durH + (depM + durM >= 60 ? 1 : 0)) % 24
    const arriveM = (depM + durM) % 60

    const stops = r() < 0.55 ? 0 : r() < 0.8 ? 1 : 2
    const stopsLabel = stops === 0 ? 'Direct' : stops === 1 ? '1 stop' : '2 stops'

    const basePrice = 45 + r() * 380 + durH * 18 + stops * 25
    const price = Math.round(basePrice * p.adults)

    out.push({
      id: `${provider.id}-${airline.code}-${i}-${seed}`,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      from: fromCity,
      fromCode,
      to: toCity,
      toCode,
      departTime: `${pad(depH)}:${pad(depM)}`,
      arriveTime: `${pad(arriveH)}:${pad(arriveM)}`,
      duration: `${durH}h ${pad(durM)}m`,
      stops,
      stopsLabel,
      price,
      currency: '£',
      providerId: provider.id,
      providerName: provider.name,
      providerColor: provider.color,
      dealUrl: provider.build(p),
      isOutbound: i % 2 === 0,
      co2kg: Math.round(durH * 85 + stops * 20),
    })
  }

  return out.sort((a, b) => a.price - b.price)
}
