'use client'

import { SuggestionChip } from '@/app/types'

interface SuggestionChipsProps {
  suggestions: SuggestionChip[]
  onSelect: (prompt: string) => void
}

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
      {suggestions.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.prompt)}
          className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full bg-terminal-elevated border border-terminal-border text-xs text-terminal-muted hover:text-terminal-accent hover:border-terminal-accent/30 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">{chip.icon}</span>
          {chip.label}
        </button>
      ))}
    </div>
  )
}
