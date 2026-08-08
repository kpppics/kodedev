'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Icon from './Icon'

const LINKS = [
  { label: 'Websites', href: '/websites' },
  { label: 'Web apps', href: '/apps' },
  { label: 'iOS apps', href: '/ios-apps' },
  { label: 'AI & automation', href: '/ai-automation' },
  { label: 'Work', href: '/work' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        scrolled || open ? 'bg-ink/92 backdrop-blur-md border-b border-line' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1180px] px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="text-lg font-semibold tracking-[-0.02em] text-cream">KODEDEV</span>
          <span className="hidden sm:inline text-xs text-cream-dim">UK software studio</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-cream-dim hover:text-cream transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-primary">
            Start a project
          </Link>
        </nav>

        <button
          type="button"
          className="lg:hidden -mr-2 min-w-11 min-h-11 flex items-center justify-center text-cream"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(v => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} className="w-6 h-6" />
        </button>
      </div>

      {/* Full-screen sheet on mobile */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-ink/98 backdrop-blur-md overflow-y-auto"
      >
        <nav className="px-6 py-8 flex flex-col" aria-label="Mobile">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="d3 py-4 border-b border-line text-cream hover:text-accent transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary mt-8 w-full">
            Start a project
          </Link>
          <a
            href="mailto:karl@kodedev.co.uk"
            className="mt-4 inline-flex items-center min-h-11 text-sm text-cream-dim"
          >
            karl@kodedev.co.uk
          </a>
        </nav>
      </div>
    </header>
  )
}
