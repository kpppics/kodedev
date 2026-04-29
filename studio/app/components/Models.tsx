'use client'

import { useState, useMemo } from 'react'
import { MODELS, type Model, type Modality } from '../data'
import Icon from './Icon'

const FILTERS: { id: 'all' | Modality; label: string }[] = [
  { id: 'all', label: 'All models' },
  { id: 'text', label: 'Text' },
  { id: 'code', label: 'Code' },
  { id: 'vision', label: 'Vision' },
  { id: 'image', label: 'Image' },
  { id: 'audio', label: 'Audio' },
  { id: 'embedding', label: 'Embeddings' },
]

const FAMILY_GRADIENT: Record<Model['family'], string> = {
  Atlas: 'from-violet-500 via-indigo-500 to-cyan-400',
  Forge: 'from-amber-400 via-pink-500 to-violet-500',
  Nimbus: 'from-cyan-400 via-indigo-400 to-violet-500',
  Prism: 'from-pink-400 via-fuchsia-500 to-violet-500',
  Lyra: 'from-emerald-400 via-cyan-400 to-indigo-400',
  Echo: 'from-amber-400 via-rose-400 to-fuchsia-400',
  Mira: 'from-cyan-400 via-emerald-400 to-amber-400',
}

const TIER_LABEL: Record<Model['tier'], string> = {
  flagship: 'Flagship',
  balanced: 'Balanced',
  fast: 'Fast',
  specialist: 'Specialist',
}

function fmt(n?: number) {
  if (n === undefined) return '—'
  if (n < 10) return n.toFixed(1)
  return n.toLocaleString('en-GB')
}

function modalityIcon(m: Modality): React.ComponentProps<typeof Icon>['name'] {
  switch (m) {
    case 'text': return 'doc'
    case 'code': return 'code'
    case 'vision':
    case 'image': return 'image'
    case 'audio': return 'wave'
    case 'video': return 'image'
    case 'embedding': return 'layers'
    default: return 'spark'
  }
}

export default function Models() {
  const [filter, setFilter] = useState<'all' | Modality>('all')

  const list = useMemo(
    () => filter === 'all' ? MODELS : MODELS.filter(m => m.modalities.includes(filter)),
    [filter]
  )

  return (
    <section id="models" className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-30" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-violet-300">Models</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Frontier models, every modality, <span className="text-prism">one bill</span>.
          </h2>
          <p className="mt-5 text-lg text-text-muted">
            Nine production models, picked or auto-routed for the job. Same SDK,
            same workspace, same credits — no juggling five accounts.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition border ${
                filter === f.id
                  ? 'bg-white text-bg border-white shadow-lg shadow-white/10'
                  : 'bg-white/[0.03] border-white/10 text-text-muted hover:text-text hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(m => (
            <ModelCard key={m.id} m={m} />
          ))}
        </div>

        <p className="mt-8 text-sm text-text-faint">
          Prices in <span className="text-text-muted">credits</span>. 1 credit = £0.01. Token rates per 1,000,000 tokens.
        </p>
      </div>
    </section>
  )
}

function ModelCard({ m }: { m: Model }) {
  return (
    <article
      className={`group relative card-glass p-5 flex flex-col ${
        m.highlight ? 'ring-1 ring-violet-400/40' : ''
      }`}
    >
      {m.highlight && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-bg shadow">
          Recommended
        </span>
      )}

      <header className="flex items-start gap-3">
        <span
          className={`h-11 w-11 rounded-xl bg-gradient-to-br ${FAMILY_GRADIENT[m.family]} grid place-items-center shadow-lg`}
        >
          <span className="font-display font-bold text-bg/80 text-sm">
            {m.family.slice(0, 2).toUpperCase()}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-tight">{m.name}</h3>
          <p className="text-[11px] tracking-wider uppercase font-semibold mt-0.5 text-text-faint">
            {m.family} · {TIER_LABEL[m.tier]}
          </p>
        </div>
      </header>

      <p className="mt-3 text-sm text-text-muted leading-relaxed">{m.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.modalities.map(md => (
          <span
            key={md}
            className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[11px] text-text-muted"
          >
            <Icon name={modalityIcon(md)} size={12} className="opacity-80" />
            {md}
          </span>
        ))}
      </div>

      {m.benchmarks && (
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          {m.benchmarks.slice(0, 4).map(b => (
            <div key={b.label} className="rounded-md bg-white/[0.025] border border-white/5 px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wider text-text-faint">{b.label}</div>
              <div className="font-display font-semibold tabular text-sm">{b.value}</div>
            </div>
          ))}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-text-faint">Context</dt>
          <dd className="font-mono text-text mt-0.5">{m.context}</dd>
        </div>
        {m.maxOutput && (
          <div>
            <dt className="text-text-faint">Max output</dt>
            <dd className="font-mono text-text mt-0.5">{m.maxOutput}</dd>
          </div>
        )}
      </dl>

      {m.best && (
        <ul className="mt-4 space-y-1 text-[12.5px] text-text-muted">
          {m.best.slice(0, 4).map(b => (
            <li key={b} className="flex items-start gap-1.5">
              <Icon name="check" size={14} className="text-violet-300 mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-5 pt-4 border-t border-white/5 flex items-end justify-between gap-3">
        <div>
          {m.inPer1M !== undefined ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-text-faint">Price</div>
              <div className="font-display tabular text-sm mt-0.5">
                <span className="text-text font-semibold">{fmt(m.inPer1M)}</span>
                <span className="text-text-faint"> in </span>
                <span className="text-text font-semibold">/ {fmt(m.outPer1M)}</span>
                <span className="text-text-faint"> out </span>
                <span className="text-text-faint text-xs">credits / 1M tok</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] uppercase tracking-wider text-text-faint">Price</div>
              <div className="font-display tabular text-sm mt-0.5">
                <span className="text-text font-semibold">{fmt(m.unitCost)}</span>
                <span className="text-text-faint"> credits {m.unitLabel}</span>
              </div>
            </>
          )}
          {m.unitLabel && m.inPer1M !== undefined && (
            <div className="text-[11px] text-text-faint mt-1">{m.unitLabel}</div>
          )}
        </div>
        <a
          href={`#playground`}
          className="text-xs font-semibold inline-flex items-center gap-1 text-violet-200 hover:text-text transition"
        >
          Try it <Icon name="arrow" size={12} />
        </a>
      </footer>
    </article>
  )
}
