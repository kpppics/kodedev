'use client'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DealsError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[deals] page error:', error)
  }, [error])

  return (
    <div className="page">
      <div className="card p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-headline)' }}>
          Deals failed to load
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono" style={{ color: 'var(--color-on-surface-variant)' }}>
            Digest: {error.digest}
          </p>
        )}
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  )
}
