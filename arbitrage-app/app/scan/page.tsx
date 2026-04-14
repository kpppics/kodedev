'use client'
import { useEffect, useState, useCallback } from 'react'
import { CameraScanner } from '../components/CameraScanner'
import { MoneyCell, ProfitCell } from '../components/MoneyCell'
import { BuyButton } from '../components/BuyButton'
import { loadSettings } from '../lib/settings'
import { CONFIG, money } from '../lib/region'
import { pct } from '../lib/math'
import type { AnalyzeOutput } from '../lib/analyze'

export default function Scan() {
  const [cost, setCost] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeOutput | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [armed, setArmed] = useState(false)

  const onDetected = useCallback(async (c: string) => {
    if (loading) return
    setCode(c); setResult(null); setErr(null); setLoading(true)
    try {
      const s = loadSettings()
      const body = {
        identifier: c,
        sourceCost: parseFloat(cost) || 0,
        sourceProvider: 'retail',
        targetProvider: 'amazon',
        shipIn: s.shipIn, shipOut: s.shipOut, prep: s.prepCost, vatRegistered: s.vatRegistered, targetRoi: s.targetRoi,
      }
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'analyze failed')
      setResult(data.result)
    } catch (e) {
      setErr(String((e as Error).message || e))
    } finally {
      setLoading(false)
    }
  }, [loading, cost])

  useEffect(() => {
    if (!armed) return
    const key = (e: KeyboardEvent) => { /* allow dev testing */ if (e.key === 'Enter' && code) onDetected(code) }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [armed, code, onDetected])

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>In-store scanner</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
        Aim at a barcode. Allow camera access when prompted.
      </p>

      <div className="card p-3 mb-4">
        <label className="text-sm font-semibold mb-1 block">In-store price ({CONFIG.symbol})</label>
        <input className="input" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 2.99" />
      </div>

      {!armed ? (
        <button className="btn btn-primary w-full mb-4" onClick={() => setArmed(true)}>
          <span className="material-symbols-outlined">photo_camera</span> Start camera
        </button>
      ) : (
        <CameraScanner onDetected={onDetected} />
      )}

      {code && (
        <div className="mt-4 card p-4">
          <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>Scanned</div>
          <div className="font-mono text-lg">{code}</div>
          {loading && <div className="mt-2 skeleton h-6 w-32" />}
          {err && <div className="chip chip-loss mt-2">{err}</div>}
          {result && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">{result.title || 'Amazon listing'}</div>
                <ProfitCell value={result.profit} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span style={{ color: 'var(--color-on-surface-variant)' }}>Target</span> <MoneyCell value={result.targetPrice} /></div>
                <div><span style={{ color: 'var(--color-on-surface-variant)' }}>ROI</span> <span className="num">{pct(result.roi)}</span></div>
                <div><span style={{ color: 'var(--color-on-surface-variant)' }}>Max buy</span> <MoneyCell value={result.maxBuyPrice} /></div>
                <div><span style={{ color: 'var(--color-on-surface-variant)' }}>Fees</span> <MoneyCell value={result.targetFees} /></div>
              </div>
              {parseFloat(cost) > 0 && result.maxBuyPrice > 0 && (
                <div className={`chip ${parseFloat(cost) <= result.maxBuyPrice ? 'chip-profit' : 'chip-loss'}`}>
                  {parseFloat(cost) <= result.maxBuyPrice ? `Buy — under max (${money(result.maxBuyPrice)})` : `Skip — over max (${money(result.maxBuyPrice)})`}
                </div>
              )}
              <div className="flex gap-2">
                <BuyButton href={result.sellUrl} label="Open Amazon" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
