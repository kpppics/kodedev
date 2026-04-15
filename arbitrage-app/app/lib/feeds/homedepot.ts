import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function homedepot(): Promise<FeedItem[]> {
  return fetchFeed(
    'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=retailer&q=home+depot&output=rss',
    'Home Depot'
  )
}
