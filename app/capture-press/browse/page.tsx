'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '../providers'
import { CATEGORIES } from '../data'
import SubmissionCard from '../components/SubmissionCard'
import type { CategorySlug } from '../types'

type StatusFilter = 'all' | 'sold' | 'approved' | 'pending'

export default function BrowsePage() {
  const { submissions } = useApp()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<'all' | CategorySlug>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<'newest' | 'top' | 'price'>('newest')

  const filtered = useMemo(() => {
    let list = submissions
    if (cat !== 'all') list = list.filter((s) => s.category === cat)
    if (status !== 'all') list = list.filter((s) => s.status === status)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }
    list = [...list]
    if (sort === 'newest') list.sort((a, b) => b.createdAt - a.createdAt)
    if (sort === 'top') list.sort((a, b) => b.views - a.views)
    if (sort === 'price') list.sort((a, b) => (b.earnings || b.askingPrice) - (a.earnings || a.askingPrice))
    return list
  }, [submissions, query, cat, status, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-brand font-semibold">
            The newsroom
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Browse submissions</h1>
          <p className="text-mute mt-2 max-w-xl">
            Every shot below was sent in by a reporter just like you. Filter, search and see what's
            selling.
          </p>
        </div>
        <Link href="/capture-press/upload" className="btn btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_a_photo</span>
          Upload yours
        </Link>
      </div>

      <div className="card p-4 mt-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-mute">search</span>
          <input
            className="flex-1 outline-none bg-transparent text-ink placeholder:text-mute"
            placeholder="Search the newsroom — celebs, places, keywords"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-mute hover:text-ink">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterChip active={cat === 'all'} onClick={() => setCat('all')} label="All topics" icon="apps" />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.slug}
            active={cat === c.slug}
            onClick={() => setCat(c.slug)}
            label={c.name}
            icon={c.icon}
            color={c.accent}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-mute">Status:</span>
          {(['all', 'sold', 'approved', 'pending'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`chip ${status === s ? 'chip-dark' : ''}`}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-mute">Sort by:</span>
          <select
            className="select max-w-[180px] py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'top' | 'price')}
          >
            <option value="newest">Newest first</option>
            <option value="top">Most viewed</option>
            <option value="price">Highest paid</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center mt-8">
          <span className="material-symbols-outlined text-mute" style={{ fontSize: 48 }}>
            search_off
          </span>
          <h3 className="font-display text-xl font-semibold mt-3">No matches</h3>
          <p className="text-mute mt-1">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
          {filtered.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: string
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
        active
          ? 'bg-ink text-white border-ink'
          : 'bg-white text-ink border-line hover:border-ink/40'
      }`}
      style={active && color ? { background: color, borderColor: color } : undefined}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
        {icon}
      </span>
      {label}
    </button>
  )
}
