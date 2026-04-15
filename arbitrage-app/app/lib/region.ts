export type Region = 'uk' | 'us'

export interface RegionConfig {
  currency: 'GBP' | 'USD'
  symbol: string
  locale: string
  amazon: { host: string; marketplaceId: string; endpoint: string }
  ebay: { siteId: string; host: string; marketplace: string }
  vat: { enabled: boolean; rate: number }
  salesTax: { enabled: boolean; defaultRate: number }
  deals: { feeds: Array<'hotukdeals' | 'latestdeals' | 'techradar' | 'savethestudent' | 'slickdeals' | 'dealnews' | 'hip2save' | 'bradsdeals' | 'pennypinchinmom' | 'walmart' | 'homedepot'> }
}

export const REGION_CONFIG: Record<Region, RegionConfig> = {
  uk: {
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    amazon: { host: 'amazon.co.uk', marketplaceId: 'A1F83G8C2ARO7P', endpoint: 'sellingpartnerapi-eu.amazon.com' },
    ebay: { siteId: 'EBAY_GB', host: 'ebay.co.uk', marketplace: 'EBAY_GB' },
    vat: { enabled: true, rate: 0.20 },
    salesTax: { enabled: false, defaultRate: 0 },
    deals: { feeds: ['hotukdeals', 'latestdeals', 'techradar', 'savethestudent'] },
  },
  us: {
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    amazon: { host: 'amazon.com', marketplaceId: 'ATVPDKIKX0DER', endpoint: 'sellingpartnerapi-na.amazon.com' },
    ebay: { siteId: 'EBAY_US', host: 'ebay.com', marketplace: 'EBAY_US' },
    vat: { enabled: false, rate: 0 },
    salesTax: { enabled: true, defaultRate: 0 },
    deals: { feeds: ['slickdeals', 'dealnews', 'hip2save', 'walmart', 'homedepot', 'bradsdeals', 'pennypinchinmom'] },
  },
}

const _rawRegion = process.env.NEXT_PUBLIC_REGION || 'uk'
export const REGION: Region = (_rawRegion in REGION_CONFIG ? _rawRegion : 'uk') as Region
export const CONFIG: RegionConfig = REGION_CONFIG[REGION]

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === '1'

export function money(n: number, region: Region = REGION): string {
  const cfg = REGION_CONFIG[region] ?? REGION_CONFIG.uk
  return new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.currency, maximumFractionDigits: 2 }).format(n)
}
