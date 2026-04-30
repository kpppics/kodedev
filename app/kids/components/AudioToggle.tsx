'use client'

import { useMute } from '../hooks/useMute'

export function AudioToggle() {
  const [muted, toggle] = useMute()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={muted}
      className="kids-card flex items-center justify-center text-3xl"
      style={{ width: 64, height: 64, padding: 0 }}
    >
      <span aria-hidden>{muted ? '🔇' : '🔊'}</span>
    </button>
  )
}
