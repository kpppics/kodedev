'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/browse', label: 'Browse', icon: 'explore' },
  { href: '/upload', label: 'Upload', icon: 'add_a_photo', primary: true },
  { href: '/categories', label: 'Topics', icon: 'category' },
  { href: '/account', label: 'Me', icon: 'person' },
]

export default function MobileTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed md:hidden bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-line bottom-safe">
      <div className="grid grid-cols-5 h-16">
        {TABS.map((t) => {
          const active =
            t.href === '/'
              ? pathname === '/' || pathname === '/'
              : pathname === t.href || pathname?.startsWith(t.href + '/')
          if (t.primary) {
            return (
              <Link key={t.href} href={t.href} className="flex flex-col items-center justify-center">
                <span className="-mt-6 inline-flex h-14 w-14 rounded-full bg-brand text-white items-center justify-center shadow-soft border-4 border-white">
                  <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{t.icon}</span>
                </span>
                <span className="text-[10px] font-semibold text-ink mt-1">{t.label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                active ? 'text-brand' : 'text-mute'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{t.icon}</span>
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
