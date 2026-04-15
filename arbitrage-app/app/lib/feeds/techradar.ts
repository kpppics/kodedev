import { fetchFeed, type FeedItem } from './hotukdeals'

export async function techradar(): Promise<FeedItem[]> {
  return fetchFeed('https://www.techradar.com/feeds/tag/deals', 'TechRadar')
}
