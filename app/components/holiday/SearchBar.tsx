'use client'

import { useState } from 'react'
import type { SearchParams } from '../../lib/providers'

export type Tab = 'all' | 'flights' | 'hotels' | 'apartments' | 'villas' | 'houses'

interface Props {
  initial: SearchParams
  activeTab: Tab
  onSearch: (p: SearchParams) => void
}

const needsOrigin = (t: Tab) => t === 'flights' || t === 'all'

export default function SearchBar({ initial, activeTab, onSearch }: Props) {
  const [destination, setDestination] = useState(initial.destination)
  const [origin, setOrigin] = useState(initial.origin || '')
  const [checkIn, setCheckIn] = useState(initial.checkIn)
  const [checkOut, setCheckOut] = useState(initial.checkOut)
  const [adults, setAdults] = useState(initial.adults)
  const [children, setChildren] = useState(initial.children ?? 0)
  const [rooms, setRooms] = useState(initial.rooms ?? 1)
  const [guestsOpen, setGuestsOpen] = useState(false)

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!destination.trim()) return
    onSearch({
      destination: destination.trim(),
      origin: origin.trim() || undefined,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
    })
  }

  const totalGuests = adults + children
  const guestLabel = `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}${activeTab === 'flights' ? '' : ` · ${rooms} room${rooms !== 1 ? 's' : ''}`}`

  return (
    <form onSubmit={submit} className="relative">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/20 border border-white/60 p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3">

          {/* Origin (flights only) */}
          {needsOrigin(activeTab) && (
            <label className="md:col-span-2 group relative flex flex-col rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors px-4 py-3 cursor-text border border-transparent focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>flight_takeoff</span>
                From
              </span>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="London"
                className="bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400 text-[15px] mt-0.5"
              />
            </label>
          )}

          {/* Destination */}
          <label className={`${needsOrigin(activeTab) ? 'md:col-span-3' : 'md:col-span-4'} group relative flex flex-col rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors px-4 py-3 cursor-text border border-transparent focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
              {activeTab === 'flights' ? 'To' : 'Where'}
            </span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Barcelona, Spain"
              required
              className="bg-transparent outline-none text-slate-900 font-semibold placeholder:text-slate-400 text-[15px] mt-0.5"
            />
          </label>

          {/* Check-in */}
          <label className="md:col-span-2 flex flex-col rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors px-4 py-3 cursor-text border border-transparent focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
              Check in
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent outline-none text-slate-900 font-semibold text-[15px] mt-0.5"
            />
          </label>

          {/* Check-out */}
          <label className="md:col-span-2 flex flex-col rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors px-4 py-3 cursor-text border border-transparent focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-md">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
              Check out
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent outline-none text-slate-900 font-semibold text-[15px] mt-0.5"
            />
          </label>

          {/* Guests */}
          <div className={`${needsOrigin(activeTab) ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
            <button
              type="button"
              onClick={() => setGuestsOpen((v) => !v)}
              className="w-full h-full text-left flex flex-col rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors px-4 py-3 border border-transparent focus:border-indigo-400 focus:bg-white focus:shadow-md focus:outline-none"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                Travellers
              </span>
              <span className="text-slate-900 font-semibold text-[15px] mt-0.5 truncate">{guestLabel}</span>
            </button>

            {guestsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setGuestsOpen(false)} />
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 min-w-[280px]">
                  <Stepper label="Adults" sub="16+" value={adults} min={1} max={16} onChange={setAdults} />
                  <Stepper label="Children" sub="Under 16" value={children} min={0} max={10} onChange={setChildren} />
                  {activeTab !== 'flights' && (
                    <Stepper label="Rooms" sub=" " value={rooms} min={1} max={10} onChange={setRooms} />
                  )}
                  <button
                    type="button"
                    onClick={() => setGuestsOpen(false)}
                    className="w-full mt-3 bg-slate-900 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            className="md:col-span-1 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-2xl h-[60px] md:h-auto font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>search</span>
            <span className="md:hidden">Search</span>
          </button>
        </div>
      </div>
    </form>
  )
}

function Stepper({
  label, sub, value, min, max, onChange,
}: { label: string; sub: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <div className="text-slate-900 font-semibold text-sm">{label}</div>
        <div className="text-slate-500 text-xs">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="w-8 h-8 rounded-full border-2 border-slate-300 text-slate-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-slate-900">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border-2 border-slate-300 text-slate-700 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
