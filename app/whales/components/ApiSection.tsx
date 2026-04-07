'use client'

import { useState } from 'react'
import { PUBLIC_APIS } from '../data'

const REPOS = [
  {
    name: 'pselamy/polymarket-insider-tracker',
    stars: 89,
    desc: 'DBSCAN clustering to find coordinated wallet groups. Sends Discord/Telegram alerts.',
  },
  {
    name: 'milshlordbtc/polymarket-wallet-mirror',
    desc: 'Auto-mirror whale positions, same-block execution.',
  },
  {
    name: 'Polymarket/agents',
    desc: 'Official AI agents framework.',
  },
]

const PYTHON_SNIPPET = [
  '# Pull all trades for a specific whale wallet',
  'import requests',
  '',
  'WALLET = "0x5668...5839"  # Theo4 - $22M profit, 100% win rate',
  'res = requests.get(',
  '    "https://data-api.polymarket.com/trades",',
  '    params={"user": WALLET}',
  ')',
  'trades = res.json()',
  '',
  'for t in trades[:5]:',
  '    print(t["outcome"], "@", t["price"], "x", t["size"])',
].join('\n')

export default function ApiSection() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_SNIPPET)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* noop */
    }
  }

  return (
    <section id="api" className="py-20 md:py-28 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
          <span className="material-symbols-outlined text-base">api</span>
          Free Public APIs
        </div>
        <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tight mb-4 max-w-3xl">
          Build your own tracker. No auth required.
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mb-12">
          Polymarket and Kalshi expose every trade through public REST endpoints.
          Use them directly or with the official Python clients.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* API list */}
          <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-4">
              Endpoints
            </div>
            <div className="space-y-3">
              {PUBLIC_APIS.map(api => (
                <div
                  key={api.url}
                  className="bg-slate-900/60 border border-white/5 rounded-xl p-4 hover:border-emerald-400/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        api.method === 'GET'
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-violet-400/15 text-violet-300'
                      }`}
                    >
                      {api.method}
                    </span>
                    <span className="text-xs text-slate-400">{api.label}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 break-all leading-relaxed">
                    {api.url}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code snippet + repos */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <span className="font-mono text-xs text-slate-400 ml-2">
                    track_whale.py
                  </span>
                </div>
                <button
                  onClick={copy}
                  className="text-xs text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-5 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto">
                {PYTHON_SNIPPET}
              </pre>
            </div>

            <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-4">
                Key open-source repos
              </div>
              <div className="space-y-3">
                {REPOS.map(r => (
                  <a
                    key={r.name}
                    href={`https://github.com/${r.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <span className="material-symbols-outlined text-emerald-400 mt-0.5">
                      code
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {r.name}
                        </span>
                        {r.stars && (
                          <span className="text-xs text-slate-500 inline-flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">star</span>
                            {r.stars}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
