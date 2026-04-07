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
import { ALGO_MONSTERS, PERFECT_RECORDS } from './data'

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
          id="perfect-records"
          eyebrow="Perfect Records"
          title="Wallets that have never lost a bet"
          subtitle="100% win rate, verified on the Polygon blockchain. Bet big, were right."
          accent="emerald"
          whales={PERFECT_RECORDS}
        />
        <WhaleTable
          id="algo-monsters"
          eyebrow="Algorithmic Monsters"
          title="Bots running 24/7 with near-perfect win rates"
          subtitle="Massive volume, automated execution, sophisticated modeling. The machines."
          accent="indigo"
          whales={ALGO_MONSTERS}
          showVolume
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
