'use client'

import { useEffect, useState } from 'react'
import { LB_API_BASE, type LeaderboardEntry } from '../data'

function formatUsd(n: number) {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n)}`
}

function shortAddress(addr: string) {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
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

export type LeaderboardMetric = 'profit' | 'volume'
export type LeaderboardWindow = 'day' | 'week' | 'month' | 'all'

type Props = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  accent: keyof typeof ACCENTS
  metric: LeaderboardMetric
  window?: LeaderboardWindow
  limit?: number
}

export default function WhaleTable({
  id,
  eyebrow,
  title,
  subtitle,
  accent,
  metric,
  window: windowParam = 'all',
  limit = 10,
}: Props) {
  const a = ACCENTS[accent]
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `${LB_API_BASE}/${metric}?window=${windowParam}&limit=${limit}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = (await res.json()) as LeaderboardEntry[]
      setRows(Array.isArray(data) ? data : [])
      setLastFetched(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, windowParam, limit])

  const metricLabel = metric === 'profit' ? 'Profit' : 'Volume'
  const maxAmount = rows.reduce((m, r) => Math.max(m, r.amount ?? 0), 0)

  return (
    <section id={id} className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5 border ${a.pill}`}>
              <span className="material-symbols-outlined text-base">analytics</span>
              {eyebrow}
            </div>
            <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
              {title}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl">{subtitle}</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-5 py-4 rounded-2xl mb-6 text-sm">
            Couldn&apos;t reach Polymarket leaderboard API: {error}. Try the refresh button.
          </div>
        )}

        {loading && rows.length === 0 ? (
          <div className="grid gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {rows.map((w, i) => {
              const displayName = w.pseudonym || w.name || shortAddress(w.proxyWallet)
              const pct = maxAmount > 0 ? Math.max(6, ((w.amount ?? 0) / maxAmount) * 100) : 0
              return (
                <a
                  key={w.proxyWallet || i}
                  href={`https://polymarket.com/profile/${w.proxyWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative block bg-gradient-to-br from-white/[0.04] to-white/[0.01] border ${a.border} rounded-2xl p-6 md:p-7 hover:bg-white/[0.06] transition-all duration-300 ${a.glow} hover:shadow-2xl`}
                >
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    {/* Rank + avatar + name */}
                    <div className="md:col-span-6 flex items-center gap-4 min-w-0">
                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${a.bar} grid place-items-center font-headline font-black text-slate-950 text-lg shadow-lg`}>
                        {i + 1}
                      </div>
                      {w.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.profileImage}
                          alt=""
                          className="shrink-0 w-12 h-12 rounded-full object-cover bg-slate-800 border border-white/10"
                          loading="lazy"
                        />
                      ) : (
                        <div className="shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-white/10 grid place-items-center text-slate-400 font-headline font-bold">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-headline font-bold text-xl text-white truncate group-hover:text-emerald-300 transition-colors">
                          {displayName}
                        </div>
                        <div className="text-xs font-mono text-slate-500 truncate">
                          {shortAddress(w.proxyWallet)}
                        </div>
                      </div>
                    </div>

                    {/* Metric amount */}
                    <div className="md:col-span-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                        {metricLabel}
                      </div>
                      <div className={`font-headline text-2xl md:text-3xl font-black ${a.text} counter-num`}>
                        {formatUsd(w.amount)}
                      </div>
                    </div>

                    {/* Bio (if available) */}
                    <div className="md:col-span-3">
                      {w.bio && (
                        <>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                            Bio
                          </div>
                          <div className="text-xs text-slate-300 leading-snug line-clamp-3">
                            {w.bio}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Relative bar */}
                  <div className="mt-5 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${a.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {lastFetched && !error && (
          <div className="mt-6 text-xs text-slate-500 font-mono text-right">
            Live from lb-api.polymarket.com · {lastFetched.toLocaleTimeString()}
          </div>
        )}
      </div>
    </section>
  )
}
