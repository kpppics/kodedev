'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

type Color = 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange' | 'cream'

const COLOR_VAR: Record<Color, string> = {
  pink:   'var(--kids-pink)',
  yellow: 'var(--kids-yellow)',
  blue:   'var(--kids-blue)',
  green:  'var(--kids-green)',
  purple: 'var(--kids-purple)',
  orange: 'var(--kids-orange)',
  cream:  'var(--kids-cream)',
}

interface CommonProps {
  emoji?: string
  label?: ReactNode
  ariaLabel: string
  color?: Color
  size?: 'md' | 'lg' | 'xl'
  disabled?: boolean
  selected?: boolean
  className?: string
  style?: CSSProperties
}

interface ButtonProps extends CommonProps {
  href?: undefined
  onClick?: () => void
  type?: 'button' | 'submit'
}

interface LinkProps extends CommonProps {
  href: string
  onClick?: () => void
}

type Props = ButtonProps | LinkProps

const SIZE: Record<NonNullable<CommonProps['size']>, { px: number; emojiPx: number; pad: string; label: string }> = {
  md: { px: 96,  emojiPx: 44, pad: '14px',  label: 'text-base' },
  lg: { px: 132, emojiPx: 64, pad: '18px',  label: 'text-lg' },
  xl: { px: 168, emojiPx: 88, pad: '22px',  label: 'text-xl' },
}

export function BigButton(props: Props) {
  const {
    emoji,
    label,
    ariaLabel,
    color = 'pink',
    size = 'lg',
    disabled,
    selected,
    className = '',
    style,
    onClick,
  } = props
  const dims = SIZE[size]
  const sharedStyle: CSSProperties = {
    background: COLOR_VAR[color],
    minWidth: dims.px,
    minHeight: dims.px,
    padding: dims.pad,
    outline: selected ? '6px solid var(--kids-ink)' : undefined,
    outlineOffset: selected ? '4px' : undefined,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  }

  const inner = (
    <span className="flex flex-col items-center justify-center gap-1 leading-tight text-center w-full h-full">
      {emoji && (
        <span aria-hidden style={{ fontSize: dims.emojiPx, lineHeight: 1 }}>
          {emoji}
        </span>
      )}
      {label && <span className={`${dims.label} font-extrabold`}>{label}</span>}
    </span>
  )

  if ('href' in props && props.href) {
    return (
      <Link
        href={props.href}
        aria-label={ariaLabel}
        className={`kids-card kids-hover-lift inline-flex items-center justify-center ${className}`}
        style={sharedStyle}
        onClick={onClick}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type={(props as ButtonProps).type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={`kids-card kids-hover-lift inline-flex items-center justify-center ${className}`}
      style={sharedStyle}
    >
      {inner}
    </button>
  )
}
