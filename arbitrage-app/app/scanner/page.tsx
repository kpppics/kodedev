'use client'
import { useRef, useState } from 'react'
import { CsvDropzone } from '../components/CsvDropzone'
import { MoneyCell, ProfitCell } from '../components/MoneyCell'
import { money } from '../lib/region'
import { pct } from '../lib/math'
import { loadSettings } from '../lib/settings'
import type { AnalyzeOutput } from '../lib/analyze'

interface Row {
  index: number
  identifier: string
  cost: number
  title?: string
  best?: AnalyzeOutput | null
  error?: string
}

export default function Scanner() {
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState<'all' | 'profit' | 'roi30'>('profit')
  const abortRef = useRef<AbortController | null>(null)

  async function start(file: File) {
    setRows([]); setTotal(0); setRunning(true)
    const s = loadSettings()
    const fd = new FormData()
    fd.append('file', file)
    fd.append('vatRegistered', s.vatRegistered ? 'true' : 'false')

    const ac = new AbortController()
    abortRef.current = ac
    try {
      const res = await fetch('/api/scan', { method: 'POST', body: fd, signal: ac.signal })
      if (!res.body) { setRunning(false); return }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let idx
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2)
          const eventMatch = chunk.match(/^event: (.+)$/m)
          const dataMatch = chunk.match(/^data: (.+)$/m)
          if (!eventMatch || !dataMatch) continue
          const event = eventMatch[1]
          const data = JSON.parse(dataMatch[1])
          if (event === 'start') setTotal(data.total)
          else if (event === 'row') setRows(rs => [...rs, data])
          else if (event === 'done') setRunning(false)
          else if (event === 'error') setRows(rs => [...rs, { index: data.index, identifier: data.identifier, cost: 0, error: data.message }])
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e)
    } finally {
      setRunning(false)
    }
  }

  function stop() { abortRef.current?.abort() }

  function exportCsv() {
    const header = ['identifier', 'title', 'cost', 'target', 'targetPrice', 'fees', 'profit', 'roi', 'maxBuy']
    const lines = [header.join(',')]
    for (const r of rows) {
      if (!r.best) continue
      lines.push([r.identifier, JSON.stringify(r.title || ''), r.cost, r.best.target, r.best.targetPrice, r.best.targetFees, r.best.profit, r.best.roi, r.best.maxBuyPrice].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'arbitrage-results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = rows.filter(r => {
    if (!r.best) return filter === 'all'
    if (filter === 'profit') return r.best.profit > 0
    if (filter === 'roi30') return r.best.roi >= 0.30
    return true
  }).sort((a, b) => (b.best?.profit ?? -Infinity) - (a.best?.profit ?? -Infinity))

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>Bulk CSV scanner</h1>

      {!running && rows.length === 0 && <CsvDropzone onFile={start} />}

      {(running || rows.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="chip">{rows.length}/{total || '?'}</span>
          {running ? <button className="btn btn-ghost" onClick={stop}>Stop</button> : <button className="btn btn-ghost" onClick={() => { setRows([]); setTotal(0) }}>Clear</button>}
          <select className="input" style={{ maxWidth: 200 }} value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
            <option value="profit">Profitable only</option>
            <option value="roi30">ROI ≥ 30%</option>
            <option value="all">All</option>
          </select>
          {rows.some(r => r.best) && <button className="btn btn-outline" onClick={exportCsv}>Export CSV</button>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((r, i) => (
          <div key={i} className="card p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono truncate" style={{ color: 'var(--color-on-surface-variant)' }}>{r.identifier}</div>
                <div className="font-medium truncate">{r.title || r.best?.title || '—'}</div>
              </div>
              <div>{r.best ? <ProfitCell value={r.best.profit} /> : <span className="chip">—</span>}</div>
            </div>
            {r.best && (
              <div className="grid grid-cols-4 gap-2 text-xs mt-2 num" style={{ color: 'var(--color-on-surface-variant)' }}>
                <div>Cost <MoneyCell value={r.cost} /></div>
                <div>Sell <MoneyCell value={r.best.targetPrice} /> <span className="chip" style={{ fontSize: 9 }}>{r.best.target}</span></div>
                <div>ROI {pct(r.best.roi)}</div>
                <div>Max {money(r.best.maxBuyPrice)}</div>
              </div>
            )}
            {r.error && <div className="chip chip-loss mt-2">{r.error}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
