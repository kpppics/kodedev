'use client'

import { useMemo, useState, useEffect } from 'react'
import SearchBar, { type Tab } from './SearchBar'
import TabNav from './TabNav'
import StayCard from './StayCard'
import FlightCard from './FlightCard'
import ProviderStrip from './ProviderStrip'
import { STAY_PROVIDERS, FLIGHT_PROVIDERS, type SearchParams, type StayCategory } from '../../lib/providers'
import type { StayDeal, FlightDeal } from '../../lib/mockDeals'
import { fetchStays, fetchFlights } from '../../lib/liveDeals'

function defaultDates() {
  const today = new Date()
  const inD = new Date(today.getTime() + 30 * 86400000)
  const outD = new Date(today.getTime() + 37 * 86400000)
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { checkIn: iso(inD), checkOut: iso(outD) }
}

const POPULAR = [
  { name: 'Barcelona',  emoji: '🇪🇸', tag: 'Spain' },
  { name: 'Bali',       emoji: '🇮🇩', tag: 'Indonesia' },
  { name: 'Santorini',  emoji: '🇬🇷', tag: 'Greece' },
  { name: 'Tokyo',      emoji: '🇯🇵', tag: 'Japan' },
  { name: 'Rome',       emoji: '🇮🇹', tag: 'Italy' },
  { name: 'Dubai',      emoji: '🇦🇪', tag: 'UAE' },
  { name: 'New York',   emoji: '🇺🇸', tag: 'USA' },
  { name: 'Marrakech',  emoji: '🇲🇦', tag: 'Morocco' },
]

export default function HolidayApp() {
  const dates = useMemo(defaultDates, [])
  const [params, setParams] = useState<SearchParams>({
    destination: 'Barcelona, Spain',
    origin: 'London',
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    adults: 2,
    children: 0,
    rooms: 1,
  })
  const [tab, setTab] = useState<Tab>('all')
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price')
  const [loading, setLoading] = useState(true)
  const [stays, setStays] = useState<StayDeal[]>([])
  const [flights, setFlights] = useState<FlightDeal[]>([])

  const stayCategory: StayCategory =
    tab === 'hotels' ? 'hotels'
    : tab === 'apartments' ? 'apartments'
    : tab === 'villas' ? 'villas'
    : tab === 'houses' ? 'houses'
    : 'all'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchStays(params, stayCategory), fetchFlights(params)])
      .then(([s, f]) => {
        if (cancelled) return
        setStays(s)
        setFlights(f)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setStays([])
        setFlights([])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [params, stayCategory])

  const sortedStays = useMemo(() => {
    const arr = [...stays]
    if (sortBy === 'rating') arr.sort((a, b) => b.rating - a.rating)
    else arr.sort((a, b) => a.pricePerNight - b.pricePerNight)
    return arr
  }, [stays, sortBy])

  const handleSearch = (p: SearchParams) => setParams(p)

  const showFlights = tab === 'flights' || tab === 'all'
  const showStays = tab !== 'flights'

  const nights = Math.max(
    1,
    Math.round((new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) / 86400000),
  )
  const cheapestStay = sortedStays[0]
  const cheapestFlight = flights[0]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-fuchsia-700" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl blob-1" />
        <div className="absolute top-20 right-0 w-[32rem] h-[32rem] bg-fuchsia-400/30 rounded-full blur-3xl blob-2" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl blob-3" />
        <div className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-28 md:pt-28 md:pb-40">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 text-white text-xs font-semibold mb-5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>public</span>
              Comparing 21 sources worldwide
            </div>
            <h1 className="font-headline font-black text-white text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              One search.
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                Every holiday deal.
              </span>
            </h1>
            <p className="text-white/80 text-base md:text-lg mt-5 max-w-xl mx-auto">
              Compare flights, hotels, villas, apartments and houses from Booking.com, Airbnb, Skyscanner, Vrbo, Expedia and more — all in one place.
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <TabNav active={tab} onChange={setTab} />
          </div>

          <div className="max-w-6xl mx-auto">
            <SearchBar initial={params} activeTab={tab} onSearch={handleSearch} />
          </div>

          <div className="mt-6 flex items-center gap-2 flex-wrap justify-center">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider mr-1">Popular:</span>
            {POPULAR.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => setParams((prev) => ({ ...prev, destination: `${d.name}, ${d.tag}` }))}
                className="flex items-center gap-1.5 bg-white/12 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold rounded-full px-3 py-1.5 backdrop-blur-md transition-all hover:scale-105"
              >
                <span>{d.emoji}</span>
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <svg className="relative block w-full -mb-px" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#f8fafc" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,48 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {tab === 'flights' ? 'Flights' : tab === 'all' ? 'All deals' : `${tab[0].toUpperCase()}${tab.slice(1)}`}{' '}
              to <span className="gradient-text">{params.destination.split(',')[0]}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {formatDate(params.checkIn)} – {formatDate(params.checkOut)} · {nights} night{nights !== 1 ? 's' : ''} · {params.adults} adult{params.adults !== 1 ? 's' : ''}
              {params.children ? ` · ${params.children} child${params.children !== 1 ? 'ren' : ''}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {cheapestStay && showStays && (
              <StatCard icon="payments" label="Cheapest stay" value={`${cheapestStay.currency}${cheapestStay.pricePerNight}/nt`} sub={cheapestStay.providerName} color="#10b981" />
            )}
            {cheapestFlight && showFlights && (
              <StatCard icon="flight_takeoff" label="Cheapest flight" value={`${cheapestFlight.currency}${cheapestFlight.price}`} sub={cheapestFlight.airline} color="#6366f1" />
            )}
          </div>
        </div>

        {showStays && (
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              {loading ? (
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  Searching across {STAY_PROVIDERS.length + FLIGHT_PROVIDERS.length} sites…
                </span>
              ) : (
                <span className="text-slate-600">
                  <span className="font-bold text-slate-900">{sortedStays.length}</span> stays found
                  {showFlights && <> · <span className="font-bold text-slate-900">{flights.length}</span> flights</>}
                </span>
              )}
            </div>
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 text-sm">
              <button type="button" onClick={() => setSortBy('price')} className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${sortBy === 'price' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                Cheapest first
              </button>
              <button type="button" onClick={() => setSortBy('rating')} className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${sortBy === 'rating' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                Top rated
              </button>
            </div>
          </div>
        )}

        {showFlights && (
          <div className="mb-10">
            {tab === 'all' && (
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">flight</span>
                Cheapest flights
                <span className="text-xs text-slate-500 font-normal">· top {Math.min(6, flights.length)} of {flights.length}</span>
              </h3>
            )}
            <div className={`grid gap-3 ${tab === 'flights' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {(tab === 'flights' ? flights : flights.slice(0, 6)).map((f, i) => (
                <FlightCard key={f.id} deal={f} rank={i} />
              ))}
            </div>
          </div>
        )}

        {showStays && (
          <div className="mb-12">
            {tab === 'all' && (
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">hotel</span>
                Cheapest stays
                <span className="text-xs text-slate-500 font-normal">· top {sortedStays.length}</span>
              </h3>
            )}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedStays.map((s, i) => <StayCard key={s.id} deal={s} rank={i} />)}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2 mt-8">
          {showStays && <ProviderStrip title="Also searched for stays on" providers={STAY_PROVIDERS} params={params} />}
          {showFlights && <ProviderStrip title="Also searched for flights on" providers={FLIGHT_PROVIDERS} params={params} />}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          <TrustCard icon="verified" title="Every major site, one page" body="We search 21+ providers — Booking, Airbnb, Vrbo, Expedia, Skyscanner, Kayak, Agoda and more — so you don't have to." />
          <TrustCard icon="price_check" title="Always the lowest price" body="Sorted cheapest-first by default. Savings tags show you how much you're knocking off the standard rate." />
          <TrustCard icon="shield_person" title="You book direct" body="No hidden fees. Click through and book directly with the provider of your choice — at their live price." />
        </div>
      </section>

      <Footer />
    </div>
  )
}

