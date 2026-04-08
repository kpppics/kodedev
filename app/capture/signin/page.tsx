'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useApp } from '../providers'

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  )
}

function SignInInner() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/account'
  const initialMode = params.get('mode') === 'signup' ? 'signup' : 'signin'
  const { signIn } = useApp()
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password.trim()) return setError('Email and password required.')
    if (mode === 'signup' && !name.trim()) return setError('What should we call you?')
    signIn(email.trim(), name.trim() || email.split('@')[0])
    router.push(next)
  }

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex hero-bg text-white relative items-center">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 50%)',
        }} />
        <div className="relative max-w-md mx-auto px-12">
          <div className="inline-flex items-center gap-2 chip chip-dark">
            <span className="live-dot" />
            Newsroom open
          </div>
          <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight mt-5">
            Your phone is a press card.
          </h2>
          <p className="text-white/70 mt-4">
            Join 184,000 reporters earning real money for the photos and videos already on their
            phone.
          </p>
          <ul className="space-y-3 mt-6 text-white/80 text-sm">
            <Bullet>Sell to verified UK & global newsrooms</Bullet>
            <Bullet>Keep up to 70% of every sale</Bullet>
            <Bullet>Withdraw weekly to your bank or PayPal</Bullet>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Link href="/capture" className="text-mute text-sm hover:text-brand">
            ← Back to home
          </Link>
          <h1 className="font-display text-3xl font-bold mt-3">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-mute mt-1">
            {mode === 'signin'
              ? 'Sign in to send shots and check your earnings.'
              : 'Free to join — start earning in minutes.'}
          </p>

          <div className="grid grid-cols-2 mt-6 rounded-full bg-paper border border-line p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-2 rounded-full text-sm font-semibold transition ${
                mode === 'signin' ? 'bg-ink text-white' : 'text-mute'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-2 rounded-full text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-ink text-white' : 'text-mute'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Your name</label>
                <input
                  className="input"
                  placeholder="e.g. Sam Carter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full text-base py-3">
              {mode === 'signin' ? 'Sign in' : 'Create account & continue'}
            </button>

            <p className="text-xs text-mute text-center">
              By continuing you agree to the{' '}
              <Link href="/capture/legal/terms" className="text-brand">terms</Link> and{' '}
              <Link href="/capture/legal/privacy" className="text-brand">privacy policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="material-symbols-outlined text-brand-light" style={{ fontSize: 20 }}>
        check_circle
      </span>
      {children}
    </li>
  )
}
