'use client'

import { useState } from 'react'
import { SITE } from '../lib/site'
import Icon from './Icon'

type State = 'idle' | 'sending' | 'sent' | 'error'

const NEEDS = [
  'A new website',
  'Rebuild of my existing site',
  'A web app (bookings, orders, accounts)',
  'An iOS app / App Store submission',
  'AI feature or automation',
  'Not sure yet, need advice',
]

export default function ContactForm({ dark = true }: { dark?: boolean }) {
  const [state, setState] = useState<State>('idle')

  const field = dark
    ? 'w-full rounded-[10px] bg-white/[0.04] border border-line px-4 py-3 text-cream placeholder:text-cream-dim/70 focus:border-accent/60 transition-colors'
    : 'w-full rounded-[10px] bg-white border border-graphite/15 px-4 py-3 text-graphite placeholder:text-graphite-dim/70 focus:border-accent transition-colors'
  const label = dark ? 'eyebrow text-cream-dim' : 'eyebrow text-graphite-dim'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setState('sending')
    try {
      const res = await fetch(SITE.formspree, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div
        className={`${dark ? 'card' : 'card-paper'} p-8 text-center`}
        role="status"
      >
        <div className="mx-auto w-11 h-11 rounded-full bg-accent/15 text-accent flex items-center justify-center">
          <Icon name="check" className="w-6 h-6" />
        </div>
        <p className={`d3 mt-5 ${dark ? 'text-cream' : 'text-graphite'}`}>Message sent.</p>
        <p className={`mt-2 text-sm ${dark ? 'text-cream-dim' : 'text-graphite-dim'}`}>
          You will get a reply from {SITE.email} within 24 hours, usually sooner. If it is urgent, email
          directly and it will jump the queue.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <div className="grid gap-2">
        <label className={label} htmlFor="cf-name">
          Your name
        </label>
        <input id="cf-name" name="name" type="text" required autoComplete="name" className={field} />
      </div>
      <div className="grid gap-2">
        <label className={label} htmlFor="cf-email">
          Email
        </label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <label className={label} htmlFor="cf-business">
          Business or project name
        </label>
        <input id="cf-business" name="business" type="text" className={field} />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <label className={label} htmlFor="cf-need">
          What do you need?
        </label>
        <select id="cf-need" name="need" className={field} defaultValue={NEEDS[0]}>
          {NEEDS.map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <label className={label} htmlFor="cf-message">
          The short version
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          required
          placeholder="What the business does, what you want it to do online, and any deadline."
          className={`${field} resize-y`}
        />
      </div>
      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send it to Karl'}
          {state !== 'sending' && <Icon name="arrow" className="w-4 h-4" />}
        </button>
        <p className={`text-xs ${dark ? 'text-cream-dim' : 'text-graphite-dim'}`}>
          Goes straight to {SITE.email}. Reply within 24 hours. No mailing list, ever.
        </p>
      </div>
      {state === 'error' && (
        <p className="sm:col-span-2 text-sm text-accent" role="alert">
          That did not send. Something between here and the mail service failed. Please email{' '}
          <a href={`mailto:${SITE.email}`} className="underline">
            {SITE.email}
          </a>{' '}
          directly and it will be picked up straight away.
        </p>
      )}
    </form>
  )
}