function TopBar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-white font-black text-xl md:text-2xl tracking-tight">
          <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>travel_explore</span>
          </span>
          GoHoliday
        </a>
        <nav className="hidden md:flex items-center gap-7 text-white/80 text-sm font-semibold">
          <a href="#" className="hover:text-white transition-colors">Stays</a>
          <a href="#" className="hover:text-white transition-colors">Flights</a>
          <a href="#" className="hover:text-white transition-colors">Deals</a>
          <a href="#" className="hover:text-white transition-colors">Help</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex text-white/90 text-sm font-semibold hover:text-white px-3 py-2">GBP £</button>
          <button className="bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-full px-4 py-2 border border-white/25 backdrop-blur-md transition-colors">Sign in</button>
        </div>
      </div>
    </header>
  )
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18', color }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</div>
        <div className="font-black text-slate-900 text-sm leading-tight tabular-nums">{value}</div>
        <div className="text-[10px] text-slate-500 truncate">{sub}</div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="flex justify-between pt-2">
          <div className="h-6 bg-slate-200 rounded w-16" />
          <div className="h-6 bg-slate-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

function TrustCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/70 p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/25">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1.5">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>travel_explore</span>
          </span>
          GoHoliday
        </div>
        <p className="text-slate-500 text-xs text-center">
          GoHoliday is an independent meta-search. Live prices powered by Travelpayouts —
          click any deal to book directly with the provider.
        </p>
        <div className="flex items-center gap-4 text-slate-500 text-xs">
          <a href="#" className="hover:text-slate-900">Privacy</a>
          <a href="#" className="hover:text-slate-900">Terms</a>
          <a href="#" className="hover:text-slate-900">Contact</a>
        </div>
      </div>
    </footer>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}
