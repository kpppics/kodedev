export type Region = 'uk' | 'us'

export interface RegionConfig {
  currency: 'GBP' | 'USD'
  symbol: string
  locale: string
  amazon: { host: string; marketplaceId: string; endpoint: string }
  ebay: { siteId: string; host: string; marketplace: string }
  vat: { enabled: boolean; rate: number }
  salesTax: { enabled: boolean; defaultRate: number }
  deals: { feeds: Array<'hotukdeals' | 'latestdeals' | 'slickdeals' | 'dealnews'> }
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
    deals: { feeds: ['hotukdeals', 'latestdeals'] },
  },
  us: {
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    amazon: { host: 'amazon.com', marketplaceId: 'ATVPDKIKX0DER', endpoint: 'sellingpartnerapi-na.amazon.com' },
    ebay: { siteId: 'EBAY_US', host: 'ebay.com', marketplace: 'EBAY_US' },
    vat: { enabled: false, rate: 0 },
    salesTax: { enabled: true, defaultRate: 0 },
    deals: { feeds: ['slickdeals', 'dealnews'] },
  },
}

export const REGION: Region = ((process.env.REGION || process.env.NEXT_PUBLIC_REGION || 'uk') as Region)
export const CONFIG: RegionConfig = REGION_CONFIG[REGION] ?? REGION_CONFIG.uk

export const USE_MOCK = (process.env.USE_MOCK || process.env.NEXT_PUBLIC_USE_MOCK || '0') === '1'

export function money(n: number, region: Region = REGION): string {
  const cfg = REGION_CONFIG[region]
  return new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.currency, maximumFractionDigits: 2 }).format(n)
}
