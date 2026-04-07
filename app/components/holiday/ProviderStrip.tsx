'use client'

import type { Provider, SearchParams } from '../../lib/providers'

interface Props {
  title: string
  providers: Provider[]
  params: SearchParams
}

export default function ProviderStrip({ title, providers, params }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-900/5 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-base md:text-lg">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            One click opens a pre-filled search on the provider's real site
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5 border border-emerald-100">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {providers.length} sources searched
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <a
            key={p.id}
            href={p.build(params)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 hover:border-transparent hover:shadow-lg transition-all"
            style={{ ['--hover-color' as string]: p.color }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900 leading-tight">{p.name}</span>
              <span className="text-[10px] text-slate-500 leading-tight">{p.tagline}</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500 transition-colors" style={{ fontSize: 16 }}>
              arrow_outward
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
