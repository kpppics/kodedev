import { money } from '../lib/region'

export function FeeBreakdown({ fees, total }: { fees: Record<string, number>; total: number }) {
  const entries = Object.entries(fees).filter(([, v]) => v > 0)
  if (entries.length === 0) return <span className="num" style={{ color: 'var(--color-on-surface-variant)' }}>{money(total)}</span>
  return (
    <div className="flex flex-col gap-1 text-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <span style={{ color: 'var(--color-on-surface-variant)' }}>{labelFor(k)}</span>
          <span className="num">{money(v)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 pt-1 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
        <span className="font-semibold">Total fees</span>
        <span className="num font-semibold">{money(total)}</span>
      </div>
    </div>
  )
}

function labelFor(k: string): string {
  switch (k) {
    case 'referral': return 'Referral'
    case 'fulfilment': return 'FBA'
    case 'closing': return 'Closing'
    case 'fvf': return 'Final value'
    case 'fixed': return 'Fixed'
    default: return k
  }
}
