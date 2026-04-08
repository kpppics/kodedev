'use client'

import { useState } from 'react'
import Reveal from './Reveal'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xreozjpb'

export default function ContactSection() {
  const [state, setState] = useState<FormState>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(e.currentTarget),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        ;(e.target as HTMLFormElement).reset()
        setState('sent')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  const inputCls = 'w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 rounded-2xl p-4 text-slate-900 transition-all'

  return (
    <section className="py-24 bg-white" id="quote">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl border border-slate-200">
            <div className="text-center mb-12">
              <span className="text-primary font-bold tracking-widest text-xs uppercase block mb-4">Let&apos;s Talk</span>
              <h2 className="font-headline text-4xl font-bold text-slate-900 mb-4">Start Your Project</h2>
              <p className="text-slate-400 font-medium">Fill out the form and I&apos;ll get back to you within 24 hours.</p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Name</label>
                <input name="name" required type="text" className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Email</label>
                <input name="email" required type="email" className={inputCls} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">What do you need?</label>
                <select name="service" className={inputCls}>
                  <option value="">Select a service</option>
                  <option value="new-website">New Website</option>
                  <option value="redesign">Website Redesign</option>
                  <option value="custom-app">Custom App</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Message</label>
                <textarea name="message" rows={4} placeholder="Tell me about your project…" className={`${inputCls} resize-none`} />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={state === 'sending' || state === 'sent'}
                  className="w-full bg-primary text-white font-headline font-bold text-lg py-5 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                >
                  {state === 'sent' ? '✓ Message Sent!' : state === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
                {state === 'sent' && <p className="text-center text-sm text-green-600 font-medium mt-3">I&apos;ll be in touch within 24 hours.</p>}
                {state === 'error' && <p className="text-center text-sm text-red-500 font-medium mt-3">Something went wrong. Please try again.</p>}
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
