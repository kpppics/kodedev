import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './kids.css'

export const metadata: Metadata = {
  title: 'Little KODE Dev — Learn AI for Kids | KODEDEV',
  description: 'A friendly app for children age 4+ to learn about AI, vibe coding, and how to make pictures, videos, and stories — all guided by Kodey, a friendly mascot.',
  robots: 'noindex, nofollow',
  alternates: { canonical: 'https://kodedev.co.uk/kids' },
  openGraph: {
    type: 'website',
    title: 'Little KODE Dev — Learn AI for Kids',
    description: 'A friendly voice-first app for kids 4+ to learn AI, vibe coding, and creating with AI.',
    locale: 'en_GB',
    siteName: 'Little KODE Dev',
  },
}

export default function KidsLayout({ children }: { children: ReactNode }) {
  return <div className="kids-app">{children}</div>
}
