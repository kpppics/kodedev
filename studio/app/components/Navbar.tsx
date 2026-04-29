'use client'

import { useEffect, useState } from 'react'
import Icon from './Icon'

const NAV = [
  { href: '#models', label: 'Models' },
  { href: '#research', label: 'Research' },
  { href: '#playground', label: 'Studio' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#docs', label: 'Docs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-bg/70 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <Icon name="logo" size={18} className="text-white" />
          </span>
          <span className="font-display font-bold tracking-tight text-base">
            KODEDEV<span className="text-text-faint mx-1">·</span>
            <span className="text-prism">STUDIO</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <a
              key={n.href}
              href={n.href}
              className="px-3.5 py-2 text-sm font-medium text-text-muted hover:text-text rounded-lg hover:bg-white/5 transition"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#signin"
            className="hidden sm:inline-flex px-3.5 py-2 text-sm font-medium text-text-muted hover:text-text"
          >
            Sign in
          </a>
          <a
            href="#signup"
            className="relative inline-flex items-center gap-1.5 bg-white text-bg px-4 py-2 rounded-lg text-sm font-semibold hover:bg-text transition shadow-lg shadow-white/10"
          >
            Start free <Icon name="arrow" size={14} />
          </a>
          <button
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-white/5"
            aria-label="Menu"
            onClick={() => setOpen(o => !o)}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-bg/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV.map(n => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-text-muted hover:text-text"
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
