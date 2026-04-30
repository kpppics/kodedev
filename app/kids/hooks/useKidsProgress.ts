'use client'

import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

export type ModuleId = 'intro' | 'talk' | 'vibe' | 'picture' | 'video' | 'story'

export interface KidsProgress {
  completed: Partial<Record<ModuleId, true>>
  stickers: number
}

const PROGRESS_KEY = 'kodedev_kids_progress'
const EMPTY: KidsProgress = { completed: {}, stickers: 0 }

export function useKidsProgress() {
  const [progress, setProgress] = useState<KidsProgress>(() => readJSON(PROGRESS_KEY, EMPTY))

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_KEY) setProgress(readJSON(PROGRESS_KEY, EMPTY))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const markComplete = useCallback((id: ModuleId) => {
    setProgress(prev => {
      const alreadyDone = prev.completed[id]
      const next: KidsProgress = {
        completed: { ...prev.completed, [id]: true },
        stickers: alreadyDone ? prev.stickers : prev.stickers + 1,
      }
      writeJSON(PROGRESS_KEY, next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    writeJSON(PROGRESS_KEY, EMPTY)
    setProgress(EMPTY)
  }, [])

  return { progress, markComplete, reset }
}
