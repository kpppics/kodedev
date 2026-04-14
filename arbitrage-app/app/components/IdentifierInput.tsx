'use client'
import { detectIdentifierType } from '../lib/resolver/resolver'
import { matchMarketplace } from '../lib/marketplaces'

export function IdentifierInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const kind = value ? detectIdentifierType(value) : null
  const marketplace = kind === 'url' ? matchMarketplace(value) : null

  return (
    <div className="flex flex-col gap-2">
      <input
        className="input"
        type="text"
        inputMode="text"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder || 'ASIN, UPC, EAN, eBay ID, or retailer URL'}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {kind && kind !== 'unknown' && (
        <div className="flex flex-wrap items-center gap-1 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
          <span className="chip">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {kind === 'url' ? 'link' : kind === 'asin' ? 'tag' : 'qr_code'}
            </span>
            {kind.toUpperCase()}
          </span>
          {marketplace && <span className="chip">{marketplace.name} ({marketplace.country.toUpperCase()})</span>}
        </div>
      )}
    </div>
  )
}
