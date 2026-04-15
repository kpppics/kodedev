import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function walmart(): Promise<FeedItem[]> {
  return fetchFeed(
    'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&q=walmart&output=rss',
    'Walmart Clearance'
  )
}
