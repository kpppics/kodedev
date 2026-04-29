'use client'

import { useEffect, useState } from 'react'
import Icon from './Icon'

const ROTATING = [
  'production agents',
  'research workflows',
  'voice products',
  'coding copilots',
  'document pipelines',
  'creative tools',
]

const STATS = [
  { v: '9',     suffix: '',  label: 'Frontier models, one workspace' },
  { v: '500K',  suffix: '',  label: 'Token context window' },
  { v: '99.99', suffix: '%', label: 'API uptime, last 12 months' },
  { v: '0',     suffix: '',  label: 'Inputs used for training. Ever.' },
]

function useRotate(words: string[], ms = 2400) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % words.length), ms)
    return () => clearInterval(id)
  }, [words.length, ms])
  return words[i]
}

export default function Hero() {
  const word = useRotate(ROTATING)

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32 bg-noise">
      {/* aurora */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[55rem] h-[55rem] rounded-full blur-[120px] opacity-50 aurora-1"
             style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 60%)' }} />
        <div className="absolute top-[10%] right-[-15%] w-[50rem] h-[50rem] rounded-full blur-[120px] opacity-40 aurora-2"
             style={{ background: 'radial-gradient(circle, #0891b2 0%, transparent 60%)' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60rem] h-[60rem] rounded-full blur-[120px] opacity-35 aurora-3"
             style={{ background: 'radial-gradient(circle, #db2777 0%, transparent 60%)' }} />
      </div>
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-50" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <a
            href="#changelog"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-white/10 transition"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 pulse-dot" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span>New · Atlas Opus 4 + Deep Research are live</span>
            <Icon name="arrow" size={12} className="opacity-70 group-hover:translate-x-0.5 transition" />
          </a>

          <h1 className="font-display mt-7 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[1.05] max-w-5xl">
            One studio for every<br className="hidden sm:block" />
            {' '}<span className="text-prism">frontier model</span>{' '}
            you{`'`}ll ever need.
          </h1>

          <p className="mt-7 max-w-2xl text-lg md:text-xl text-text-muted leading-relaxed">
            Atlas, Forge, Nimbus, Prism, Lyra, Echo and Mira — plus deep research,
            real-time intel and an agent runtime — billed as one transparent pool of credits.
            Built for{' '}
            <span className="relative inline-block min-w-[12ch] text-left">
              <span key={word} className="font-semibold text-text animate-[fadeIn_0.4s_ease]">
                {word}
              </span>
            </span>
            .
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#signup"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-white text-bg px-6 py-3.5 text-sm font-semibold shadow-2xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.99] transition"
            >
              Start free — 500 credits
              <Icon name="arrow" size={16} />
            </a>
            <a
              href="#playground"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold text-text hover:bg-white/10 transition"
            >
              <Icon name="bolt" size={16} className="text-amber" /> Open the playground
            </a>
            <a
              href="#pricing"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-3.5 text-sm text-text-muted hover:text-text"
            >
              See pricing <Icon name="arrow" size={14} />
            </a>
          </div>

          <p className="mt-4 text-xs text-text-faint">
            No card. No training on your data. UK & EU data residency.
          </p>
        </div>

        {/* Hero card cluster */}
        <div className="mt-16 md:mt-20 grid lg:grid-cols-12 gap-5">
          <CodeCard className="lg:col-span-7" />
          <ModelStackCard className="lg:col-span-5" />
        </div>

        {/* Stats */}
        <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {STATS.map(s => (
            <div key={s.label} className="bg-bg/40 px-6 py-7">
              <dt className="font-display text-3xl md:text-4xl font-bold tabular tracking-tight">
                <span className="text-prism">{s.v}</span>
                <span className="text-text">{s.suffix}</span>
              </dt>
              <dd className="mt-2 text-sm text-text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </section>
  )
}

/* -------------------- code card -------------------- */
function CodeCard({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="border-glow rounded-2xl">
        <div className="card-glass p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="win-dot bg-rose-400/80" />
              <span className="win-dot bg-amber/80" />
              <span className="win-dot bg-emerald/80" />
              <span className="ml-3 text-xs font-mono text-text-faint">studio.kodedev.co.uk · /v1/messages</span>
            </div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-text-faint">
              POST · 200
            </span>
          </div>
          <pre className="font-mono text-[12.5px] leading-6 overflow-x-auto">
{`import Studio from '@kodedev/studio'

const studio = new Studio()       // uses KODEDEV_API_KEY

const reply = await studio.messages.create({
  `}<span className="text-violet-300">model</span>{`: `}<span className="text-emerald-300">'atlas-sonnet-4'</span>{`,
  `}<span className="text-violet-300">tools</span>{`: [studio.tools.deepResearch(), studio.tools.code()],
  `}<span className="text-violet-300">messages</span>{`: [{
    role: 'user',
    content: 'Brief me on UK fusion startups, with sources.'
  }]
})

console.log(reply.text)            // grounded answer
console.log(reply.citations)       // span-level provenance
`}
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
            <Pill tone="violet">atlas-sonnet-4</Pill>
            <Pill tone="cyan">+ deep-research</Pill>
            <Pill tone="amber">streaming</Pill>
            <Pill tone="emerald">12 sources cited</Pill>
            <span className="ml-auto text-text-faint font-mono">847ms · 12 credits</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'violet' | 'cyan' | 'amber' | 'emerald' }) {
  const tones: Record<string, string> = {
    violet: 'bg-violet-500/15 text-violet-200 border-violet-400/30',
    cyan: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30',
    amber: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
    emerald: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

/* -------------------- model stack card -------------------- */
function ModelStackCard({ className = '' }: { className?: string }) {
  const rows = [
    { name: 'Atlas Opus 4',   tag: 'Reasoning',     latency: '1.2s',  bar: 96, color: 'from-violet-400 to-fuchsia-400' },
    { name: 'Atlas Sonnet 4', tag: 'Balanced',      latency: '0.6s',  bar: 88, color: 'from-indigo-400 to-violet-400' },
    { name: 'Atlas Haiku 4',  tag: 'Fast',          latency: '0.4s',  bar: 74, color: 'from-cyan-400 to-emerald-400' },
    { name: 'Forge Code 2',   tag: 'Code',          latency: '0.5s',  bar: 92, color: 'from-amber-400 to-pink-400' },
    { name: 'Nimbus Vision',  tag: 'Multimodal',    latency: '0.8s',  bar: 81, color: 'from-cyan-400 to-violet-400' },
    { name: 'Prism Image 3',  tag: 'Generation',    latency: '3.1s',  bar: 85, color: 'from-pink-400 to-violet-400' },
  ]
  return (
    <div className={`card-glass p-5 md:p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-text-faint">Live · model router</p>
          <h3 className="font-display text-lg font-semibold mt-0.5">Pick the right model, automatically.</h3>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-emerald-200">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle pulse-dot" />
          All systems normal
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {rows.map(r => (
          <li key={r.name} className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] hover:bg-white/[0.05] px-3 py-2.5 transition">
            <span className={`h-8 w-8 rounded-lg bg-gradient-to-br ${r.color} grid place-items-center shadow-md`}>
              <span className="font-display font-bold text-bg/80 text-xs">{r.name.slice(0, 2)}</span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 justify-between">
                <span className="font-display font-medium text-sm truncate">{r.name}</span>
                <span className="text-[10px] font-mono text-text-faint">{r.latency}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${r.color}`}
                  style={{ width: `${r.bar}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/5 text-text-muted">{r.tag}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-text-muted">
        <span className="text-text">Auto-routing</span> picks the cheapest model that meets your quality bar.
        Average savings: <span className="text-emerald-300 font-semibold">42%</span>.
      </div>
    </div>
  )
}
