'use client'
import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '../lib/settings'
import { CONFIG, REGION } from '../lib/region'

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setS(loadSettings()) }, [])

  function patch<K extends keyof Settings>(k: K, v: Settings[K]) {
    const next = { ...s, [k]: v }
    setS(next); saveSettings(next)
    setSaved(true); setTimeout(() => setSaved(false), 1000)
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>Settings</h1>

      <div className="card p-4 flex flex-col gap-4">
        <Row label={`Target ROI (%)`}>
          <input className="input" inputMode="decimal" type="number" step="5" value={Math.round(s.targetRoi * 100)}
            onChange={e => patch('targetRoi', (parseFloat(e.target.value) || 0) / 100)} />
        </Row>
        <Row label={`Prep cost per unit (${CONFIG.symbol})`}>
          <input className="input" inputMode="decimal" type="number" step="0.1" value={s.prepCost}
            onChange={e => patch('prepCost', parseFloat(e.target.value) || 0)} />
        </Row>
        <Row label={`Inbound shipping (${CONFIG.symbol})`}>
          <input className="input" inputMode="decimal" type="number" step="0.1" value={s.shipIn}
            onChange={e => patch('shipIn', parseFloat(e.target.value) || 0)} />
        </Row>
        <Row label={`Outbound shipping — eBay/FBM (${CONFIG.symbol})`}>
          <input className="input" inputMode="decimal" type="number" step="0.1" value={s.shipOut}
            onChange={e => patch('shipOut', parseFloat(e.target.value) || 0)} />
        </Row>
        {CONFIG.vat.enabled && (
          <Row label={`VAT registered (${Math.round(CONFIG.vat.rate * 100)}%)`}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={s.vatRegistered} onChange={e => patch('vatRegistered', e.target.checked)} />
              <span className="text-sm">Calculate referral/FVF on ex-VAT price</span>
            </label>
          </Row>
        )}
        {CONFIG.salesTax.enabled && (
          <Row label="Sales tax rate (%)">
            <input className="input" inputMode="decimal" type="number" step="0.25" value={s.salesTaxRate * 100}
              onChange={e => patch('salesTaxRate', (parseFloat(e.target.value) || 0) / 100)} />
          </Row>
        )}
        <Row label="Default sort">
          <select className="input" value={s.sortBy} onChange={e => patch('sortBy', e.target.value as 'profit' | 'roi')}>
            <option value="profit">Absolute profit</option>
            <option value="roi">ROI %</option>
          </select>
        </Row>
        <Row label="Theme">
          <select className="input" value={s.theme} onChange={e => patch('theme', e.target.value as Settings['theme'])}>
            <option value="auto">Auto (system)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Row>
        <Row label="Region">
          <div className="chip">{REGION === 'us' ? '🇺🇸 US' : '🇬🇧 UK'} — set via REGION env var</div>
        </Row>
      </div>

      {saved && <div className="chip chip-profit mt-3">Saved</div>}

      <div className="card p-4 mt-4">
        <h2 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-headline)' }}>Install on iPhone</h2>
        <ol className="text-sm list-decimal pl-5 space-y-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          <li>Open this site in Safari.</li>
          <li>Tap the Share button.</li>
          <li>Choose <b>Add to Home Screen</b>.</li>
          <li>Launch from the home screen for a full-screen experience with camera access.</li>
        </ol>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1">{label}</label>
      {children}
    </div>
  )
}
