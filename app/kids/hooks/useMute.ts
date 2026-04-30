'use client'

import { useCallback, useEffect, useState } from 'react'
import { readString, writeString } from '../lib/storage'

const MUTE_KEY = 'kodedev_kids_muted'

export function useMute(): readonly [boolean, () => void, (v: boolean) => void] {
  const [muted, setMuted] = useState<boolean>(() => readString(MUTE_KEY, '0') === '1')

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MUTE_KEY) setMuted(e.newValue === '1')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      writeString(MUTE_KEY, next ? '1' : '0')
      return next
    })
  }, [])

  const set = useCallback((v: boolean) => {
    setMuted(v)
    writeString(MUTE_KEY, v ? '1' : '0')
  }, [])

  return [muted, toggle, set] as const
}
