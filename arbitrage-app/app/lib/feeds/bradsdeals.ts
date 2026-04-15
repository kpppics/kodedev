import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function bradsdeals(): Promise<FeedItem[]> {
  return fetchFeed('https://9to5mac.com/feed/', '9to5Mac')
}
