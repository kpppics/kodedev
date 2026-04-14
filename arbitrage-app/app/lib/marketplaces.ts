export type AdapterId = 'spapi' | 'ebay' | 'bestbuy' | 'walmart' | 'mercari' | 'vinted' | 'jsonld'
export type FeeModel = 'none' | 'amazon' | 'ebay' | 'mercari' | 'poshmark' | 'vinted' | 'depop' | 'facebook'
export type MarketplaceKind = 'retailer' | 'marketplace' | 'resale'
export type Country = 'uk' | 'us' | 'global'

export interface Marketplace {
  id: string
  name: string
  country: Country
  kind: MarketplaceKind
  adapter: AdapterId
  feeModel: FeeModel
  canSellOn: boolean            // can we list items on this platform?
  urlPatterns: RegExp[]
  searchUrl?: (query: string) => string
}

export const MARKETPLACES: Marketplace[] = [
  // Amazon (buy + sell, via SP-API)
  { id: 'amazon-uk', name: 'Amazon', country: 'uk', kind: 'marketplace', adapter: 'spapi', feeModel: 'amazon', canSellOn: true,
    urlPatterns: [/amazon\.co\.uk\/(?:.*\/)?(?:dp|gp\/product)\/[A-Z0-9]{10}/i] },
  { id: 'amazon-us', name: 'Amazon', country: 'us', kind: 'marketplace', adapter: 'spapi', feeModel: 'amazon', canSellOn: true,
    urlPatterns: [/amazon\.com\/(?:.*\/)?(?:dp|gp\/product)\/[A-Z0-9]{10}/i] },

  // eBay (buy + sell)
  { id: 'ebay-uk', name: 'eBay', country: 'uk', kind: 'marketplace', adapter: 'ebay', feeModel: 'ebay', canSellOn: true,
    urlPatterns: [/ebay\.co\.uk\/itm\//i], searchUrl: q => `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(q)}` },
  { id: 'ebay-us', name: 'eBay', country: 'us', kind: 'marketplace', adapter: 'ebay', feeModel: 'ebay', canSellOn: true,
    urlPatterns: [/ebay\.com\/itm\//i], searchUrl: q => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}` },

  // US retailers
  { id: 'walmart', name: 'Walmart', country: 'us', kind: 'retailer', adapter: 'walmart', feeModel: 'none', canSellOn: false,
    urlPatterns: [/walmart\.com\/ip\//i] },
  { id: 'target', name: 'Target', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/target\.com\/p\//i] },
  { id: 'bestbuy', name: 'Best Buy', country: 'us', kind: 'retailer', adapter: 'bestbuy', feeModel: 'none', canSellOn: false,
    urlPatterns: [/bestbuy\.com\/site\//i] },
  { id: 'homedepot', name: 'Home Depot', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/homedepot\.com\/p\//i] },
  { id: 'lowes', name: "Lowe's", country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/lowes\.com\/pd\//i] },
  { id: 'kohls', name: "Kohl's", country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/kohls\.com\/product\//i] },
  { id: 'macys', name: "Macy's", country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/macys\.com\/shop\//i] },
  { id: 'costco', name: 'Costco', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/costco\.com\/.+\.product\./i] },
  { id: 'samsclub', name: "Sam's Club", country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/samsclub\.com\/p\//i] },
  { id: 'biglots', name: 'Big Lots', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/biglots\.com\//i] },
  { id: 'fivebelow', name: 'Five Below', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/fivebelow\.com\//i] },
  { id: 'tjmaxx', name: 'TJ Maxx', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/tjmaxx\.tjx\.com\//i] },
  { id: 'marshalls', name: 'Marshalls', country: 'us', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/marshalls\.com\//i] },

  // UK retailers
  { id: 'argos', name: 'Argos', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/argos\.co\.uk\/product\//i] },
  { id: 'tesco', name: 'Tesco', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/tesco\.com\/groceries\/|tesco\.com\/direct\//i] },
  { id: 'asda', name: 'Asda', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/asda\.com\/product\/|groceries\.asda\.com\/product\//i] },
  { id: 'sainsburys', name: "Sainsbury's", country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/sainsburys\.co\.uk\/gol-ui\/product\//i] },
  { id: 'morrisons', name: 'Morrisons', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/groceries\.morrisons\.com\/products\//i] },
  { id: 'boots', name: 'Boots', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/boots\.com\/.+-\d+/i] },
  { id: 'superdrug', name: 'Superdrug', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/superdrug\.com\/.+\/p\//i] },
  { id: 'bm', name: 'B&M', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/bmstores\.co\.uk\/products\//i] },
  { id: 'therange', name: 'The Range', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/therange\.co\.uk\/.+\/\d+/i] },
  { id: 'homebargains', name: 'Home Bargains', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/homebargains\.co\.uk\/products\//i] },
  { id: 'wowcher', name: 'Wowcher', country: 'uk', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/wowcher\.co\.uk\/deal\//i] },
  { id: 'groupon', name: 'Groupon', country: 'global', kind: 'retailer', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/groupon\.(?:co\.uk|com)\/deals\//i] },

  // Resale (buy + sell)
  { id: 'mercari', name: 'Mercari', country: 'us', kind: 'resale', adapter: 'mercari', feeModel: 'mercari', canSellOn: true,
    urlPatterns: [/mercari\.com\/(?:us\/)?item\//i], searchUrl: q => `https://www.mercari.com/search?keyword=${encodeURIComponent(q)}` },
  { id: 'poshmark', name: 'Poshmark', country: 'us', kind: 'resale', adapter: 'jsonld', feeModel: 'poshmark', canSellOn: true,
    urlPatterns: [/poshmark\.com\/listing\//i], searchUrl: q => `https://poshmark.com/search?query=${encodeURIComponent(q)}` },
  { id: 'vinted-uk', name: 'Vinted', country: 'uk', kind: 'resale', adapter: 'vinted', feeModel: 'vinted', canSellOn: true,
    urlPatterns: [/vinted\.co\.uk\/items\//i], searchUrl: q => `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(q)}` },
  { id: 'vinted-us', name: 'Vinted', country: 'us', kind: 'resale', adapter: 'vinted', feeModel: 'vinted', canSellOn: true,
    urlPatterns: [/vinted\.com\/items\//i], searchUrl: q => `https://www.vinted.com/catalog?search_text=${encodeURIComponent(q)}` },
  { id: 'depop', name: 'Depop', country: 'global', kind: 'resale', adapter: 'jsonld', feeModel: 'depop', canSellOn: true,
    urlPatterns: [/depop\.com\/products\//i], searchUrl: q => `https://www.depop.com/search/?q=${encodeURIComponent(q)}` },
  { id: 'offerup', name: 'OfferUp', country: 'us', kind: 'resale', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/offerup\.com\/item\//i] },
  { id: 'facebook', name: 'Facebook Marketplace', country: 'global', kind: 'resale', adapter: 'jsonld', feeModel: 'facebook', canSellOn: true,
    urlPatterns: [/facebook\.com\/marketplace\/item\//i] },
  { id: 'gumtree', name: 'Gumtree', country: 'uk', kind: 'resale', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/gumtree\.com\/p\//i] },
  { id: 'craigslist', name: 'Craigslist', country: 'us', kind: 'resale', adapter: 'jsonld', feeModel: 'none', canSellOn: false,
    urlPatterns: [/craigslist\.org\/[a-z]+\/[a-z]+\//i] },
]

export function matchMarketplace(url: string): Marketplace | null {
  for (const m of MARKETPLACES) {
    for (const p of m.urlPatterns) if (p.test(url)) return m
  }
  return null
}

export function sellableTargets(country: Country): Marketplace[] {
  return MARKETPLACES.filter(m => m.canSellOn && (m.country === country || m.country === 'global'))
}
