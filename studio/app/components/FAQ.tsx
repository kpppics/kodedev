'use client'

import { useState } from 'react'
import { FAQS } from '../data'

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-cyan-300">FAQ</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Questions worth answering.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-white/5 border-y border-white/5">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <button
                  className="w-full flex items-center justify-between gap-6 py-5 text-left"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg md:text-xl font-semibold">
                    {f.q}
                  </span>
                  <span
                    className={`shrink-0 h-7 w-7 rounded-full border border-white/10 bg-white/5 grid place-items-center transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                    aria-hidden
                  >
                    <span className="block w-3 h-px bg-text" />
                    <span className="absolute block h-3 w-px bg-text" />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-12 text-text-muted leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
