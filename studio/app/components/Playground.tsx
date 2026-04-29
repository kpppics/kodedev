'use client'

import { useEffect, useState } from 'react'
import Icon from './Icon'

const MODELS = [
  { id: 'opus', name: 'Atlas Opus 4',   color: 'from-violet-500 to-fuchsia-400' },
  { id: 'sonnet', name: 'Atlas Sonnet 4', color: 'from-indigo-500 to-violet-400' },
  { id: 'haiku', name: 'Atlas Haiku 4', color: 'from-cyan-400 to-emerald-400' },
]

const REPLIES: Record<string, { stream: string[]; latency: string; credits: string }> = {
  opus: {
    latency: '1.18s',
    credits: '34',
    stream: [
      'Yes — and the trade-offs are worth flagging.',
      ' For your case (UK e-com, ~50k SKUs, mostly product Q&A),',
      ' the cheapest model that holds quality is **Atlas Sonnet 4** with',
      ' our retrieval router pinned to your catalogue.',
      '\n\n**Why not Haiku?** It scores 11pts lower on grounded answers',
      ' once the catalogue passes ~20k SKUs.',
      '\n**Why not Opus?** You only need it for refunds policy reasoning;',
      ' route those (≈4% of traffic) and pay for Opus only when it fires.',
      '\n\nEstimated cost at 1M monthly chats: **£487/mo**.',
    ],
  },
  sonnet: {
    latency: '0.59s',
    credits: '8',
    stream: [
      'Short answer: pin **Sonnet 4** with retrieval, route ~4% to Opus.',
      ' Estimated **£487/mo** for 1M chats.',
      ' Want me to draft the routing rules?',
    ],
  },
  haiku: {
    latency: '0.41s',
    credits: '0.6',
    stream: [
      'Use Sonnet + retrieval. Route refund-policy turns to Opus. ~£487/mo at 1M chats.',
    ],
  },
}

export default function Playground() {
  const [model, setModel] = useState<'opus' | 'sonnet' | 'haiku'>('sonnet')
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(true)

  useEffect(() => {
    setText('')
    setStreaming(true)
    const stream = REPLIES[model].stream.join('')
    let i = 0
    const id = setInterval(() => {
      i += Math.max(2, Math.round(stream.length / 90))
      if (i >= stream.length) {
        setText(stream)
        setStreaming(false)
        clearInterval(id)
      } else {
        setText(stream.slice(0, i))
      }
    }, 28)
    return () => clearInterval(id)
  }, [model])

  return (
    <section id="playground" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-pink-300">Studio playground</p>
          <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Prompt every model side-by-side. <span className="text-prism">No code.</span>
          </h2>
          <p className="mt-5 text-lg text-text-muted">
            Compare answers, latency and cost in one window. Save prompts as
            shareable mini-apps. Publish as a hosted page or webhook in one click.
          </p>
        </div>

        <div className="mt-12 card-glass p-3 md:p-5 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 px-2 pt-1 pb-3 border-b border-white/5">
            <div className="flex items-center gap-1 mr-2">
              <span className="win-dot bg-rose-400/80" />
              <span className="win-dot bg-amber/80" />
              <span className="win-dot bg-emerald/80" />
            </div>
            <span className="text-xs font-mono text-text-faint">studio · /playground/new</span>
            <div className="ml-auto flex items-center gap-1.5">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id as typeof model)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition ${
                    model === m.id
                      ? 'border-white/20 bg-white/10 text-text'
                      : 'border-white/5 bg-white/[0.02] text-text-muted hover:text-text hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${m.color}`} />
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-3 mt-3">
            {/* Prompt panel */}
            <div className="md:col-span-2 rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-text-faint">System</div>
              <p className="mt-1 text-sm text-text-muted">
                You are a senior AI engineer. Be terse. Recommend a model and routing strategy.
              </p>
              <div className="mt-4 text-[10px] uppercase tracking-widest font-semibold text-text-faint">User</div>
              <p className="mt-1 text-sm text-text">
                I run a UK e-commerce shop with ~50k SKUs. Most chats are product Q&A,
                some refund-policy reasoning. Which model should I use, and what does it cost?
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Tool>tools.retrieval</Tool>
                <Tool>tools.code</Tool>
                <Tool>tools.deepResearch</Tool>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <Knob label="Temperature" value="0.4" />
                <Knob label="Top-p" value="0.9" />
                <Knob label="Max tok" value="2K" />
              </div>
            </div>

            {/* Reply panel */}
            <div className="md:col-span-3 rounded-xl bg-bg/50 border border-white/5 p-4 min-h-[320px] relative">
              <div className="flex items-center justify-between text-[11px] text-text-faint">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${MODELS.find(m => m.id === model)!.color}`} />
                  <span className="font-mono">{MODELS.find(m => m.id === model)!.name.toLowerCase().replace(/\s/g, '-')}</span>
                </span>
                <span className="font-mono">
                  {REPLIES[model].latency} · {REPLIES[model].credits} credits
                </span>
              </div>
              <div className="mt-4 text-[15px] leading-7 text-text whitespace-pre-wrap">
                {text.split('**').map((chunk, i) => i % 2 === 0
                  ? <span key={i}>{chunk}</span>
                  : <strong key={i} className="text-violet-200">{chunk}</strong>)}
                {streaming && <span className="inline-block w-2 h-4 bg-violet-300 align-middle animate-pulse ml-0.5" />}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition px-3 py-1.5 text-xs font-medium">
                  Save as app
                </button>
                <button className="rounded-lg bg-white text-bg hover:bg-text transition px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
                  Publish <Icon name="arrow" size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Tool({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-text-muted">
      <Icon name="bolt" size={11} className="text-amber-300" />
      {children}
    </span>
  )
}

function Knob({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/[0.02] border border-white/5 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-text-faint">{label}</div>
      <div className="font-mono text-sm text-text">{value}</div>
    </div>
  )
}
