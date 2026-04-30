'use client'

import type { CSSProperties } from 'react'

interface PromptChipProps {
  emoji: string
  label: string
  ariaLabel?: string
  selected?: boolean
  onClick?: () => void
  color?: 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange' | 'cream' | 'white'
  size?: 'sm' | 'md' | 'lg'
}

const COLOR: Record<NonNullable<PromptChipProps['color']>, string> = {
  pink:   '#ffd6f5',
  yellow: '#fff1c0',
  blue:   '#cdeeff',
  green:  '#cdf5e0',
  purple: '#e3d4ff',
  orange: '#ffe2c2',
  cream:  '#fff8e7',
  white:  '#ffffff',
}

const SIZE: Record<NonNullable<PromptChipProps['size']>, { px: number; emoji: number }> = {
  sm: { px: 72,  emoji: 36 },
  md: { px: 96,  emoji: 52 },
  lg: { px: 120, emoji: 72 },
}

export function PromptChip({
  emoji,
  label,
  ariaLabel,
  selected = false,
  onClick,
  color = 'white',
  size = 'md',
}: PromptChipProps) {
  const dims = SIZE[size]
  const style: CSSProperties = {
    background: COLOR[color],
    minWidth: dims.px,
    minHeight: dims.px,
    outline: selected ? '5px solid var(--kids-ink)' : undefined,
    outlineOffset: selected ? '3px' : undefined,
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      aria-pressed={selected}
      className="kids-card kids-hover-lift flex flex-col items-center justify-center gap-1 p-3"
      style={style}
    >
      <span aria-hidden style={{ fontSize: dims.emoji, lineHeight: 1 }}>{emoji}</span>
      <span className="text-sm font-extrabold">{label}</span>
    </button>
  )
}
