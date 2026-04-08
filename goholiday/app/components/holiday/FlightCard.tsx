'use client'

import type { FlightDeal } from '../../lib/mockDeals'

interface Props {
  deal: FlightDeal
  rank?: number
}

export default function FlightCard({ deal, rank }: Props) {
  return (
    <a
      href={deal.dealUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col sm:flex-row items-stretch bg-white rounded-3xl border border-slate-200/70 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      {/* Airline column */}
      <div className="flex sm:flex-col items-center justify-center gap-2 px-5 py-4 sm:w-36 border-b sm:border-b-0 sm:border-r border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
          style={{ backgroundColor: deal.airlineColor }}
        >
          {deal.airlineCode}
        </div>
        <div className="sm:text-center">
          <div className="text-xs font-bold text-slate-900 leading-tight">{deal.airline}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{deal.stopsLabel}</div>
        </div>
      </div>

      {/* Route */}
      <div className="flex-1 flex items-center gap-4 px-5 py-4 min-w-0">
        <div className="text-center shrink-0">
          <div className="text-2xl font-black text-slate-900 leading-none tabular-nums">{deal.departTime}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">{deal.fromCode}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[80px]">{deal.from}</div>
        </div>

        <div className="flex-1 flex flex-col items-center min-w-0 px-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {deal.duration}
          </div>
          <div className="relative w-full flex items-center">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-300 via-violet-400 to-fuchsia-400 rounded-full" />
            {deal.stops > 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                {Array.from({ length: deal.stops }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-white border-2 border-violet-500 rounded-full" />
                ))}
              </div>
            )}
            <span className="material-symbols-outlined text-violet-500 -ml-1" style={{ fontSize: 18 }}>flight</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {deal.stops === 0 ? 'Non-stop' : `via ${deal.stops} stop${deal.stops > 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="text-center shrink-0">
          <div className="text-2xl font-black text-slate-900 leading-none tabular-nums">{deal.arriveTime}</div>
          <div className="text-xs font-semibold text-slate-600 mt-1">{deal.toCode}</div>
          <div className="text-[10px] text-slate-400 truncate max-w-[80px]">{deal.to}</div>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 px-5 py-4 sm:w-44 bg-gradient-to-br from-indigo-50 to-violet-50 border-t sm:border-t-0 sm:border-l border-slate-100">
        {rank !== undefined && rank < 3 && (
          <div className="hidden sm:flex absolute mt-[-56px] items-center gap-1 bg-amber-400 text-amber-950 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow">
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>star</span>
            {rank === 0 ? 'Cheapest' : rank === 1 ? '2nd cheapest' : '3rd cheapest'}
          </div>
        )}
        <div className="flex flex-col items-end sm:items-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums leading-none">
            {deal.currency}{deal.price.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{deal.co2kg} kg CO₂</div>
        </div>
        <div
          className="flex items-center gap-1 text-[10px] font-bold text-white rounded-full px-2.5 py-1 shadow-md group-hover:scale-105 transition-transform"
          style={{ backgroundColor: deal.providerColor }}
        >
          {deal.providerName}
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>open_in_new</span>
        </div>
      </div>
    </a>
  )
}
