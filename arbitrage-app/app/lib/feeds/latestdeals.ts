import { fetchFeed, type FeedItem } from './hotukdeals'

export async function latestdeals(): Promise<FeedItem[]> {
  return fetchFeed('https://www.latestdeals.co.uk/feed.rss', 'LatestDeals')
}
