import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function hip2save(): Promise<FeedItem[]> {
  return fetchFeed('https://hip2save.com/feed/', 'Hip2Save')
}
