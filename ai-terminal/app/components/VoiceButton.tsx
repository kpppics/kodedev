'use client'

interface VoiceButtonProps {
  isListening: boolean
  isSupported: boolean
  onStart: () => void
  onStop: () => void
}

export default function VoiceButton({ isListening, isSupported, onStart, onStop }: VoiceButtonProps) {
  if (!isSupported) return null

  return (
    <button
      onClick={isListening ? onStop : onStart}
      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all shrink-0 ${
        isListening
          ? 'bg-terminal-error/20 text-terminal-error voice-pulse'
          : 'bg-terminal-elevated text-terminal-muted hover:text-terminal-accent hover:bg-terminal-accent/10'
      }`}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
    >
      <span className="material-symbols-outlined text-[22px]">
        {isListening ? 'stop' : 'mic'}
      </span>
    </button>
  )
}
