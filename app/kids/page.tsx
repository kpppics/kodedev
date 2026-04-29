'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BigButton } from './components/BigButton'
import { MascotStage } from './components/MascotStage'
import { useMascot } from './hooks/useMascot'
import { useKidsProgress, type ModuleId } from './hooks/useKidsProgress'
import { MASCOT_GREETINGS, MODULE_EMOJI, MODULE_TITLES, pickOne } from './lib/mascotLines'
import { AudioToggle } from './components/AudioToggle'

interface ModuleTile {
  id: ModuleId
  href: string
  color: 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange'
}

const MODULES: ModuleTile[] = [
  { id: 'intro',   href: '/kids/intro',   color: 'purple' },
  { id: 'talk',    href: '/kids/talk',    color: 'blue' },
  { id: 'vibe',    href: '/kids/vibe',    color: 'green' },
  { id: 'picture', href: '/kids/picture', color: 'pink' },
  { id: 'video',   href: '/kids/video',   color: 'orange' },
  { id: 'story',   href: '/kids/story',   color: 'yellow' },
]

export default function KidsHubPage() {
  const mascot = useMascot()
  const { progress } = useKidsProgress()
  const [hasGreeted, setHasGreeted] = useState(false)
  const greetingRef = useRef<string>('')

  if (!greetingRef.current) {
    greetingRef.current = pickOne(MASCOT_GREETINGS)
  }

  useEffect(() => {
    return () => mascot.setState('idle')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startGreeting = () => {
    if (hasGreeted) {
      mascot.say(greetingRef.current)
      return
    }
    setHasGreeted(true)
    mascot.say(greetingRef.current)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-4 gap-3">
        <div
          className="kids-card flex items-center gap-2 px-4"
          style={{ height: 64, background: 'var(--kids-yellow)' }}
          aria-label={`${progress.stickers} stickers earned`}
        >
          <span className="text-2xl" aria-hidden>⭐</span>
          <span className="text-xl font-extrabold tabular-nums">{progress.stickers}</span>
        </div>
        <h1 className="kids-headline text-3xl sm:text-4xl text-center flex-1">Little KODE Dev</h1>
        <AudioToggle />
      </header>

      {/* Greeting / mascot intro */}
      <section className="flex flex-col items-center justify-center pt-2 pb-6 px-4 gap-3">
        <MascotStage
          state={mascot.state}
          caption={hasGreeted ? mascot.caption || greetingRef.current : undefined}
          size={180}
          position="inline"
          onTap={startGreeting}
        />
        {!hasGreeted && (
          <button
            type="button"
            onClick={startGreeting}
            className="kids-pill text-xl"
            style={{ background: 'var(--kids-pink)', color: 'white' }}
            aria-label="Tap to hear Kodey say hello"
          >
            🔊 Tap to say hi!
          </button>
        )}
      </section>

      {/* Module grid */}
      <section className="px-4 pb-8 flex-1">
        <div
          className="grid gap-4 max-w-3xl mx-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
        >
          {MODULES.map(m => {
            const done = progress.completed[m.id]
            return (
              <BigButton
                key={m.id}
                href={m.href}
                emoji={MODULE_EMOJI[m.id]}
                label={
                  <span className="flex items-center gap-1">
                    {MODULE_TITLES[m.id]}
                    {done && <span aria-label="completed">⭐</span>}
                  </span>
                }
                ariaLabel={MODULE_TITLES[m.id]}
                color={m.color}
                size="lg"
                onClick={() => mascot.react('cheering', 600)}
              />
            )
          })}
        </div>
      </section>

      {/* Discreet exit to grown-up site */}
      <footer className="text-center pb-6 px-4">
        <Link
          href="/"
          className="text-sm font-bold underline"
          style={{ color: 'var(--kids-ink-soft)' }}
        >
          Grown-up site
        </Link>
      </footer>
    </div>
  )
}
