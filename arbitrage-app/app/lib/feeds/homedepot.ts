import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function homedepot(): Promise<FeedItem[]> {
  return fetchFeed(
    'https://hip2save.com/tag/home-depot/feed/',
    'Home Depot'
  )
}
