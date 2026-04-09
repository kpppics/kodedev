// Verified whale wallet data — sourced from the public Polymarket whale
// tracking playbook. Addresses are public on-chain (Polygon). The truncated
// form (0xPREFIX...SUFFIX) is shown in the UI; the full address would be
// pulled from polytrackhq.app or polymarketanalytics.com in production.

export type Whale = {
  name: string
  addressShort: string
  profitUsd: number
  bets: number
  volumeUsd?: number
  winRate: number
  strategy: string
  flag?: string
}

export const PERFECT_RECORDS: Whale[] = [
  {
    name: 'Theo4',
    addressShort: '0x5668...5839',
    profitUsd: 22_050_000,
    bets: 14,
    winRate: 100,
    strategy: '2024 election — bought Trump at 37¢',
  },
  {
    name: 'RepTrump',
    addressShort: '0x8631...aa53',
    profitUsd: 7_530_000,
    bets: 8,
    winRate: 100,
    strategy: '2024 election — all Republican bets',
  },
  {
    name: 'zxgngl',
    addressShort: '0xd235...0f29',
    profitUsd: 7_810_000,
    bets: 8,
    winRate: 100,
    strategy: 'One massive Trump bet + small BTC',
  },
  {
    name: 'PrincessCaro',
    addressShort: '0x8119...7887',
    profitUsd: 6_080_000,
    bets: 14,
    winRate: 100,
    strategy: 'Election + hedged with small Harris bets',
  },
  {
    name: 'majorexploiter',
    addressShort: '0x033a...0d50',
    profitUsd: 3_670_000,
    bets: 3,
    winRate: 100,
    strategy: 'European football — Arsenal, Liverpool, Rennais',
    flag: 'NEW account Feb 2026 — suspicious',
  },
]

export const ALGO_MONSTERS: Whale[] = [
  {
    name: 'swisstony',
    addressShort: '0x204f...0e14',
    profitUsd: 5_670_000,
    bets: 68_851,
    volumeUsd: 614_000_000,
    winRate: 99.4,
    strategy: 'Sports algorithm — football, tennis, baseball',
  },
  {
    name: 'GamblingIsAllYouNeed',
    addressShort: '0x507e...00ae',
    profitUsd: 4_620_000,
    bets: 48_314,
    volumeUsd: 302_000_000,
    winRate: 99.1,
    strategy: 'Sports + politics algo',
  },
  {
    name: 'RN1',
    addressShort: '0x2005...09ea',
    profitUsd: 6_700_000,
    bets: 45_936,
    volumeUsd: 344_000_000,
    winRate: 99.3,
    strategy: 'Tennis, football, NFL, esports',
  },
  {
    name: 'gabagool22',
    addressShort: '0x6031...f96d',
    profitUsd: 868_000,
    bets: 28_620,
    volumeUsd: 124_000_000,
    winRate: 99.52,
    strategy: 'BTC arbitrage bot — buys both sides of every market',
  },
  {
    name: 'gmanas',
    addressShort: '0xe90b...5da2',
    profitUsd: 4_960_000,
    bets: 4_907,
    volumeUsd: 529_000_000,
    winRate: 99.0,
    strategy: 'Sports + UFC + politics',
  },
  {
    name: 'kch123',
    addressShort: '0x6a72...03ee',
    profitUsd: 11_400_000,
    bets: 2_334,
    volumeUsd: 269_000_000,
    winRate: 98.5,
    strategy: 'Mixed — biggest single win $1.09M on Villarreal',
  },
]

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

// Routed through a same-origin Vercel rewrite (see next.config.ts) so iOS
// Safari + content blockers don't drop the request as a third-party fetch.
export const GAMMA_API_BASE = '/polymarket-api'
