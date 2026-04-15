import { fetchFeed } from './hotukdeals'
import type { FeedItem } from './hotukdeals'

export async function pennypinchinmom(): Promise<FeedItem[]> {
  return fetchFeed('https://www.pennypinchinmom.com/feed/', "PennyPinchin'Mom")
}
