import { fetchFeed, type FeedItem } from './hotukdeals'

export async function dealnews(): Promise<FeedItem[]> {
  return fetchFeed('https://www.cnet.com/rss/deals/', 'CNET Deals')
}
