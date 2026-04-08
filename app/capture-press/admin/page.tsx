'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useApp } from '../providers'
import { getCategory } from '../data'
import type { Submission } from '../types'

const ADMIN_PIN = 'capturepress2026'

function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const STATUS_STYLE: Record<Submission['status'], string> = {
  pending:  'chip-amber',
  approved: 'chip-blue',
  sold:     'chip-green',
  rejected: 'chip-red',
}

export default function AdminDashboard() {
  const { submissions, updateSubmissionStatus, hydrated } = useApp()
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [filter, setFilter] = useState<'all' | Submission['status']>('all')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleAction(id: string, status: Submission['status'], earnings?: number) {
    updateSubmissionStatus(id, status, earnings)
    setEditId(null)
    showToast(
      status === 'approved' ? 'Marked as live ✓' :
      status === 'sold'     ? `Marked as sold £${earnings} ✓` :
      status === 'rejected' ? 'Rejected ✓' :
      'Updated ✓'
    )
  }

  if (!hydrated) return null

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-12 w-12 rounded-2xl bg-[#0b1020] text-white flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 26 }}>admin_panel_settings</span>
            </span>
            <div>
              <div className="font-display font-bold text-lg leading-tight">Admin dashboard</div>
              <div className="text-xs text-mute">Capture Press</div>
            </div>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (pin === ADMIN_PIN) { setAuthed(true); setPinError(false) }
            else { setPinError(true); setPin('') }
          }}>
            <label className="label">Admin PIN</label>
            <input
              type="password"
              className="input"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {pinError && (
              <p className="text-red-600 text-sm mt-2">Incorrect PIN.</p>
            )}
            <button type="submit" className="btn btn-dark w-full mt-4">
              Enter dashboard
            </button>
          </form>
          <p className="text-xs text-mute text-center mt-4">
            Demo PIN: <span className="font-mono font-bold">capturepress2026</span>
          </p>
        </div>
      </div>
    )
  }

  const filtered = useMemo(() => {
    let list = [...submissions]
    if (filter !== 'all') list = list.filter(s => s.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.authorName.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      )
    }
    return list
  }, [submissions, filter, search])

  const stats = useMemo(() => ({
    total:    submissions.length,
    pending:  submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    sold:     submissions.filter(s => s.status === 'sold').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    revenue:  submissions.reduce((acc, s) => acc + (s.earnings || 0), 0),
    avgPrice: submissions.filter(s => s.status === 'sold').length
      ? Math.round(submissions.filter(s => s.status === 'sold').reduce((a, s) => a + s.earnings, 0) /
          submissions.filter(s => s.status === 'sold').length)
      : 0,
  }), [submissions])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0b1020] text-white px-5 py-3 rounded-full text-sm font-semibold shadow-soft">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-xl bg-[#0b1020] text-white flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>admin_panel_settings</span>
            </span>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-mute text-sm mt-1">Review submissions, manage payouts and monitor the newsroom.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/capture-press" className="btn btn-light text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
            View site
          </Link>
          <button onClick={() => setAuthed(false)} className="btn btn-light text-sm">
            Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        <StatCard label="Total" value={stats.total} icon="inbox" />
        <StatCard label="Pending" value={stats.pending} icon="schedule" accent="#f59e0b" />
        <StatCard label="Live" value={stats.approved} icon="wifi" accent="#1d4ed8" />
        <StatCard label="Sold" value={stats.sold} icon="sell" accent="#16a34a" />
        <StatCard label="Rejected" value={stats.rejected} icon="cancel" accent="#dc2626" />
        <StatCard label="Total paid out" value={`£${stats.revenue.toLocaleString()}`} icon="payments" accent="#e11d48" wide />
        <StatCard label="Avg. sale price" value={`£${stats.avgPrice}`} icon="trending_up" wide />
      </div>

      {/* Queue alert */}
      {stats.pending > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-3 mb-6">
          <span className="live-dot" />
          <p className="text-sm font-semibold text-amber-800">
            {stats.pending} submission{stats.pending > 1 ? 's' : ''} awaiting review
          </p>
          <button onClick={() => setFilter('pending')} className="ml-auto chip chip-amber text-xs">
            Show pending
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <span className="material-symbols-outlined text-mute">search</span>
          <input
            className="flex-1 outline-none bg-transparent text-sm placeholder:text-mute"
            placeholder="Search by title, reporter or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-mute hover:text-ink">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'sold', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`chip ${filter === s ? 'chip-dark' : ''}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className="ml-1 opacity-60 text-[10px]">
                  ({s === 'pending' ? stats.pending : s === 'approved' ? stats.approved : s === 'sold' ? stats.sold : stats.rejected})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-line">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide">Submission</th>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide hidden lg:table-cell">Reporter</th>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide hidden lg:table-cell">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide">Asking</th>
                <th className="text-left px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide">Earned</th>
                <th className="text-right px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-mute">
                    No submissions match your filter.
                  </td>
                </tr>
              )}
              {filtered.map(sub => {
                const cat = getCategory(sub.category)
                return (
                  <tr key={sub.id} className="border-t border-line hover:bg-paper transition-colors">
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.mediaUrl}
                          alt=""
                          className="h-12 w-16 rounded-lg object-cover flex-shrink-0 bg-line"
                        />
                        <div>
                          <div className="font-semibold text-ink line-clamp-1">{sub.title}</div>
                          <div className="text-xs text-mute mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>place</span>
                            {sub.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="chip" style={{ background: cat?.accent + '18', color: cat?.accent, borderColor: cat?.accent + '33' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{cat?.icon}</span>
                        {cat?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-mute">{sub.authorName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-mute">{timeAgo(sub.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`chip ${STATUS_STYLE[sub.status]}`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-display font-bold text-ink">£{sub.askingPrice}</td>
                    <td className="px-4 py-3 font-display font-bold text-success">
                      {sub.earnings > 0 ? `£${sub.earnings}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/capture-press/submission/${sub.id}`}
                          className="p-1.5 rounded-lg text-mute hover:text-ink hover:bg-paper"
                          title="View"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
                        </Link>

                        {sub.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(sub.id, 'approved')}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="Approve — make live"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>thumb_up</span>
                            </button>
                            <button
                              onClick={() => handleAction(sub.id, 'rejected')}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Reject"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>thumb_down</span>
                            </button>
                          </>
                        )}

                        {sub.status === 'approved' && (
                          <>
                            {editId === sub.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-mute">£</span>
                                <input
                                  type="number"
                                  className="w-20 border border-line rounded-lg px-2 py-1 text-xs"
                                  placeholder={String(sub.askingPrice)}
                                  value={editPrice}
                                  onChange={e => setEditPrice(e.target.value)}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleAction(sub.id, 'sold', Number(editPrice) || sub.askingPrice)}
                                  className="p-1 rounded-lg text-success hover:bg-green-50"
                                  title="Confirm sale"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                                </button>
                                <button
                                  onClick={() => setEditId(null)}
                                  className="p-1 rounded-lg text-mute hover:bg-paper"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditId(sub.id); setEditPrice(String(sub.askingPrice)) }}
                                className="p-1.5 rounded-lg text-success hover:bg-green-50"
                                title="Mark as sold"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sell</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(sub.id, 'rejected')}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Reject"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>thumb_down</span>
                            </button>
                          </>
                        )}

                        {(sub.status === 'sold' || sub.status === 'rejected') && (
                          <button
                            onClick={() => handleAction(sub.id, 'pending')}
                            className="p-1.5 rounded-lg text-mute hover:bg-paper"
                            title="Return to pending"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>undo</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3 text-xs text-mute bg-paper">
          Showing {filtered.length} of {submissions.length} submissions
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, accent, wide,
}: {
  label: string; value: string | number; icon: string; accent?: string; wide?: boolean
}) {
  return (
    <div className={`card p-4 ${wide ? 'col-span-2 md:col-span-1' : ''}`}>
      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 rounded-xl flex items-center justify-center"
          style={{ background: (accent || '#64748b') + '18', color: accent || '#64748b' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
        </span>
        <span className="text-xs text-mute font-medium">{label}</span>
      </div>
      <div className="font-display font-bold text-xl mt-2">{value}</div>
    </div>
  )
}
