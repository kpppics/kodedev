'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cancelSpeech } from '../lib/speech'
import { AudioToggle } from './AudioToggle'
import { useKidsProgress } from '../hooks/useKidsProgress'

interface ModuleShellProps {
  title: string
  emoji: string
  color?: string
  children: ReactNode
}

export function ModuleShell({ title, emoji, color = 'var(--kids-blue)', children }: ModuleShellProps) {
  const { progress } = useKidsProgress()

  useEffect(() => {
    return () => cancelSpeech()
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingBottom: 200 }}>
      <header
        className="flex items-center gap-3 px-4 py-4 sticky top-0 z-20"
        style={{
          background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
        }}
      >
        <Link
          href="/kids"
          aria-label="Go home"
          className="kids-card flex items-center justify-center text-3xl"
          style={{ width: 64, height: 64, padding: 0, background: 'white' }}
        >
          🏠
        </Link>
        <div
          className="kids-card flex-1 flex items-center gap-3 px-4"
          style={{ height: 64, background: 'white' }}
        >
          <span className="text-3xl" aria-hidden>{emoji}</span>
          <h1 className="kids-headline text-xl sm:text-2xl flex-1 truncate">{title}</h1>
        </div>
        <div
          className="kids-card flex items-center justify-center px-3 gap-1"
          style={{ height: 64, background: 'var(--kids-yellow)' }}
          aria-label={`${progress.stickers} stickers earned`}
        >
          <span className="text-2xl" aria-hidden>⭐</span>
          <span className="text-xl font-extrabold tabular-nums">{progress.stickers}</span>
        </div>
        <AudioToggle />
      </header>

      <main className="flex-1 px-4 pt-2">{children}</main>
    </div>
  )
}
