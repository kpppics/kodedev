import { CONFIG } from '../region'
import type { EbayListing, EbaySearchResult } from './types'

function hash(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function rand(seed: number): () => number {
  let x = seed || 1
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return (x >>> 0) / 0xffffffff }
}

export function mockEbaySearch(query: string, limit = 25): EbaySearchResult {
  const r = rand(hash(query))
  const base = 6 + r() * 35
  const active: EbayListing[] = []
  const sold: EbayListing[] = []
  for (let i = 0; i < limit; i++) {
    const p = Math.max(1, base + (r() - 0.5) * base * 0.4)
    active.push({
      itemId: `mock-a-${hash(query + i)}`,
      title: `${query} (listing ${i + 1})`,
      price: Math.round(p * 100) / 100,
      currency: CONFIG.currency,
      condition: r() < 0.5 ? 'New' : 'Used',
      url: `https://www.${CONFIG.ebay.host}/itm/${hash(query + i)}`,
    })
    const sp = Math.max(1, base * 0.95 + (r() - 0.5) * base * 0.4)
    sold.push({
      itemId: `mock-s-${hash(query + i + 100)}`,
      title: `${query} (sold ${i + 1})`,
      price: Math.round(sp * 100) / 100,
      currency: CONFIG.currency,
      condition: r() < 0.5 ? 'New' : 'Used',
      url: `https://www.${CONFIG.ebay.host}/itm/${hash(query + i + 100)}`,
      soldDate: new Date(Date.now() - r() * 60 * 86400000).toISOString(),
    })
  }
  const prices = active.map(a => a.price).sort((a, b) => a - b)
  const sprices = sold.map(s => s.price).sort((a, b) => a - b)
  const median = (arr: number[]) => arr.length ? arr[Math.floor(arr.length / 2)] : 0
  return {
    query,
    total: active.length + sold.length,
    active,
    sold,
    activeMedian: median(prices),
    soldMedian: median(sprices),
    soldP25: sprices[Math.floor(sprices.length * 0.25)] || 0,
    soldP75: sprices[Math.floor(sprices.length * 0.75)] || 0,
  }
}
