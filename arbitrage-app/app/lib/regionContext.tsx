'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Region } from './region'

const STORAGE_KEY = 'arbitrage:region'
const DEFAULT_REGION: Region = 'uk'

interface RegionContextValue {
  region: Region
  toggle: () => void
}

const RegionContext = createContext<RegionContextValue>({
  region: DEFAULT_REGION,
  toggle: () => {},
})

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'uk' || saved === 'us') setRegion(saved)
  }, [])

  function toggle() {
    setRegion(prev => {
      const next: Region = prev === 'uk' ? 'us' : 'uk'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <RegionContext.Provider value={{ region, toggle }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion(): RegionContextValue {
  return useContext(RegionContext)
}
