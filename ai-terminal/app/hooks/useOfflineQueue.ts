'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface QueuedMessage {
  rawInput: string
  isVoice: boolean
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true)
  const queueRef = useRef<QueuedMessage[]>([])
  const [queuedCount, setQueuedCount] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const enqueue = useCallback((msg: QueuedMessage) => {
    queueRef.current.push(msg)
    setQueuedCount(queueRef.current.length)
  }, [])

  const flush = useCallback(
    async (sendFn: (rawInput: string, isVoice: boolean) => Promise<void>) => {
      const messages = [...queueRef.current]
      queueRef.current = []
      setQueuedCount(0)
      for (const msg of messages) {
        await sendFn(msg.rawInput, msg.isVoice)
      }
    },
    []
  )

  return { isOnline, queuedCount, enqueue, flush }
}
