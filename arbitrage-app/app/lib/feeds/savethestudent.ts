import { fetchFeed, type FeedItem } from './hotukdeals'

export async function savethestudent(): Promise<FeedItem[]> {
  return fetchFeed('https://www.savethestudent.org/feed', 'SaveTheStudent')
}
