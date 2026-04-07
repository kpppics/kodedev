'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useApp } from '../providers'

const NAV = [
  { href: '/browse', label: 'Browse' },
  { href: '/categories', label: 'Categories' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/safety', label: 'Safety' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, hydrated } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? 'bg-[#0b1020]/90 backdrop-blur border-b border-white/10'
          : 'bg-[#0b1020]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative inline-flex h-9 w-9 rounded-xl bg-brand items-center justify-center shadow-soft">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>
              photo_camera
            </span>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-300 border-2 border-[#0b1020]" />
          </span>
          <span className="font-display text-white text-lg font-bold leading-none">
            Capture<span className="text-brand-light">Press</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname?.startsWith(n.href + '/')
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                  active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/upload" className="btn btn-primary text-sm py-2 px-4">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add_a_photo
            </span>
            Upload
          </Link>
          {hydrated && user ? (
            <Link href="/account" className="btn btn-ghost text-sm py-2 px-3">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                account_circle
              </span>
              {user.name.split(' ')[0]}
            </Link>
          ) : (
            <Link href="/signin" className="btn btn-ghost text-sm py-2 px-4">
              Sign in
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-white hover:bg-white/10"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0b1020]">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/upload" className="btn btn-primary flex-1 text-sm">
                Upload
              </Link>
              {hydrated && user ? (
                <Link href="/account" className="btn btn-ghost flex-1 text-sm">
                  Account
                </Link>
              ) : (
                <Link href="/signin" className="btn btn-ghost flex-1 text-sm">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
