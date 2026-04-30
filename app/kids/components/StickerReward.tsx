'use client'

import { useEffect } from 'react'

interface StickerRewardProps {
  show: boolean
  onClose: () => void
  message?: string
}

export function StickerReward({ show, onClose, message = 'Great job!' }: StickerRewardProps) {
  useEffect(() => {
    if (!show) return
    const id = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(id)
  }, [show, onClose])

  if (!show) return null
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Sticker reward"
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(43, 38, 64, 0.45)' }}
      onClick={onClose}
    >
      <div className="kids-card sticker-star px-10 py-8 text-center bg-white" style={{ maxWidth: 360 }}>
        <div className="text-7xl mb-2" aria-hidden>⭐</div>
        <div className="kids-headline text-3xl mb-2">{message}</div>
        <div className="text-lg font-bold" style={{ color: 'var(--kids-ink-soft)' }}>
          You earned a sticker!
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reward"
          className="kids-pill mt-5 text-lg"
          style={{ background: 'var(--kids-yellow)' }}
        >
          🎉 Yay!
        </button>
      </div>
    </div>
  )
}
