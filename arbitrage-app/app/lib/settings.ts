export interface Settings {
  targetRoi: number
  prepCost: number
  shipIn: number
  shipOut: number
  vatRegistered: boolean
  salesTaxRate: number
  sortBy: 'profit' | 'roi'
  theme: 'auto' | 'light' | 'dark'
}

export const DEFAULT_SETTINGS: Settings = {
  targetRoi: 0.30,
  prepCost: 0.50,
  shipIn: 0,
  shipOut: 3.00,
  vatRegistered: false,
  salesTaxRate: 0,
  sortBy: 'profit',
  theme: 'auto',
}

const KEY = 'arbitrage:settings:v1'

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(s))
}
