'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cancelSpeech, say, waitForVoices } from '../lib/speech'
import { useMute } from './useMute'

export interface UseSpeakResult {
  speak: (text: string, opts?: { onEnd?: () => void; onStart?: () => void }) => void
  stop: () => void
  isSpeaking: boolean
  ready: boolean
  muted: boolean
}

export function useSpeak(): UseSpeakResult {
  const [ready, setReady] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [muted] = useMute()
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false
    waitForVoices().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
      cancelRef.current?.()
      cancelSpeech()
      setIsSpeaking(false)
    }
  }, [])

  const speak = useCallback<UseSpeakResult['speak']>((text, opts) => {
    if (muted || !text) {
      opts?.onEnd?.()
      return
    }
    cancelRef.current?.()
    setIsSpeaking(true)
    cancelRef.current = say(text, {
      onStart: () => opts?.onStart?.(),
      onEnd: () => {
        setIsSpeaking(false)
        opts?.onEnd?.()
      },
      onError: () => {
        setIsSpeaking(false)
        opts?.onEnd?.()
      },
    })
  }, [muted])

  const stop = useCallback(() => {
    cancelRef.current?.()
    cancelSpeech()
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking, ready, muted }
}
