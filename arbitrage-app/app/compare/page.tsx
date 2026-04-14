'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MoneyCell, ProfitCell } from '../components/MoneyCell'
import { BuyButton } from '../components/BuyButton'
import { ProviderBadge } from '../components/ProviderBadge'
import { money } from '../lib/region'
import { pct } from '../lib/math'
import { loadSettings } from '../lib/settings'
import type { AnalyzeOutput } from '../lib/analyze'

interface Row {
  line: string
  resolved?: { title?: string; identifier?: string; image?: string; sourceName?: string; price?: number }
  amazon?: AnalyzeOutput
  ebay?: AnalyzeOutput
  bestProvider?: 'amazon' | 'ebay'
  cost?: number
  sourceUrl?: string
  error?: string
  loading?: boolean
}

function CompareInner() {
  const searchParams = useSearchParams()
  const [input, setInput] = useState('')
  const [cost, setCost] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [sort, setSort] = useState<'profit' | 'roi'>('profit')

  useEffect(() => {
    const prefill = searchParams?.get('prefill')
    if (prefill) setInput(prefill)
  }, [searchParams])

  useEffect(() => { setSort(loadSettings().sortBy) }, [])

  async function run() {
    const lines = input.split('\n').map(l => l.trim()).filter(Boolean)
    const defaultCost = parseFloat(cost) || 0
    const s = loadSettings()
    const initial: Row[] = lines.map(l => ({ line: l, loading: true, cost: defaultCost }))
    setRows(initial)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      try {
        let identifier = line
        let sourceUrl: string | undefined
        let rowCost = defaultCost
        let sourceName: string | undefined
        let title: string | undefined
        let image: string | undefined

        if (/^https?:\/\//i.test(line)) {
          sourceUrl = line
          const res = await fetch('/api/resolve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: line }) })
          const data = await res.json()
          if (data.product) {
            identifier = data.product.identifier || data.product.title || line
            if (data.product.price && (!rowCost || rowCost === 0)) rowCost = data.product.price
            sourceName = data.product.sourceName
            title = data.product.title
            image = data.product.image
          }
        }

        setRows(rs => rs.map((r, idx) => idx === i ? { ...r, resolved: { title, identifier, image, sourceName, price: rowCost } } : r))

        const common = { identifier, sourceCost: rowCost, sourceProvider: 'retail' as const, shipIn: s.shipIn, shipOut: s.shipOut, prep: s.prepCost, vatRegistered: s.vatRegistered, targetRoi: s.targetRoi, sourceUrl }
        const [amazon, ebay] = await Promise.all([
          fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...common, targetProvider: 'amazon' }) }).then(r => r.json()).catch(() => ({})),
          fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...common, targetProvider: 'ebay' }) }).then(r => r.json()).catch(() => ({})),
        ])
        const a: AnalyzeOutput | undefined = amazon.result
        const b: AnalyzeOutput | undefined = ebay.result
        const best: 'amazon' | 'ebay' | undefined = a && b ? (a.profit >= b.profit ? 'amazon' : 'ebay') : a ? 'amazon' : b ? 'ebay' : undefined

        setRows(rs => rs.map((r, idx) => idx === i ? { ...r, amazon: a, ebay: b, bestProvider: best, cost: rowCost, sourceUrl, loading: false } : r))
      } catch (e) {
        setRows(rs => rs.map((r, idx) => idx === i ? { ...r, loading: false, error: String((e as Error).message || e) } : r))
      }
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const ap = bestOf(a)?.profit ?? -Infinity
    const bp = bestOf(b)?.profit ?? -Infinity
    if (sort === 'roi') return (bestOf(b)?.roi ?? -Infinity) - (bestOf(a)?.roi ?? -Infinity)
    return bp - ap
  })

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>Compare</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
        One per line: ASIN, UPC, EAN, eBay ID, or any retailer URL.
      </p>

      <div className="card p-4 mb-4 flex flex-col gap-3">
        <textarea className="input" rows={5} value={input} onChange={e => setInput(e.target.value)} placeholder="B08N5WRWNW&#10;https://www.argos.co.uk/product/1234567&#10;5012345678900" />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" inputMode="decimal" placeholder="Default cost (overridden by URL)" value={cost} onChange={e => setCost(e.target.value)} />
          <select className="input" value={sort} onChange={e => setSort(e.target.value as 'profit' | 'roi')}>
            <option value="profit">Sort: absolute profit</option>
            <option value="roi">Sort: ROI %</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={run} disabled={!input.trim()}>Run</button>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((r, idx) => {
          const best = bestOf(r)
          return (
            <div key={idx} className="card p-4">
              <div className="flex items-start gap-3">
                {r.resolved?.image && <img src={r.resolved.image} alt="" className="w-16 h-16 object-contain rounded-md bg-white flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    {r.resolved?.sourceName && <ProviderBadge provider={r.resolved.sourceName} />}
                    {r.bestProvider && <span className="chip">Best: <b>{r.bestProvider}</b></span>}
                  </div>
                  <div className="font-medium truncate mt-1">{r.resolved?.title || r.line}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {r.resolved?.identifier || r.line}
                    {r.cost ? <> · cost <MoneyCell value={r.cost} /></> : null}
                  </div>
                </div>
                <div>{best && <ProfitCell value={best.profit} />}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <TargetCell label="Amazon" out={r.amazon} />
                <TargetCell label="eBay" out={r.ebay} />
              </div>

              {r.loading && <div className="skeleton h-4 w-40 mt-2" />}
              {r.error && <div className="chip chip-loss mt-2">{r.error}</div>}

              <div className="flex flex-wrap gap-2 mt-3">
                <BuyButton href={r.sourceUrl} label="Buy" />
                {best?.sellUrl && (
                  <a className="btn btn-ghost" href={best.sellUrl} target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
                    Open {r.bestProvider}
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Compare() {
  return <Suspense fallback={<div className="page">Loading…</div>}><CompareInner /></Suspense>
}

function bestOf(r: Row): AnalyzeOutput | undefined {
  if (!r.amazon && !r.ebay) return undefined
  if (!r.amazon) return r.ebay
  if (!r.ebay) return r.amazon
  return r.amazon.profit >= r.ebay.profit ? r.amazon : r.ebay
}

function TargetCell({ label, out }: { label: string; out?: AnalyzeOutput }) {
  if (!out || !out.targetPrice) return (
    <div>
      <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</div>
      <div style={{ color: 'var(--color-on-surface-variant)' }}>—</div>
    </div>
  )
  return (
    <div>
      <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</div>
      <div className="font-semibold num">{money(out.targetPrice)}</div>
      <div className="text-xs num" style={{ color: 'var(--color-on-surface-variant)' }}>
        profit {money(out.profit)} · ROI {pct(out.roi)}
      </div>
    </div>
  )
}
