import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function homedepot(): Promise<FeedItem[]> {
  return fetchFeed(
    'https://feeds.feedburner.com/Techbargains',
    'Home Depot'
  )
}
