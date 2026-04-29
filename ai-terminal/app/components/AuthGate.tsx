'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface AuthGateProps {
  onLogin: (pin: string) => Promise<{ success: boolean; error?: string }>
}

export default function AuthGate({ onLogin }: AuthGateProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!pin.trim() || isLoading) return
    setIsLoading(true)
    setError('')

    const result = await onLogin(pin)
    if (!result.success) {
      setError(result.error || 'Invalid PIN')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setPin('')
      inputRef.current?.focus()
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleDigit = (digit: string) => {
    if (pin.length < 8) setPin((prev) => prev + digit)
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 bg-terminal-bg">
      <div className={`w-full max-w-xs ${shake ? 'shake' : ''}`}>
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-terminal-accent text-[48px] mb-3 block">
            terminal
          </span>
          <h1 className="font-headline text-xl font-semibold text-terminal-text mb-1">
            AI Terminal
          </h1>
          <p className="text-xs text-terminal-muted">Enter PIN to continue</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center gap-2.5 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  i < pin.length
                    ? 'bg-terminal-accent border-terminal-accent scale-110'
                    : 'border-terminal-border'
                }`}
              />
            ))}
          </div>

          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            onKeyDown={handleKeyDown}
            className="sr-only"
            autoFocus
          />

          {error && (
            <p className="text-center text-xs text-terminal-error mb-3">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => {
            if (key === '') return <div key="empty" />
            if (key === 'del') {
              return (
                <button
                  key="del"
                  onClick={handleDelete}
                  className="h-14 rounded-xl bg-terminal-elevated text-terminal-muted hover:text-terminal-text flex items-center justify-center transition-colors active:bg-terminal-border"
                >
                  <span className="material-symbols-outlined text-[20px]">backspace</span>
                </button>
              )
            }
            return (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                className="h-14 rounded-xl bg-terminal-elevated text-terminal-text font-mono text-lg hover:bg-terminal-accent/10 transition-colors active:bg-terminal-accent/20"
              >
                {key}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!pin.trim() || isLoading}
          className="w-full py-3.5 rounded-xl bg-terminal-accent text-terminal-bg font-semibold text-sm hover:bg-terminal-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Unlock'}
        </button>
      </div>
    </div>
  )
}
