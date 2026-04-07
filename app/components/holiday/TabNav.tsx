'use client'

import type { Tab } from './SearchBar'

interface Props {
  active: Tab
  onChange: (t: Tab) => void
  counts?: Partial<Record<Tab, number>>
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'all',        label: 'Everything', icon: 'apps' },
  { id: 'flights',    label: 'Flights',    icon: 'flight' },
  { id: 'hotels',     label: 'Hotels',     icon: 'hotel' },
  { id: 'apartments', label: 'Apartments', icon: 'apartment' },
  { id: 'villas',     label: 'Villas',     icon: 'villa' },
  { id: 'houses',     label: 'Houses',     icon: 'home' },
]

export default function TabNav({ active, onChange, counts }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-xl rounded-2xl p-1.5 border border-white/60 shadow-lg shadow-slate-900/10">
        {TABS.map((t) => {
          const isActive = active === t.id
          const count = counts?.[t.id]
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`relative flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
              {count !== undefined && count > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
