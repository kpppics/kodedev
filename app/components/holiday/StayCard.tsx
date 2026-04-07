'use client'

import { useState } from 'react'
import type { StayDeal } from '../../lib/mockDeals'

interface Props {
  deal: StayDeal
  rank?: number
}

const KIND_LABEL: Record<StayDeal['kind'], string> = {
  hotel: 'Hotel',
  apartment: 'Apartment',
  villa: 'Villa',
  house: 'House',
}

const KIND_ICON: Record<StayDeal['kind'], string> = {
  hotel: 'hotel',
  apartment: 'apartment',
  villa: 'villa',
  house: 'home',
}

export default function StayCard({ deal, rank }: Props) {
  const [imgOk, setImgOk] = useState(true)
  const ratingLabel =
    deal.rating >= 9 ? 'Exceptional'
    : deal.rating >= 8.5 ? 'Fabulous'
    : deal.rating >= 8 ? 'Very good'
    : 'Good'

  return (
    <a
      href={deal.dealUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/70 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        {imgOk ? (
          // Using <img> intentionally (Next image is set to unoptimized in config)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={deal.image}
            alt={deal.title}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-200 via-violet-200 to-fuchsia-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-500" style={{ fontSize: 56 }}>
              {KIND_ICON[deal.kind]}
            </span>
          </div>
        )}

        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

        {/* Kind chip */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{KIND_ICON[deal.kind]}</span>
          {KIND_LABEL[deal.kind]}
        </div>

        {/* Savings chip */}
        {deal.savings >= 15 && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full px-3 py-1.5 text-[11px] font-bold shadow-lg">
            −{deal.savings}%
          </div>
        )}

        {/* Rank badge */}
        {rank !== undefined && rank < 3 && (
          <div className="absolute bottom-3 left-3 bg-amber-400 text-amber-950 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-lg flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>star</span>
            {rank === 0 ? 'Best deal' : rank === 1 ? '2nd best' : '3rd best'}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-[15px] leading-tight truncate group-hover:text-indigo-600 transition-colors">
              {deal.title}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5 truncate">{deal.area}</p>
          </div>
          <div className="flex items-center gap-1 bg-indigo-600 text-white rounded-lg px-2 py-1 text-xs font-bold shrink-0">
            {deal.rating.toFixed(1)}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-900 font-semibold">{ratingLabel}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{deal.reviews.toLocaleString()} reviews</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {deal.perks.slice(0, 3).map((p) => (
            <span key={p} className="text-[10.5px] font-medium bg-emerald-50 text-emerald-700 rounded-md px-1.5 py-0.5 border border-emerald-100">
              {p}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">
                {deal.currency}{deal.pricePerNight}
              </span>
              <span className="text-xs text-slate-500">/night</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {deal.currency}{deal.totalPrice.toLocaleString()} total · {deal.nights} night{deal.nights !== 1 ? 's' : ''}
            </div>
          </div>
          <div
            className="flex items-center gap-1 text-[11px] font-bold text-white rounded-full px-2.5 py-1.5 shrink-0"
            style={{ backgroundColor: deal.providerColor }}
            title={`Deal on ${deal.providerName}`}
          >
            {deal.providerName}
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
          </div>
        </div>
      </div>
    </a>
  )
}
