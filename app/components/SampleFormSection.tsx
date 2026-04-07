'use client'

import { useState } from 'react'
import Reveal from './Reveal'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xreozjpb'

export default function SampleFormSection() {
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

  const inputCls = 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/40 w-full transition-all'

  return (
    <section className="py-24 bg-white px-6" id="free-sample">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="bg-gradient-to-br from-indigo-600 via-primary to-violet-700 p-8 md:p-16 rounded-[3rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">Get My Free Sample</h2>
                <p className="text-indigo-100 text-lg max-w-xl mx-auto">See what your business could look like with KODEDEV before you commit. No strings attached.</p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                  <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">person</span> Basic Info
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input name="full_name" required placeholder="Full Name" type="text" className={inputCls} />
                    <input name="email" required placeholder="Email Address" type="email" className={inputCls} />
                    <input name="phone" placeholder="Phone (optional)" type="tel" className={inputCls} />
                  </div>
                </div>

                <div>
                  <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">business</span> Business Details
                  </h3>
                  <div className="space-y-4">
                    <input name="business_name" required placeholder="Business Name" type="text" className={inputCls} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input name="existing_website" placeholder="Existing Website (if any)" type="url" className={inputCls} />
                      <input name="inspiration" placeholder="Site you like the look of (optional)" type="text" className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-headline text-lg font-bold mb-4">Design Style</h3>
                    <div className="space-y-3">
                      {['Modern & Clean', 'Bold & Techy', 'Warm & Friendly'].map(style => (
                        <label key={style} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 transition-all border border-white/10">
                          <input name="style" value={style} type="radio" className="accent-white" />
                          <span>{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold mb-4">Required Pages</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {['Services', 'Portfolio', 'Blog', 'Shop', 'Contact', 'Booking'].map(page => (
                        <label key={page} className="flex items-center gap-2">
                          <input name="pages[]" value={page} type="checkbox" className="accent-white rounded" />
                          {page}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={state === 'sending' || state === 'sent'}
                    className="w-full bg-white text-primary font-headline font-bold text-lg py-5 rounded-full shadow-2xl hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {state === 'sent' ? 'Thanks! I\'ll send your sample within 24 hours.' : state === 'sending' ? 'Sending...' : 'Get My Free Sample'}
                  </button>
                  {state === 'error' && (
                    <p className="mt-4 text-center font-semibold text-red-200">Something went wrong. Please try again.</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
