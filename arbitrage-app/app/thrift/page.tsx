'use client'
import { useState, useRef } from 'react'
import { MoneyCell, ProfitCell } from '../components/MoneyCell'
import { CONFIG, money } from '../lib/region'
import { pct } from '../lib/math'
import type { ThriftResponse } from '../lib/vision/types'

export default function Thrift() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cost, setCost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ThriftResponse | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function pickFile(f: File) {
    setFile(f); setResult(null); setErr(null)
    setPreview(URL.createObjectURL(f))
  }

  async function run() {
    if (!file) return
    setLoading(true); setErr(null); setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('askingPrice', cost || '0')
      const res = await fetch('/api/thrift', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'thrift analysis failed')
      setResult(data.result)
    } catch (e) {
      setErr(String((e as Error).message || e))
    } finally {
      setLoading(false)
    }
  }

  const confidenceChip = result ? (
    <span className={`chip ${result.identification.confidence === 'high' ? 'chip-profit' : result.identification.confidence === 'medium' ? 'chip-warn' : 'chip-loss'}`}>
      {result.identification.confidence} confidence
    </span>
  ) : null

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>Thrift scanner</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
        Photo → AI identifies → eBay sold comps → profit estimate.
      </p>

      <div className="card p-4 flex flex-col gap-3">
        {preview ? (
          <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4 / 3', background: '#000' }}>
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <button className="btn btn-ghost absolute top-2 right-2" onClick={() => { setFile(null); setPreview(null); setResult(null) }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        ) : (
          <button className="btn btn-primary w-full" style={{ minHeight: 120, fontSize: 18 }} onClick={() => inputRef.current?.click()}>
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>add_a_photo</span>
            <span>Take or choose photo</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
        />
        <div>
          <label className="text-sm font-semibold mb-1 block">Asking price ({CONFIG.symbol})</label>
          <input className="input" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 2.00" />
        </div>
        <button className="btn btn-primary w-full" disabled={!file || loading} onClick={run}>
          {loading ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Identifying…</> : 'Identify & value'}
        </button>
        {err && <div className="chip chip-loss">{err}</div>}
      </div>

      {result && (
        <div className="card p-4 mt-4 flex flex-col gap-4">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>{result.identification.brand} · {result.identification.category}</div>
            <div className="font-semibold text-lg">{result.identification.title}</div>
            <div className="flex flex-wrap gap-2 mt-2">{confidenceChip}{result.identification.visibleText.map((t, i) => <span key={i} className="chip">{t}</span>)}</div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>Sold low (P25)</div>
              <div className="text-lg font-semibold num">{money(result.valuation.lowEnd)}</div>
            </div>
            <div>
              <div className="text-xs uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>Median</div>
              <div className="text-lg font-semibold num">{money(result.valuation.median)}</div>
            </div>
            <div>
              <div className="text-xs uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>High (P75)</div>
              <div className="text-lg font-semibold num">{money(result.valuation.highEnd)}</div>
            </div>
          </div>

          <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            {result.comps.soldCount} sold · {result.comps.activeCount} active comps
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>Profit at median</div>
              <ProfitCell value={result.profit.atMedian} />
              <span className="ml-2 text-xs num" style={{ color: 'var(--color-on-surface-variant)' }}>({pct(result.profit.roiAtMedian)} ROI)</span>
            </div>
            <div className="text-xs text-right" style={{ color: 'var(--color-on-surface-variant)' }}>
              at low <MoneyCell value={result.profit.atLowEnd} />
            </div>
          </div>

          {result.comps.sampleListings.length > 0 && (
            <div>
              <div className="text-xs uppercase mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Sold comps</div>
              <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
                {result.comps.sampleListings.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="card card-hover p-2 w-32 flex-shrink-0">
                    {l.image && <div className="w-full h-20 rounded-md bg-white mb-2 overflow-hidden"><img src={l.image} alt="" className="w-full h-full object-contain" /></div>}
                    <div className="text-[11px] line-clamp-2">{l.title}</div>
                    <div className="text-sm font-semibold num mt-1">{money(l.price)}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <a className="btn btn-outline" href={result.buyLinks.ebaySearchUrl} target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>Open eBay sold comps
          </a>

          {(result.identification.confidence === 'low' || result.comps.soldCount < 5) && (
            <div className="chip chip-warn">Insufficient comps — verify manually before buying</div>
          )}
        </div>
      )}
    </div>
  )
}
