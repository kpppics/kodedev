'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Message, Session } from '@/app/types'
import { buildPrompt } from '@/app/lib/promptEngine'
import { getSuggestions } from '@/app/lib/suggestions'
import {
  getSessions,
  saveSession,
  deleteSession as removeSession,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
} from '@/app/lib/sessionStore'
import type { SuggestionChip } from '@/app/types'

export function useChat(token: string | null) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionChip[]>([])
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const stored = getSessions()
    if (stored.length > 0) {
      setSessions(stored)
      const activeId = getActiveSessionId()
      const active = stored.find((s) => s.id === activeId) || stored[0]
      setCurrentSession(active)
      setActiveSessionId(active.id)
      setSuggestions(getSuggestions(active.messages, active.messages.at(-1)?.intent))
    } else {
      const fresh = createNewSession()
      setSessions([fresh])
      setCurrentSession(fresh)
      setActiveSessionId(fresh.id)
      saveSession(fresh)
      setSuggestions(getSuggestions([]))
    }
  }, [])

  const persistSession = useCallback(
    (session: Session) => {
      const updated = { ...session, updatedAt: Date.now() }
      setCurrentSession(updated)
      saveSession(updated)
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === updated.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = updated
          return next
        }
        return [updated, ...prev]
      })
    },
    []
  )

  const sendMessage = useCallback(
    async (rawInput: string, isVoice = false) => {
      if (!rawInput.trim() || !token || !currentSession) return

      setError(null)
      const { structuredPrompt, intent } = buildPrompt(rawInput, currentSession.messages, isVoice)

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: rawInput,
        structuredPrompt,
        intent,
        timestamp: Date.now(),
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      }

      const updatedMessages = [...currentSession.messages, userMsg, assistantMsg]
      const updatedSession = { ...currentSession, messages: updatedMessages }
      persistSession(updatedSession)
      setIsLoading(true)

      const historyForApi = currentSession.messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      abortRef.current = new AbortController()

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: historyForApi, structuredPrompt }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || `Error ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response stream')

        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const parsed = JSON.parse(line.slice(6))
              if (parsed.type === 'delta') {
                fullContent += parsed.text
                setCurrentSession((prev) => {
                  if (!prev) return prev
                  const msgs = [...prev.messages]
                  const lastIdx = msgs.length - 1
                  msgs[lastIdx] = { ...msgs[lastIdx], content: fullContent, isStreaming: true }
                  return { ...prev, messages: msgs }
                })
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error)
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue
              throw e
            }
          }
        }

        setCurrentSession((prev) => {
          if (!prev) return prev
          const msgs = [...prev.messages]
          const lastIdx = msgs.length - 1
          msgs[lastIdx] = { ...msgs[lastIdx], content: fullContent, isStreaming: false }
          const final = { ...prev, messages: msgs, updatedAt: Date.now() }
          saveSession(final)
          setSessions((s) => {
            const idx = s.findIndex((x) => x.id === final.id)
            if (idx >= 0) {
              const next = [...s]
              next[idx] = final
              return next
            }
            return s
          })
          setSuggestions(getSuggestions(msgs, intent))
          return final
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const msg = err instanceof Error ? err.message : 'Something went wrong'
        setError(msg)
        setCurrentSession((prev) => {
          if (!prev) return prev
          const msgs = prev.messages.filter((m) => m.id !== assistantMsg.id)
          return { ...prev, messages: msgs }
        })
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [token, currentSession, persistSession]
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    if (!currentSession) return
    const cleared = { ...currentSession, messages: [], updatedAt: Date.now() }
    persistSession(cleared)
    setSuggestions(getSuggestions([]))
  }, [currentSession, persistSession])

  const switchSession = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id)
      if (session) {
        setCurrentSession(session)
        setActiveSessionId(session.id)
        setSuggestions(getSuggestions(session.messages, session.messages.at(-1)?.intent))
        setError(null)
      }
    },
    [sessions]
  )

  const createSession = useCallback(() => {
    const fresh = createNewSession()
    setSessions((prev) => [fresh, ...prev])
    setCurrentSession(fresh)
    setActiveSessionId(fresh.id)
    saveSession(fresh)
    setSuggestions(getSuggestions([]))
    setError(null)
  }, [])

  const deleteSessionById = useCallback(
    (id: string) => {
      removeSession(id)
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id)
        if (currentSession?.id === id) {
          if (filtered.length > 0) {
            setCurrentSession(filtered[0])
            setActiveSessionId(filtered[0].id)
            setSuggestions(getSuggestions(filtered[0].messages))
          } else {
            const fresh = createNewSession()
            filtered.push(fresh)
            setCurrentSession(fresh)
            setActiveSessionId(fresh.id)
            saveSession(fresh)
            setSuggestions(getSuggestions([]))
          }
        }
        return filtered
      })
    },
    [currentSession]
  )

  return {
    messages: currentSession?.messages || [],
    isLoading,
    error,
    suggestions,
    sendMessage,
    stopStreaming,
    clearMessages,
    currentSession,
    sessions,
    switchSession,
    createSession,
    deleteSession: deleteSessionById,
  }
}
