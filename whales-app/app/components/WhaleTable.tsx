'use client'

import type { Whale } from '../data'

function formatUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function formatNum(n: number) {
  return n.toLocaleString('en-US')
}

const ACCENTS = {
  emerald: {
    border: 'border-emerald-400/30',
    pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
    text: 'text-emerald-300',
    bar: 'from-emerald-400 to-teal-400',
    glow: 'shadow-emerald-500/10',
  },
  indigo: {
    border: 'border-indigo-400/30',
    pill: 'bg-indigo-500/10 text-indigo-300 border-indigo-400/30',
    text: 'text-indigo-300',
    bar: 'from-indigo-400 to-violet-400',
    glow: 'shadow-indigo-500/10',
  },
} as const

type Props = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  accent: keyof typeof ACCENTS
  whales: Whale[]
  showVolume?: boolean
}

export default function WhaleTable({
  id,
  eyebrow,
  title,
  subtitle,
  accent,
  whales,
  showVolume,
}: Props) {
  const a = ACCENTS[accent]

  return (
    <section id={id} className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5 border ${a.pill}`}>
          <span className="material-symbols-outlined text-base">analytics</span>
          {eyebrow}
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
          {title}
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-12">{subtitle}</p>

        <div className="grid gap-4">
          {whales.map((w, i) => (
            <div
              key={w.addressShort}
              className={`group relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] border ${a.border} rounded-2xl p-6 md:p-7 hover:bg-white/[0.06] transition-all duration-300 ${a.glow} hover:shadow-2xl`}
            >
              <div className="grid md:grid-cols-12 gap-6 items-center">
                {/* Rank + name */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.bar} grid place-items-center font-headline font-black text-slate-950 text-lg shadow-lg`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline font-bold text-xl text-white truncate">
                      {w.name}
                    </div>
                    <div className="text-xs font-mono text-slate-500 truncate">
                      {w.addressShort}
                    </div>
                  </div>
                </div>

                {/* Profit */}
                <div className="md:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    Profit
                  </div>
                  <div className={`font-headline text-2xl font-black ${a.text} counter-num`}>
                    {formatUsd(w.profitUsd)}
                  </div>
                </div>

                {/* Bets / Win rate */}
                <div className="md:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    Bets
                  </div>
                  <div className="font-headline text-xl font-bold text-white counter-num">
                    {formatNum(w.bets)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {w.winRate}% win rate
                  </div>
                </div>

                {/* Volume (optional) */}
                {showVolume && w.volumeUsd && (
                  <div className="md:col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Volume
                    </div>
                    <div className="font-headline text-xl font-bold text-white counter-num">
                      {formatUsd(w.volumeUsd)}
                    </div>
                  </div>
                )}

                {/* Strategy */}
                <div className={showVolume ? 'md:col-span-2' : 'md:col-span-4'}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    Strategy
                  </div>
                  <div className="text-sm text-slate-300 leading-snug">
                    {w.strategy}
                  </div>
                  {w.flag && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {w.flag}
                    </div>
                  )}
                </div>
              </div>

              {/* Win rate bar */}
              <div className="mt-5 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${a.bar} rounded-full transition-all duration-1000`}
                  style={{ width: `${w.winRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
