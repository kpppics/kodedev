'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type ThemeMode = 'light' | 'dark'

export type AccentSwatch = {
  name: string
  base: string
  strong: string
  deep: string
}

export const ACCENTS: AccentSwatch[] = [
  { name: 'Emerald', base: '#34d399', strong: '#6ee7b7', deep: '#10b981' },
  { name: 'Cyan',    base: '#22d3ee', strong: '#67e8f9', deep: '#0891b2' },
  { name: 'Sky',     base: '#38bdf8', strong: '#7dd3fc', deep: '#0284c7' },
  { name: 'Indigo',  base: '#818cf8', strong: '#a5b4fc', deep: '#4f46e5' },
  { name: 'Violet',  base: '#a78bfa', strong: '#c4b5fd', deep: '#7c3aed' },
  { name: 'Pink',    base: '#f472b6', strong: '#f9a8d4', deep: '#db2777' },
  { name: 'Rose',    base: '#fb7185', strong: '#fda4af', deep: '#e11d48' },
  { name: 'Amber',   base: '#fbbf24', strong: '#fcd34d', deep: '#d97706' },
  { name: 'Lime',    base: '#a3e635', strong: '#bef264', deep: '#65a30d' },
]

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggleMode: () => void
  accent: AccentSwatch
  setAccent: (name: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY_MODE = 'whale-theme-mode'
const STORAGE_KEY_ACCENT = 'whale-theme-accent'

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark')
  const [accent, setAccentState] = useState<AccentSwatch>(ACCENTS[0])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null
      if (savedMode === 'light' || savedMode === 'dark') {
        setModeState(savedMode)
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setModeState('light')
      }
      const savedAccent = localStorage.getItem(STORAGE_KEY_ACCENT)
      const found = ACCENTS.find(a => a.name === savedAccent)
      if (found) setAccentState(found)
    } catch {
      /* noop */
    }
    setHydrated(true)
  }, [])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    try {
      localStorage.setItem(STORAGE_KEY_MODE, m)
    } catch {
      /* noop */
    }
  }, [])

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY_MODE, next)
      } catch {
        /* noop */
      }
      return next
    })
  }, [])

  const setAccent = useCallback((name: string) => {
    const found = ACCENTS.find(a => a.name === name)
    if (!found) return
    setAccentState(found)
    try {
      localStorage.setItem(STORAGE_KEY_ACCENT, name)
    } catch {
      /* noop */
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, toggleMode, accent, setAccent }),
    [mode, setMode, toggleMode, accent, setAccent],
  )

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="whale-app min-h-screen font-body"
        data-theme={mode}
        suppressHydrationWarning
        style={
          {
            '--whale-accent': accent.base,
            '--whale-accent-strong': accent.strong,
            '--whale-accent-deep': accent.deep,
            // Avoid flash before hydration by hiding momentarily
            visibility: hydrated ? 'visible' : 'hidden',
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
