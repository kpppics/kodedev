'use client'
import { useEffect, useState } from 'react'
import { MoneyCell, ProfitCell } from '../components/MoneyCell'
import { BuyButton } from '../components/BuyButton'
import { ProviderBadge } from '../components/ProviderBadge'
import { money } from '../lib/region'
import { pct } from '../lib/math'
import type { AnalyzeOutput } from '../lib/analyze'

interface DealRow {
  item: { title: string; url: string; price?: number; source: string; description?: string }
  analysis: AnalyzeOutput | null
}

export default function Deals() {
  const [rows, setRows] = useState<DealRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/deals')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'deals failed')
      setRows(data.deals || [])
    } catch (e) { setErr(String((e as Error).message || e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-headline)' }}>Live deals</h1>
        <button className="btn btn-ghost" onClick={load} disabled={loading} aria-label="Refresh">
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`} style={{ fontSize: 20 }}>refresh</span>
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
        Crowdsourced deal feeds, scored against live Amazon/eBay prices. Sorted by profit.
      </p>

      {err && <div className="chip chip-loss mb-3">{err}</div>}

      {loading && rows.length === 0 && (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-5 w-3/4 mb-2" /><div className="skeleton h-4 w-1/2" /></div>)}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={i} className="card p-4 card-hover">
            <div className="flex items-center gap-2 mb-1">
              <ProviderBadge provider={r.item.source} />
              {r.item.price && <span className="chip">Source {money(r.item.price)}</span>}
              {r.analysis?.target && <span className="chip">→ {r.analysis.target}</span>}
            </div>
            <a href={r.item.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{r.item.title}</a>
            <div className="flex items-end justify-between mt-3 gap-3">
              <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                {r.analysis ? <>
                  Target <MoneyCell value={r.analysis.targetPrice} /> · ROI <span className="num">{pct(r.analysis.roi)}</span> · Max buy <MoneyCell value={r.analysis.maxBuyPrice} />
                </> : 'No analysis — possibly unsupported item'}
              </div>
              {r.analysis && <ProfitCell value={r.analysis.profit} />}
            </div>
            <div className="flex gap-2 mt-3">
              <BuyButton href={r.item.url} label="Buy source" />
              {r.analysis?.sellUrl && (
                <a className="btn btn-ghost" href={r.analysis.sellUrl} target="_blank" rel="noopener noreferrer">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
                  Open {r.analysis.target}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && rows.length === 0 && !err && (
        <div className="card p-6 text-center" style={{ color: 'var(--color-on-surface-variant)' }}>
          No deals yet. Try refreshing.
        </div>
      )}
    </div>
  )
}
