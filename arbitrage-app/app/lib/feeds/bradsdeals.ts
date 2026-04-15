import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function bradsdeals(): Promise<FeedItem[]> {
  return fetchFeed('https://thekrazycouponlady.com/feed/', 'KrazyCouponLady')
}
