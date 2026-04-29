'use client'

import { useEffect, useRef, useState } from 'react'
import { say as speakRaw, cancelSpeech } from '../lib/speech'
import { useMute } from '../hooks/useMute'
import {
  CHARACTERS,
  COLORS,
  type WidgetSpec,
} from '../lib/widgetSpec'

interface Emit {
  id: number
  emoji: string
  x: number
  y: number
}

interface MiniWidgetProps {
  spec: WidgetSpec
}

/**
 * Renders a tiny working widget from a declarative WidgetSpec.
 * Tapping it executes the spec.action — never evaluates user code.
 */
export function MiniWidget({ spec }: MiniWidgetProps) {
  const [animClass, setAnimClass] = useState<string>('')
  const [emits, setEmits] = useState<Emit[]>([])
  const animTimer = useRef<number | null>(null)
  const emitId = useRef(0)
  const [muted] = useMute()

  useEffect(() => () => {
    if (animTimer.current) window.clearTimeout(animTimer.current)
    cancelSpeech()
  }, [])

  const charEmoji = CHARACTERS.find(c => c.id === spec.character)?.emoji ?? '⭐'
  const colorHex  = COLORS.find(c => c.id === spec.color)?.hex ?? 'var(--kids-pink)'

  const handleTap = () => {
    const a = spec.action
    if (a.kind === 'speak' && a.text && !muted) {
      cancelSpeech()
      speakRaw(a.text, { rate: 1, pitch: 1.3 })
    } else if (a.kind === 'animate' && a.anim) {
      const cls = `kw-anim-${a.anim}`
      setAnimClass(cls)
      if (animTimer.current) window.clearTimeout(animTimer.current)
      animTimer.current = window.setTimeout(() => setAnimClass(''), 800)
    } else if (a.kind === 'emit' && a.emoji) {
      const newEmits: Emit[] = Array.from({ length: 6 }).map((_, i) => ({
        id: ++emitId.current,
        emoji: a.emoji!,
        x: 30 + (i * 12) - 6 + Math.random() * 20,
        y: 60,
      }))
      setEmits(prev => [...prev, ...newEmits])
      window.setTimeout(() => {
        setEmits(prev => prev.filter(e => !newEmits.find(n => n.id === e.id)))
      }, 1300)
    }
  }

  // visual shell varies by shape
  const shapeStyle: React.CSSProperties =
    spec.shape === 'button'
      ? { borderRadius: 9999, padding: '20px 32px' }
      : spec.shape === 'card'
      ? { borderRadius: 24, padding: 24, minWidth: 200 }
      : { borderRadius: 12, padding: 28, minWidth: 200 }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleTap}
        aria-label="Tap the widget"
        className={`kids-card text-center ${animClass}`}
        style={{
          background: colorHex,
          color: 'var(--kids-ink)',
          fontWeight: 800,
          fontSize: 22,
          ...shapeStyle,
        }}
      >
        <span className="text-5xl block leading-none mb-1" aria-hidden>{charEmoji}</span>
        <span className="text-base">Tap me!</span>
      </button>
      {emits.map(e => (
        <span
          key={e.id}
          className="kw-emit"
          style={{ left: `${e.x}%`, top: `${e.y}%` }}
          aria-hidden
        >
          {e.emoji}
        </span>
      ))}
    </div>
  )
}
