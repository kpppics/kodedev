'use client'

import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Services',  href: '#services' },
  { label: 'Work',      href: '#portfolio' },
  { label: 'Process',   href: '#how-it-works' },
  { label: 'About',     href: '#about' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      id="navbar"
      className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all"
      style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none' }}
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <div className="text-2xl font-bold tracking-tighter text-slate-900 font-headline">
          KODEDEV <span className="text-[10px] align-top font-body font-normal text-slate-400 tracking-normal ml-1">est. 2026</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a key={link.label} className="font-headline font-medium text-sm text-slate-600 hover:text-primary transition-colors" href={link.href}>
              {link.label}
            </a>
          ))}
          <a
            className="bg-primary text-white px-6 py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
            href="#quote"
          >
            Get a Quote
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </nav>

      <div
        className="md:hidden bg-white border-t border-slate-100 overflow-hidden transition-all duration-400"
        style={{ maxHeight: menuOpen ? '420px' : '0' }}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              className="font-headline font-medium text-slate-700 py-3 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
          <a
            className="bg-primary text-white text-center font-headline font-bold py-4 px-4 rounded-full mt-2 shadow-lg shadow-primary/20"
            href="#quote"
            onClick={closeMenu}
          >
            Get a Quote
          </a>
        </div>
      </div>
    </header>
  )
}
