'use client'

import { useEffect, useRef, useState } from 'react'
import { ACCENTS, useTheme } from './ThemeProvider'

export default function ThemeControls() {
  const { mode, toggleMode, accent, setAccent } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {/* Light/Dark toggle */}
      <button
        onClick={toggleMode}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        className="relative w-10 h-10 grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px] text-emerald-300">
          {mode === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      {/* Accent picker trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change accent color"
        aria-expanded={open}
        className="relative w-10 h-10 grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <span
          className="w-5 h-5 rounded-full border-2 border-white/30 shadow-sm"
          style={{ background: accent.base }}
        />
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute right-0 top-12 w-72 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-5 z-50"
          role="dialog"
        >
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
            Theme
          </div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => mode !== 'light' && toggleMode()}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-headline font-bold transition-all ${
                mode === 'light'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">light_mode</span>
              Light
            </button>
            <button
              onClick={() => mode !== 'dark' && toggleMode()}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-headline font-bold transition-all ${
                mode === 'dark'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">dark_mode</span>
              Dark
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Text Color
            </div>
            <div className="text-xs text-emerald-300 font-medium">{accent.name}</div>
          </div>
          <div className="grid grid-cols-9 gap-2">
            {ACCENTS.map(a => {
              const active = a.name === accent.name
              return (
                <button
                  key={a.name}
                  onClick={() => setAccent(a.name)}
                  aria-label={`Set accent to ${a.name}`}
                  className={`relative w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    active ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-slate-900 scale-110' : ''
                  }`}
                  style={{ background: a.base }}
                >
                  {active && (
                    <span className="material-symbols-outlined text-[14px] text-slate-950 absolute inset-0 grid place-items-center">
                      check
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-slate-500">
            Saved to your browser. Pick the vibe you want.
          </div>
        </div>
      )}
    </div>
  )
}
