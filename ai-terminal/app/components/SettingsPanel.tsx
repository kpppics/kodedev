'use client'

import { Session } from '@/app/types'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  sessions: Session[]
  currentSessionId?: string
  onSwitchSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
  onClearMessages: () => void
  onLogout: () => void
  canInstall: boolean
  onInstall: () => void
}

export default function SettingsPanel({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSwitchSession,
  onNewSession,
  onDeleteSession,
  onClearMessages,
  onLogout,
  canInstall,
  onInstall,
}: SettingsPanelProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[280px] bg-terminal-surface border-l border-terminal-border z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-terminal-border">
          <h2 className="font-headline font-semibold text-sm">Settings</h2>
          <button
            onClick={onClose}
            className="text-terminal-muted hover:text-terminal-text transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider text-terminal-muted font-medium">Sessions</h3>
              <button
                onClick={onNewSession}
                className="text-terminal-accent hover:text-terminal-accent/80 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors group ${
                    session.id === currentSessionId
                      ? 'bg-terminal-accent/10 border border-terminal-accent/20'
                      : 'hover:bg-terminal-elevated'
                  }`}
                  onClick={() => {
                    onSwitchSession(session.id)
                    onClose()
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{session.name}</div>
                    <div className="text-[10px] text-terminal-muted">
                      {session.messages.length} messages
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="text-terminal-muted/0 group-hover:text-terminal-muted hover:!text-terminal-error transition-colors shrink-0 ml-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-terminal-border p-4 space-y-2">
            <button
              onClick={() => {
                onClearMessages()
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-terminal-muted hover:text-terminal-text hover:bg-terminal-elevated transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              Clear current session
            </button>

            {canInstall && (
              <button
                onClick={onInstall}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-terminal-accent hover:bg-terminal-accent/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                Install as app
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-terminal-error hover:bg-terminal-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-terminal-border">
          <p className="text-[10px] text-terminal-muted/50 text-center">
            AI Terminal v0.1.0 | Powered by Claude
          </p>
        </div>
      </div>
    </>
  )
}
