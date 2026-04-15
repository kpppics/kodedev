import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function walmart(): Promise<FeedItem[]> {
  return fetchFeed(
    'https://9to5toys.com/feed/',
    'Walmart Clearance'
  )
}
