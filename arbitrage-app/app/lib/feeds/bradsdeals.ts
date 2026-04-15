import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function bradsdeals(): Promise<FeedItem[]> {
  return fetchFeed('https://www.bradsdeals.com/feed/', 'BradsDeals')
}
