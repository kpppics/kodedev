'use client'

interface StatusBarProps {
  sessionName?: string
  isOnline: boolean
  isLoading: boolean
  onSettingsClick: () => void
}

export default function StatusBar({ sessionName, isOnline, isLoading, onSettingsClick }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-terminal-surface border-b border-terminal-border">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-terminal-accent text-[20px]">terminal</span>
        <span className="font-headline font-semibold text-sm text-terminal-text">AI Terminal</span>
      </div>

      <div className="flex items-center gap-1.5 flex-1 justify-center min-w-0 px-3">
        <span className="text-xs text-terminal-muted truncate">{sessionName || 'New Session'}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isLoading
                ? 'bg-terminal-warning animate-pulse'
                : isOnline
                  ? 'bg-terminal-green'
                  : 'bg-terminal-error'
            }`}
          />
        </div>
        <button
          onClick={onSettingsClick}
          className="text-terminal-muted hover:text-terminal-accent transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </div>
  )
}
