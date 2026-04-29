'use client'

import { useMemo, useState } from 'react'
import Icon from './Icon'

const MODELS = [
  { id: 'opus',   name: 'Atlas Opus 4',   in: 1500, out: 7500 },
  { id: 'sonnet', name: 'Atlas Sonnet 4', in: 300,  out: 1500 },
  { id: 'haiku',  name: 'Atlas Haiku 4',  in: 80,   out: 400  },
  { id: 'forge',  name: 'Forge Code 2',   in: 200,  out: 1000 },
]

function fmtCredits(c: number) {
  if (c >= 1_000_000) return (c / 1_000_000).toFixed(2) + 'M'
  if (c >= 1_000) return (c / 1_000).toFixed(c >= 10_000 ? 0 : 1) + 'k'
  return c.toFixed(0)
}

function fmtGBP(c: number) {
  const gbp = c / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: gbp >= 100 ? 0 : 2,
  }).format(gbp)
}

export default function Calculator() {
  const [model, setModel] = useState('sonnet')
  const [requests, setRequests] = useState(50_000) // /month
  const [inTok, setInTok] = useState(2_000)
  const [outTok, setOutTok] = useState(600)

  const m = MODELS.find(x => x.id === model)!

  const monthly = useMemo(() => {
    const inCredits = (requests * inTok / 1_000_000) * m.in
    const outCredits = (requests * outTok / 1_000_000) * m.out
    return { in: inCredits, out: outCredits, total: inCredits + outCredits }
  }, [requests, inTok, outTok, m.in, m.out])

  return (
    <section id="credits" className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/3 w-[40rem] h-[40rem] rounded-full blur-[120px] opacity-20 aurora-3"
             style={{ background: 'radial-gradient(circle, #0e7490 0%, transparent 60%)' }} />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300">Credits</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            One unit of value. <span className="text-prism">Zero surprises.</span>
          </h2>
          <p className="mt-5 text-lg text-text-muted">
            <span className="font-mono text-text">1 credit = £0.01</span>. Every model and product is priced in credits.
            Your plan tops up your balance. Failed requests are never charged. Plan credits roll over for 60 days.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-5 gap-5">
          {/* Calculator */}
          <div className="lg:col-span-3 card-glass p-6">
            <div className="flex items-center gap-2">
              <Icon name="graph" size={18} className="text-emerald-300" />
              <h3 className="font-display text-lg font-semibold">Estimate your monthly spend</h3>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-2">
              {MODELS.map(x => (
                <button
                  key={x.id}
                  onClick={() => setModel(x.id)}
                  className={`text-left rounded-xl border px-4 py-3 transition ${
                    model === x.id
                      ? 'border-violet-400/60 bg-violet-500/10'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="font-display font-medium">{x.name}</div>
                  <div className="text-[11px] font-mono text-text-faint mt-0.5">
                    {x.in} in / {x.out} out per 1M tok
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-7 space-y-6">
              <Slider
                label="Requests per month"
                value={requests}
                min={1_000} max={5_000_000} step={1_000}
                format={n => n.toLocaleString('en-GB')}
                onChange={setRequests}
              />
              <Slider
                label="Avg input tokens / request"
                value={inTok}
                min={100} max={50_000} step={100}
                format={n => n.toLocaleString('en-GB')}
                onChange={setInTok}
              />
              <Slider
                label="Avg output tokens / request"
                value={outTok}
                min={50} max={20_000} step={50}
                format={n => n.toLocaleString('en-GB')}
                onChange={setOutTok}
              />
            </div>
          </div>

          {/* Result panel */}
          <aside className="lg:col-span-2 relative">
            <div className="border-glow rounded-2xl">
              <div className="card-glass p-6 h-full">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-text-faint">Estimated</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display tabular text-5xl md:text-6xl font-bold text-prism">
                    {fmtGBP(monthly.total)}
                  </span>
                  <span className="text-text-faint text-sm">/ month</span>
                </div>
                <p className="text-xs text-text-faint mt-1 tabular">
                  ≈ {fmtCredits(monthly.total)} credits
                </p>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                  <Row label="Input" credits={monthly.in} />
                  <Row label="Output" credits={monthly.out} />
                  <Row label="Total" credits={monthly.total} bold />
                </div>

                <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Icon name="bolt" size={14} /> Auto-routing saves you
                  </div>
                  <p className="text-text-muted mt-1.5">
                    Send only hard turns to {m.name}. Average savings on mixed traffic:{' '}
                    <span className="text-text font-semibold">42%</span>
                    {' '}→ <span className="text-emerald-300 font-semibold tabular">{fmtGBP(monthly.total * 0.58)} / mo</span>.
                  </p>
                </div>

                <a
                  href="#pricing"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-text hover:text-violet-200 transition"
                >
                  See plans <Icon name="arrow" size={13} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Row({ label, credits, bold }: { label: string; credits: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${bold ? 'text-text font-semibold' : 'text-text-muted'}`}>
      <span className="text-sm">{label}</span>
      <span className="font-mono tabular text-sm">
        {fmtCredits(credits)} credits
        <span className="text-text-faint"> · {fmtGBP(credits)}</span>
      </span>
    </div>
  )
}

function Slider({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  format: (n: number) => string; onChange: (n: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="font-mono tabular text-sm text-text">{format(value)}</span>
      </div>
      <input
        type="range"
        className="slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}
