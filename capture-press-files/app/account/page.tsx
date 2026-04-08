'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useApp } from '../providers'
import SubmissionCard from '../components/SubmissionCard'
import type { Submission } from '../types'

export default function AccountPage() {
  const router = useRouter()
  const { user, signOut, submissions, setPayout, withdraw, hydrated } = useApp()
  const [method, setMethod] = useState<'bank' | 'paypal'>('bank')
  const [detail, setDetail] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  if (!hydrated) {
    return <div className="max-w-5xl mx-auto px-4 py-20" />
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="card p-10">
          <span className="material-symbols-outlined text-brand" style={{ fontSize: 48 }}>
            account_circle
          </span>
          <h1 className="font-display text-3xl font-bold mt-3">Sign in to your account</h1>
          <p className="text-mute mt-2">
            Track your submissions, see your earnings and withdraw to your bank.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/signin" className="btn btn-primary">Sign in</Link>
            <Link href="/signin?mode=signup" className="btn btn-light">Create account</Link>
          </div>
        </div>
      </div>
    )
  }

  const mySubs = submissions.filter((s) => s.authorId === user.id)
  const sold = mySubs.filter((s) => s.status === 'sold')
  const live = mySubs.filter((s) => s.status === 'approved')
  const pending = mySubs.filter((s) => s.status === 'pending')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="hero-bg p-6 md:p-8 text-white relative">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-16 w-16 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center font-display font-bold text-2xl">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold">{user.name}</h1>
              <div className="text-white/70 text-sm">@{user.handle} · joined {new Date(user.joined).toLocaleDateString()}</div>
            </div>
            <button onClick={() => { signOut(); router.push('/') }} className="btn btn-ghost text-sm">
              Sign out
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Stat label="Wallet balance" value={`£${user.balance.toLocaleString()}`} />
            <Stat label="Lifetime earnings" value={`£${user.lifetimeEarnings.toLocaleString()}`} />
            <Stat label="Submissions" value={mySubs.length.toString()} />
            <Stat label="Sold" value={sold.length.toString()} />
          </div>
        </div>
      </div>

      {/* Wallet + Payout */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-mute font-semibold">
                Wallet
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold mt-1">
                £{user.balance.toLocaleString()}
              </div>
              <div className="text-mute text-sm">Available to withdraw</div>
            </div>
            <button
              onClick={() => {
                if (user.balance <= 0) return setToast('Nothing to withdraw yet.')
                if (!user.payoutMethod) return setToast('Add a payout method first.')
                const amt = withdraw()
                setToast(`£${amt.toLocaleString()} on its way to your ${user.payoutMethod}.`)
              }}
              className="btn btn-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                payments
              </span>
              Withdraw
            </button>
          </div>
          {toast && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm">
              {toast}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold">Payout method</h3>
          <p className="text-sm text-mute mt-1">
            How would you like to be paid? Withdrawals settle within 1-3 days.
          </p>
          {user.payoutMethod ? (
            <div className="mt-4 rounded-xl bg-paper border border-line p-4">
              <div className="text-xs uppercase tracking-widest text-mute font-semibold">
                Saved
              </div>
              <div className="font-semibold capitalize mt-1">{user.payoutMethod}</div>
              <div className="text-sm text-mute">{user.payoutDetail}</div>
              <button
                onClick={() => setPayout(method, '')}
                className="text-xs text-brand font-semibold mt-3"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                {(['bank', 'paypal'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 chip ${method === m ? 'chip-dark' : ''}`}
                  >
                    {m === 'bank' ? 'Bank transfer' : 'PayPal'}
                  </button>
                ))}
              </div>
              <input
                className="input"
                placeholder={method === 'bank' ? 'Sort code · Account number' : 'PayPal email'}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!detail.trim()) return
                  setPayout(method, detail.trim())
                  setToast('Payout method saved.')
                }}
                className="btn btn-dark w-full"
              >
                Save payout method
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submissions */}
      <div className="mt-10">
        <Section title="Live in the newsroom" count={live.length} items={live} emptyText="Nothing live right now." />
        <Section title="Awaiting review" count={pending.length} items={pending} emptyText="No submissions in review." />
        <Section title="Sold" count={sold.length} items={sold} emptyText="Your sold shots will show up here." />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
      <div className="text-white/70 text-xs uppercase tracking-wider">{label}</div>
      <div className="font-display text-xl md:text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}

function Section({
  title,
  count,
  items,
  emptyText,
}: {
  title: string
  count: number
  items: Submission[]
  emptyText: string
}) {
  return (
    <div className="mt-8">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-xl md:text-2xl font-bold">
          {title} <span className="text-mute text-base font-medium">({count})</span>
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="card p-8 text-center text-mute text-sm">{emptyText}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  )
}
