import { CONFIG } from '../region'
import type { CatalogItem, PricingOffer, FeesEstimate } from './types'

// Seeded RNG so mock data is stable
function hash(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rand(seed: number): () => number {
  let x = seed || 1
  return () => {
    x ^= x << 13; x >>>= 0
    x ^= x >> 17
    x ^= x << 5; x >>>= 0
    return (x >>> 0) / 0xffffffff
  }
}

export function mockCatalog(identifier: string): CatalogItem {
  const r = rand(hash(identifier))
  const brands = ['Hasbro', 'LEGO', 'Sony', 'Logitech', 'Nestle', 'Philips', 'Anker', 'Braun']
  const titles = ['Wireless Keyboard', 'Action Figure Set', 'Bluetooth Speaker', 'Coffee Pods 100-Pack', 'Building Set', 'Over-Ear Headphones']
  return {
    asin: 'B0' + identifier.slice(0, 8).toUpperCase().padEnd(8, 'X'),
    title: titles[Math.floor(r() * titles.length)] + ' #' + identifier.slice(-3),
    brand: brands[Math.floor(r() * brands.length)],
    upc: identifier.replace(/\D/g, '').padStart(12, '0').slice(0, 12),
    image: undefined,
    category: 'General',
  }
}

export function mockPricing(asin: string): PricingOffer {
  const r = rand(hash('p' + asin))
  const base = 8 + r() * 40
  return {
    asin,
    buyBoxPrice: Math.round(base * 100) / 100,
    lowestNewPrice: Math.round(base * 0.95 * 100) / 100,
    offerCount: Math.floor(r() * 12) + 1,
    fbaOfferCount: Math.floor(r() * 8),
    amazonOnListing: r() < 0.35,
    currency: CONFIG.currency,
  }
}

export function mockFees(asin: string, price: number): FeesEstimate {
  const r = rand(hash('f' + asin))
  const referralFee = Math.round(price * 0.15 * 100) / 100
  const fulfilmentFee = Math.round((2.5 + r() * 2) * 100) / 100
  return {
    asin,
    price,
    referralFee,
    fulfilmentFee,
    closingFee: 0,
    totalFees: Math.round((referralFee + fulfilmentFee) * 100) / 100,
    currency: CONFIG.currency,
  }
}
