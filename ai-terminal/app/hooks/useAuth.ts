'use client'

import { useState, useEffect, useCallback } from 'react'
import { AUTH_TOKEN_KEY } from '@/app/lib/constants'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_TOKEN_KEY)
    if (stored) setToken(stored)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (!res.ok) {
        const data = await res.json()
        return { success: false, error: data.error || 'Invalid PIN' }
      }

      const { token: newToken } = await res.json()
      localStorage.setItem(AUTH_TOKEN_KEY, newToken)
      setToken(newToken)
      return { success: true }
    } catch {
      return { success: false, error: 'Connection failed' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
  }, [])

  return {
    isAuthenticated: !!token,
    isLoading,
    token,
    login,
    logout,
  }
}
