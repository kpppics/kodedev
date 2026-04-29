'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface TextInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
  initialValue?: string
  onClear?: () => void
}

export default function TextInput({
  onSend,
  disabled,
  placeholder = 'Ask anything...',
  initialValue = '',
  onClear,
}: TextInputProps) {
  const [value, setValue] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue)
      textareaRef.current?.focus()
    }
  }, [initialValue])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    onClear?.()
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 flex-1">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-terminal-elevated border border-terminal-border rounded-xl px-4 py-3 text-sm text-terminal-text placeholder:text-terminal-muted/50 resize-none focus:outline-none focus:border-terminal-accent/40 transition-colors font-body"
      />
      {value.trim() && (
        <button
          onClick={handleSend}
          disabled={disabled}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-terminal-accent text-terminal-bg hover:bg-terminal-accent/80 transition-colors shrink-0 disabled:opacity-40"
          aria-label="Send message"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      )}
    </div>
  )
}
