'use client'

import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#perfect-records', label: 'Whales' },
  { href: '#live', label: 'Live' },
  { href: '#strategies', label: 'Strategies' },
  { href: '#tools', label: 'Tools' },
  { href: '#kalshi', label: 'Kalshi' },
  { href: '#api', label: 'API' },
  { href: '#playbook', label: 'Playbook' },
]

export default function WhaleNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/whales" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center text-slate-950 font-headline font-black text-lg shadow-lg shadow-emerald-500/30">
            W
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
          </div>
          <div className="font-headline text-xl font-bold tracking-tight">
            WHALE<span className="text-emerald-400">.</span>TRACKER
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://t.me/polylerts_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-full font-headline font-bold text-sm hover:bg-emerald-300 transition-colors"
          >
            Get Alerts
          </a>
        </nav>

        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          className="md:hidden w-10 h-10 grid place-items-center rounded-lg bg-white/5 border border-white/10"
        >
          <span className="material-symbols-outlined text-slate-200">
            {open ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-lg border-t border-white/10">
          <nav className="px-6 py-6 flex flex-col gap-4">
            {LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-emerald-400"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://t.me/polylerts_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-400 text-slate-950 px-5 py-3 rounded-full font-headline font-bold text-center"
            >
              Get Alerts
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
