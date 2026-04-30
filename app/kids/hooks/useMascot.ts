'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MascotState } from '../components/Mascot'
import { useSpeak } from './useSpeak'

export interface UseMascotResult {
  state: MascotState
  setState: (s: MascotState) => void
  caption: string
  /** Speak text and animate the mouth. Returns a promise resolving on end. */
  say: (text: string) => Promise<void>
  /** Briefly enter a non-idle state (e.g. cheering) for `ms`. */
  react: (s: MascotState, ms?: number) => void
  isSpeaking: boolean
  ready: boolean
  muted: boolean
}

/**
 * Mascot state machine. Wires speech ↔ animation state so the mascot
 * mouths along to TTS and returns to idle when speech ends.
 */
export function useMascot(): UseMascotResult {
  const [state, setStateRaw] = useState<MascotState>('idle')
  const [caption, setCaption] = useState('')
  const { speak, isSpeaking, ready, muted, stop } = useSpeak()
  const reactTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (reactTimer.current) window.clearTimeout(reactTimer.current)
    stop()
  }, [stop])

  const setState = useCallback((s: MascotState) => {
    if (reactTimer.current) {
      window.clearTimeout(reactTimer.current)
      reactTimer.current = null
    }
    setStateRaw(s)
  }, [])

  const say = useCallback((text: string): Promise<void> => {
    setCaption(text)
    return new Promise(resolve => {
      setStateRaw('talking')
      speak(text, {
        onEnd: () => {
          setStateRaw('idle')
          resolve()
        },
      })
    })
  }, [speak])

  const react = useCallback((s: MascotState, ms = 1200) => {
    if (reactTimer.current) window.clearTimeout(reactTimer.current)
    setStateRaw(s)
    reactTimer.current = window.setTimeout(() => {
      setStateRaw('idle')
      reactTimer.current = null
    }, ms)
  }, [])

  return { state, setState, caption, say, react, isSpeaking, ready, muted }
}
