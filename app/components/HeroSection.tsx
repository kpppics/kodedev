'use client'

import Reveal from './Reveal'
import { useCounter } from '../hooks/useCounter'
import { useTypewriter } from '../hooks/useTypewriter'

const STATS = [
  { target: 50,  suffix: '+', label: 'Projects delivered' },
  { target: 24,  suffix: 'h', label: 'Response time' },
  { target: 100, suffix: '%', label: 'Client satisfaction' },
]

function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, display } = useCounter(target, suffix)
  return (
    <div ref={ref}>
      <div className="font-headline text-3xl font-bold text-primary counter-num">{display}</div>
      <div className="text-sm text-slate-400 font-medium mt-1">{label}</div>
    </div>
  )
}

export default function HeroSection() {
  const typewriterText = useTypewriter()

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden px-6 grid-bg bg-white">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="blob-1 absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="blob-2 absolute top-1/2 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="blob-3 absolute bottom-1/4 left-1/2 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center py-16">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-2 rounded-full text-sm font-bold font-headline mb-8 border border-primary/15">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Available for new projects
          </div>

          <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Websites &amp; apps that<br />
            <span className="gradient-text">{typewriterText || '\u00a0'}</span>
            <span className="tw-cursor" />
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-lg mb-10 leading-relaxed">
            Professional websites, redesigns, and custom apps for small businesses. Affordable, human, and built to grow with you.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              className="bg-primary text-white px-8 py-4 rounded-full font-headline font-bold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
              href="#free-sample"
            >
              Get My Free Sample
            </a>
            <a
              className="px-8 py-4 rounded-full border-2 border-slate-300 font-headline font-bold text-base text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all"
              href="#quote"
            >
              Get a Quote
            </a>
          </div>

          <div className="flex flex-wrap gap-10 mt-12 pt-8 border-t border-slate-200">
            {STATS.map(s => (
              <StatCounter key={s.label} {...s} />
            ))}
          </div>
        </div>

        <Reveal delay={200}>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl float border-4 border-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwpIWr2w67rFTO5vyd-aMcPAD_SIMayu-VwefM88-7dKVKfMxnN9DXhVUJpoxs0tT6W94OHdR8v0n9bR_MxhhnL1KAVSfQHjBLrBWeuynCpiALzVKu03VOkQYKCB7TEcpzpe0bTyZzcS8AubsfSwK-NXxvKGqS0XnWTuniZ70uadPu6LWli4Cd_-F1Y3EI0a_DWHUbaAgxbwp3rAHGj6cTKtUhWpkN34XUQ_Q0W17qwpQmeEI_8yPReEnonCZcp-bpABqhU6ItbeI"
                alt="Modern web design workspace"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl max-w-[240px] border border-slate-100">
              <div className="flex gap-1 text-amber-400 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-sm font-medium italic text-slate-700">&ldquo;Best investment for my local bakery. Professional and easy to talk to.&rdquo;</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
