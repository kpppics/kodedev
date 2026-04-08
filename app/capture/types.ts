export type CategorySlug =
  | 'celebrity'
  | 'breaking-news'
  | 'crime'
  | 'local-crime'
  | 'police'
  | 'events'
  | 'weather'
  | 'sport'

export interface Category {
  slug: CategorySlug
  name: string
  icon: string
  blurb: string
  payout: string
  accent: string
}

export interface Submission {
  id: string
  title: string
  description: string
  category: CategorySlug
  location: string
  askingPrice: number
  status: 'pending' | 'approved' | 'sold' | 'rejected'
  earnings: number
  views: number
  mediaType: 'image' | 'video'
  mediaUrl: string // data URL for the demo
  thumbUrl?: string
  createdAt: number
  authorId: string
  authorName: string
  exclusive: boolean
}

export interface User {
  id: string
  name: string
  email: string
  handle: string
  joined: number
  payoutMethod?: 'bank' | 'paypal'
  payoutDetail?: string
  balance: number
  lifetimeEarnings: number
}
