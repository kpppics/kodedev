'use client'

import { Mascot, type MascotState } from './Mascot'

interface MascotStageProps {
  state: MascotState
  caption?: string
  size?: number
  onTap?: () => void
  position?: 'corner' | 'center' | 'inline'
}

export function MascotStage({
  state,
  caption,
  size = 140,
  onTap,
  position = 'corner',
}: MascotStageProps) {
  const baseStyle =
    position === 'corner'
      ? { position: 'fixed' as const, right: 16, bottom: 16, zIndex: 30 }
      : position === 'center'
      ? { position: 'relative' as const }
      : { position: 'relative' as const }

  return (
    <div style={baseStyle} className="flex flex-col items-center gap-2 pointer-events-none">
      {caption && (
        <div
          className="kids-bubble pointer-events-auto"
          style={{ maxWidth: 260, fontSize: 16, marginBottom: 6 }}
        >
          {caption}
        </div>
      )}
      <button
        type="button"
        onClick={onTap}
        aria-label="Tap mascot"
        className="pointer-events-auto"
        style={{ background: 'transparent', border: 0, padding: 0, cursor: onTap ? 'pointer' : 'default' }}
      >
        <Mascot state={state} size={size} />
      </button>
    </div>
  )
}
