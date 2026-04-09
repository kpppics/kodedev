// All whale/market data is fetched LIVE from Polymarket's public APIs.
// See `GAMMA_API_BASE`, `LB_API_BASE`, `DATA_API_BASE` below for the
// same-origin proxies configured in next.config.ts.

export type LeaderboardEntry = {
  proxyWallet: string
  amount: number
  pseudonym?: string | null
  name?: string | null
  bio?: string | null
  profileImage?: string | null
}

export type Tool = {
  name: string
  url: string
  desc: string
  cost: string
  category: 'tracker' | 'alert' | 'api' | 'copy'
  platform: 'polymarket' | 'kalshi' | 'both'
}

export const TOOLS: Tool[] = [
  {
    name: 'PolyTrack',
    url: 'https://polytrackhq.app',
    desc: 'Detected all 11 wallets of the French trader who made $85M. DBSCAN cluster detection finds linked wallets.',
    cost: 'Free',
    category: 'tracker',
    platform: 'polymarket',
  },
  {
    name: 'Polymarket Analytics',
    url: 'https://polymarketanalytics.com',
    desc: '1M+ traders ranked by PnL, win rate, position size. Updates every 5 minutes.',
    cost: 'Free',
    category: 'tracker',
    platform: 'polymarket',
  },
  {
    name: 'Polycopy',
    url: 'https://polycopy.app',
    desc: 'Browse top traders, see win rates, backtest their strategy, copy in 2 clicks.',
    cost: 'Free',
    category: 'copy',
    platform: 'polymarket',
  },
  {
    name: 'Arkham Intelligence',
    url: 'https://intel.arkm.com/explorer/entity/polymarket',
    desc: 'Dedicated Polymarket entity page with wallet labels, inflows, counterparties.',
    cost: 'Free',
    category: 'tracker',
    platform: 'polymarket',
  },
  {
    name: 'Polylerts (Telegram)',
    url: 'https://t.me/polylerts_bot',
    desc: 'Track up to 15 wallets free with instant Telegram notifications when they bet.',
    cost: 'Free (up to 15 wallets)',
    category: 'alert',
    platform: 'polymarket',
  },
  {
    name: 'DropsBot',
    url: 'https://t.me/dropsbot',
    desc: 'Monitor 500 events + 2,000 wallets simultaneously. Telegram alerts on every move.',
    cost: 'Free',
    category: 'alert',
    platform: 'polymarket',
  },
  {
    name: 'PolyGun',
    url: 'https://t.me/polygun',
    desc: 'Sub-second copy execution. 206K users. Auto-copy when a tracked wallet trades.',
    cost: '1% per trade',
    category: 'copy',
    platform: 'polymarket',
  },
  {
    name: 'PolyMonit',
    url: 'https://polymonit.com',
    desc: 'Real-time Telegram + email alerts when whales place trades.',
    cost: 'Free for 1 wallet',
    category: 'alert',
    platform: 'polymarket',
  },
  {
    name: 'FORCASTR',
    url: 'https://forcastr.market',
    desc: 'Kalshi-focused. AI flags trades >$10K. Insider trading detector.',
    cost: '$1 / month',
    category: 'tracker',
    platform: 'kalshi',
  },
  {
    name: 'Oddpool',
    url: 'https://oddpool.com/whales',
    desc: 'Tracks every trade >$500 on Kalshi AND Polymarket. Has its own API.',
    cost: 'Free',
    category: 'tracker',
    platform: 'both',
  },
  {
    name: 'Kalshi Leaderboard',
    url: 'https://kalshi.com/social/leaderboard',
    desc: 'Opt-in only. Top traders: @Domahhhh ($980K profit), @debl00b ($42M volume).',
    cost: 'Free',
    category: 'tracker',
    platform: 'kalshi',
  },
]

export const PUBLIC_APIS = [
  {
    label: 'Polymarket trades by wallet',
    method: 'GET',
    url: 'https://data-api.polymarket.com/trades?user=0x_WALLET',
  },
  {
    label: 'Polymarket positions by wallet',
    method: 'GET',
    url: 'https://data-api.polymarket.com/positions?user=0x_WALLET',
  },
  {
    label: 'Polymarket activity feed',
    method: 'GET',
    url: 'https://data-api.polymarket.com/activity?user=0x_WALLET',
  },
  {
    label: 'Polymarket market metadata',
    method: 'GET',
    url: 'https://gamma-api.polymarket.com/markets?id=MARKET_ID',
  },
  {
    label: 'Kalshi public trades',
    method: 'GET',
    url: 'https://api.elections.kalshi.com/trade-api/v2/markets/trades',
  },
  {
    label: 'Kalshi orderbook',
    method: 'GET',
    url: 'https://api.elections.kalshi.com/trade-api/v2/markets/{ticker}/orderbook?depth=N',
  },
  {
    label: 'Kalshi real-time firehose',
    method: 'WSS',
    url: 'wss://api.elections.kalshi.com',
  },
]

// Routed through same-origin Vercel rewrites (see next.config.ts) so iOS
// Safari + content blockers don't drop the requests as third-party fetches.
export const GAMMA_API_BASE = '/polymarket-api'
export const LB_API_BASE = '/polymarket-lb'
export const DATA_API_BASE = '/polymarket-data'
