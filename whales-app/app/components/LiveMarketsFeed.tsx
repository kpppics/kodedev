'use client'

import { useEffect, useState } from 'react'
import { GAMMA_API_BASE } from '../data'

type Market = {
  id: string
  question: string
  slug: string
  volume?: number
  liquidity?: number
  outcomePrices?: string
  outcomes?: string
  active?: boolean
  closed?: boolean
  endDate?: string
  category?: string
  image?: string
}

function parseMaybeJson<T>(val: unknown): T | null {
  if (val == null) return null
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T
    } catch {
      return null
    }
  }
  return val as T
}

function formatUsd(n?: number) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n)}`
}

function timeUntil(iso?: string) {
  if (!iso) return null
  const end = new Date(iso).getTime()
  const now = Date.now()
  const ms = end - now
  if (ms <= 0) return 'Closed'
  const days = Math.floor(ms / 86_400_000)
  if (days >= 1) return `${days}d`
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 1) return `${hours}h`
  const mins = Math.floor(ms / 60_000)
  return `${mins}m`
}

export default function LiveMarketsFeed() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `${GAMMA_API_BASE}/markets?active=true&closed=false&order=volume24hr&ascending=false&limit=12`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = (await res.json()) as Market[]
      setMarkets(Array.isArray(data) ? data : [])
      setLastFetched(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="live" className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live Feed
            </div>
            <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-3">
              Top Polymarket markets right now
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl">
              Pulled directly from Polymarket&apos;s public Gamma API. Auto-refreshes every 60 seconds.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-5 py-4 rounded-2xl mb-6 text-sm">
            Couldn&apos;t reach Polymarket API: {error}. The endpoint may be rate-limited or
            blocked by your network. Try the refresh button.
          </div>
        )}

        {loading && markets.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {markets.map(m => {
              const prices = parseMaybeJson<string[]>(m.outcomePrices) ?? []
              const outcomes = parseMaybeJson<string[]>(m.outcomes) ?? ['Yes', 'No']
              const yesPrice = prices[0] ? Math.round(parseFloat(prices[0]) * 100) : null
              const ends = timeUntil(m.endDate)

              return (
                <a
                  key={m.id}
                  href={`https://polymarket.com/event/${m.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-5 hover:border-emerald-400/40 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {m.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                      />
                    )}
                    <div className="font-headline font-bold text-base text-white leading-snug line-clamp-3 group-hover:text-emerald-300 transition-colors">
                      {m.question}
                    </div>
                  </div>

                  {yesPrice != null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span>{outcomes[0] ?? 'Yes'}</span>
                        <span className="font-headline font-bold text-emerald-300 text-sm">
                          {yesPrice}¢
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                          style={{ width: `${yesPrice}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-emerald-400">
                        trending_up
                      </span>
                      <span className="font-mono">{formatUsd(m.volume)}</span>
                    </div>
                    {ends && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-500">
                          schedule
                        </span>
                        <span>{ends}</span>
                      </div>
                    )}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm text-emerald-400">
                        open_in_new
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {lastFetched && (
          <div className="mt-6 text-xs text-slate-500 font-mono text-right">
            Last updated {lastFetched.toLocaleTimeString()}
          </div>
        )}
      </div>
    </section>
  )
}
