import type { Metadata } from 'next'
import WhaleHero from './components/WhaleHero'
import WhaleTable from './components/WhaleTable'
import LiveMarketsFeed from './components/LiveMarketsFeed'
import StrategiesSection from './components/StrategiesSection'
import ToolsSection from './components/ToolsSection'
import KalshiCompare from './components/KalshiCompare'
import ApiSection from './components/ApiSection'
import PlaybookSection from './components/PlaybookSection'
import WhaleNavbar from './components/WhaleNavbar'
import WhaleFooter from './components/WhaleFooter'
import ThemeProvider from './components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Whale Tracker — Polymarket & Kalshi Insider Bets',
  description:
    'Live whale tracker for Polymarket and Kalshi. See the wallets that never lose, copy their strategies, and get alerts when whales bet.',
  robots: 'index, follow',
}

export default function WhalesPage() {
  return (
    <ThemeProvider>
      <WhaleNavbar />
      <main className="pt-20">
        <WhaleHero />
        <WhaleTable
          id="top-profit"
          eyebrow="Top Profit · All-time"
          title="Wallets with the biggest realised profit"
          subtitle="Live from Polymarket's public leaderboard API. Ranked by total USD profit across all resolved markets."
          accent="emerald"
          metric="profit"
          window="all"
          limit={10}
        />
        <WhaleTable
          id="top-volume"
          eyebrow="Top Volume · All-time"
          title="Wallets pushing the most size"
          subtitle="Live from Polymarket's public leaderboard API. Ranked by total USD volume — the high-frequency algos and whales moving the market."
          accent="indigo"
          metric="volume"
          window="all"
          limit={10}
        />
        <LiveMarketsFeed />
        <StrategiesSection />
        <ToolsSection />
        <KalshiCompare />
        <ApiSection />
        <PlaybookSection />
      </main>
      <WhaleFooter />
    </ThemeProvider>
  )
}
