'use client'

import { useAuth } from '@/app/hooks/useAuth'
import AuthGate from './AuthGate'
import TerminalShell from './TerminalShell'

export default function TerminalApp() {
  const { isAuthenticated, isLoading, token, login, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-terminal-bg">
        <div className="text-center">
          <span className="material-symbols-outlined text-terminal-accent text-[36px] animate-pulse">
            terminal
          </span>
          <p className="text-xs text-terminal-muted mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !token) {
    return <AuthGate onLogin={login} />
  }

  return <TerminalShell token={token} onLogout={logout} />
}
