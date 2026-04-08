import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Whale Tracker — Polymarket & Kalshi Insider Bets',
  description:
    'Live whale tracker for Polymarket and Kalshi. See the wallets that never lose, copy their strategies, and get alerts when whales bet.',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Whale Tracker — Polymarket & Kalshi Insider Bets',
    description:
      'Follow the wallets that never lose. Live on-chain data from Polymarket + Kalshi.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 font-body antialiased">
        {children}
      </body>
    </html>
  )
}
