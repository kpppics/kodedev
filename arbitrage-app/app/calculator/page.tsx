'use client'
import { useEffect, useState } from 'react'
import { IdentifierInput } from '../components/IdentifierInput'
import { FeeBreakdown } from '../components/FeeBreakdown'
import { BuyButton } from '../components/BuyButton'
import { MoneyCell, ProfitCell } from '../components/MoneyCell'
import { loadSettings, type Settings } from '../lib/settings'
import { money, CONFIG } from '../lib/region'
import { pct } from '../lib/math'
import type { AnalyzeOutput } from '../lib/analyze'

export default function Calculator() {
  const [identifier, setIdentifier] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [cost, setCost] = useState('')
  const [target, setTarget] = useState<'amazon' | 'ebay'>('amazon')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeOutput | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => { setSettings(loadSettings()) }, [])

  async function run() {
    setErr(null); setResult(null); setLoading(true)
    try {
      let id = identifier.trim()
      let buyUrl: string | undefined
      if (!id && sourceUrl) {
        const res = await fetch('/api/resolve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: sourceUrl }) })
        const data = await res.json()
        id = data.product?.identifier || data.product?.title || ''
        if (data.product?.price && !cost) setCost(String(data.product.price))
        buyUrl = sourceUrl
      } else if (/^https?:\/\//i.test(id)) {
        const res = await fetch('/api/resolve', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: id }) })
        const data = await res.json()
        buyUrl = id
        id = data.product?.identifier || data.product?.title || ''
        if (data.product?.price && !cost) setCost(String(data.product.price))
      }
      if (!id) throw new Error('No identifier resolved')
      const body = {
        identifier: id,
        sourceCost: parseFloat(cost) || 0,
        sourceProvider: 'retail' as const,
        targetProvider: target,
        shipIn: settings?.shipIn ?? 0,
        shipOut: settings?.shipOut ?? 3,
        prep: settings?.prepCost ?? 0.5,
        vatRegistered: settings?.vatRegistered ?? false,
        targetRoi: settings?.targetRoi ?? 0.3,
        sourceUrl: buyUrl || sourceUrl || undefined,
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
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'var(--font-headline)' }}>Calculator</h1>

      <div className="card p-4 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block">Product</label>
          <IdentifierInput value={identifier} onChange={setIdentifier} placeholder="ASIN / UPC / EAN / eBay ID / any retailer URL" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold mb-1 block">Cost ({CONFIG.symbol})</label>
            <input className="input" inputMode="decimal" type="text" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Sell on</label>
            <select className="input" value={target} onChange={e => setTarget(e.target.value as 'amazon' | 'ebay')}>
              <option value="amazon">Amazon</option>
              <option value="ebay">eBay</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold mb-1 block">Or paste a retailer URL</label>
          <input className="input" type="url" inputMode="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://…" />
        </div>
        <button className="btn btn-primary w-full" disabled={loading || (!identifier && !sourceUrl)} onClick={run}>
          {loading ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>Running…</> : <>Analyse</>}
        </button>
        {err && <div className="chip chip-loss">{err}</div>}
      </div>

      {result && (
        <div className="card p-4 mt-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>{result.title || result.identifier}</div>
              <div className="text-2xl font-semibold">
                <MoneyCell value={result.targetPrice} /> <span className="text-sm font-normal" style={{ color: 'var(--color-on-surface-variant)' }}>on {result.target}</span>
              </div>
            </div>
            <ProfitCell value={result.profit} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="Net rev" value={money(result.netRevenue)} />
            <Stat label="ROI" value={pct(result.roi)} />
            <Stat label="Margin" value={pct(result.margin)} />
            <Stat label="Max buy" value={money(result.maxBuyPrice)} />
          </div>

          <details>
            <summary className="text-sm font-semibold cursor-pointer">Fee breakdown</summary>
            <div className="mt-2"><FeeBreakdown fees={result.feeBreakdown} total={result.targetFees} /></div>
          </details>

          {result.buyBoxInfo && (
            <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              Amazon offers: {result.buyBoxInfo.offerCount} · FBA: {result.buyBoxInfo.fbaOfferCount} · Amazon on listing: {result.buyBoxInfo.amazonOnListing ? 'Yes' : 'No'}
              {result.lowCompetition && <span className="ml-2 chip chip-profit">Low competition</span>}
            </div>
          )}
          {result.ebayInfo && (
            <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              eBay sold median {money(result.ebayInfo.soldMedian)} (P25 {money(result.ebayInfo.soldP25)} / P75 {money(result.ebayInfo.soldP75)}) · {result.ebayInfo.soldCount} sold · {result.ebayInfo.listingCount} active
            </div>
          )}

          <div className="sticky-action">
            <BuyButton href={result.buyUrl} label="Buy source" />
            <BuyButton href={result.sellUrl} label="Open target listing" />
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</div>
      <div className="text-lg font-semibold num">{value}</div>
    </div>
  )
}
