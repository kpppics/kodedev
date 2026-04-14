import { fetchFeed, type FeedItem } from './hotukdeals'

export async function slickdeals(): Promise<FeedItem[]> {
  return fetchFeed('https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&rss=1', 'Slickdeals')
}
