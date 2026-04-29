import { Session } from '@/app/types'
import { SESSIONS_KEY, ACTIVE_SESSION_KEY } from './constants'

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSession(session: Session): void {
  try {
    const sessions = getSessions()
    const idx = sessions.findIndex((s) => s.id === session.id)
    if (idx >= 0) {
      sessions[idx] = session
    } else {
      sessions.unshift(session)
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // Storage full or unavailable
  }
}

export function deleteSession(id: string): void {
  try {
    const sessions = getSessions().filter((s) => s.id !== id)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // Storage unavailable
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY)
  } catch {
    return null
  }
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, id)
  } catch {
    // Storage unavailable
  }
}

export function createNewSession(): Session {
  return {
    id: crypto.randomUUID(),
    name: `Session ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
