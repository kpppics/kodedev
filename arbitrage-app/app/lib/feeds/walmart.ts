import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function walmart(): Promise<FeedItem[]> {
  return fetchFeed(
    'https://hip2save.com/tag/walmart/feed/',
    'Walmart Clearance'
  )
}
