import { money } from '../lib/region'

export function MoneyCell({ value, className, muted }: { value: number; className?: string; muted?: boolean }) {
  if (!Number.isFinite(value)) return <span className={className}>—</span>
  return <span className={`num ${className || ''}`} style={muted ? { color: 'var(--color-on-surface-variant)' } : undefined}>{money(value)}</span>
}

export function ProfitCell({ value }: { value: number }) {
  if (!Number.isFinite(value)) return <span className="chip">—</span>
  const cls = value > 0.5 ? 'chip-profit' : value < -0.5 ? 'chip-loss' : 'chip-warn'
  return <span className={`chip ${cls} num`}>{money(value)}</span>
}
