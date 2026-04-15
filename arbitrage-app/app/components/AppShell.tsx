'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { RegionProvider, useRegion } from '../lib/regionContext'

const NAV = [
  { href: '/deals', label: 'Deals', icon: 'local_fire_department' },
  { href: '/scan', label: 'Scan', icon: 'qr_code_scanner' },
  { href: '/thrift', label: 'Thrift', icon: 'photo_camera' },
  { href: '/compare', label: 'Compare', icon: 'compare_arrows' },
  { href: '/more', label: 'More', icon: 'more_horiz' },
] as const

const MORE = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/calculator', label: 'Calculator', icon: 'calculate' },
  { href: '/scanner', label: 'Bulk CSV', icon: 'upload_file' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

const ALL = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/deals', label: 'Deals', icon: 'local_fire_department' },
  { href: '/scan', label: 'Scan', icon: 'qr_code_scanner' },
  { href: '/thrift', label: 'Thrift', icon: 'photo_camera' },
  { href: '/compare', label: 'Compare', icon: 'compare_arrows' },
  { href: '/calculator', label: 'Calculator', icon: 'calculate' },
  { href: '/scanner', label: 'Bulk CSV', icon: 'upload_file' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === '1'
  const { region, toggle } = useRegion()
  const regionFlag = region === 'us' ? '🇺🇸' : '🇬🇧'
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto')

  useEffect(() => {
    const saved = localStorage.getItem('arbitrage:theme') as 'auto' | 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])
  useEffect(() => {
    const el = document.documentElement
    if (theme === 'auto') el.removeAttribute('data-theme')
    else el.setAttribute('data-theme', theme)
    localStorage.setItem('arbitrage:theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'auto' ? 'dark' : t === 'dark' ? 'light' : 'auto')
  const themeIcon = theme === 'auto' ? 'brightness_auto' : theme === 'dark' ? 'dark_mode' : 'light_mode'

  return (
    <>
      <header className="topbar">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg" style={{ fontFamily: 'var(--font-headline)' }}>
          <span className="inline-grid place-items-center w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 20 }}>bolt</span>
          </span>
          <span className="gradient-text">Arbitrage</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="chip" style={{ cursor: 'pointer' }} title={region.toUpperCase()} onClick={toggle}>{regionFlag} {region.toUpperCase()}</button>
          {isMock && <span className="chip chip-warn" title="Mock mode">MOCK</span>}
          <button className="btn btn-ghost" style={{ minWidth: 44, padding: '0 12px' }} onClick={toggleTheme} aria-label="Toggle theme">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{themeIcon}</span>
          </button>
        </div>
      </header>

      <aside className="sidebar">
        <div className="mb-6 px-3 text-xs uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>Navigation</div>
        {ALL.map(n => {
          const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href))
          return (
            <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{n.icon}</span>
              {n.label}
            </Link>
          )
        })}
      </aside>

      <main>
        {children}
      </main>

      <nav className="tabbar" aria-label="Primary">
        {NAV.map(n => {
          const href: string = n.href
          const active = href === '/more'
            ? MORE.some(m => pathname === m.href || (m.href !== '/' && pathname.startsWith(m.href)))
            : pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={n.href} href={n.href === '/more' ? '/settings' : n.href} aria-current={active ? 'page' : undefined}>
              <span className="material-symbols-outlined">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RegionProvider>
      <AppShellInner>{children}</AppShellInner>
    </RegionProvider>
  )
}
