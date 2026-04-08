'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Submission, User } from './types'
import { SAMPLE_SUBMISSIONS } from './data'

const SUB_KEY = 'cp_submissions_v1'
const USER_KEY = 'cp_user_v1'

interface AppContextValue {
  user: User | null
  submissions: Submission[]
  signIn: (email: string, name: string) => User
  signOut: () => void
  addSubmission: (s: Omit<Submission, 'id' | 'createdAt' | 'status' | 'earnings' | 'views' | 'authorId' | 'authorName'>) => Submission
  removeSubmission: (id: string) => void
  updateSubmissionStatus: (id: string, status: Submission['status'], earnings?: number) => void
  setPayout: (method: 'bank' | 'paypal', detail: string) => void
  withdraw: () => number
  hydrated: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>(SAMPLE_SUBMISSIONS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY)
      if (u) setUser(JSON.parse(u))
      const s = localStorage.getItem(SUB_KEY)
      if (s) {
        const parsed: Submission[] = JSON.parse(s)
        // merge demo + saved (saved first)
        const map = new Map<string, Submission>()
        for (const item of parsed) map.set(item.id, item)
        for (const item of SAMPLE_SUBMISSIONS) if (!map.has(item.id)) map.set(item.id, item)
        setSubmissions(Array.from(map.values()))
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      // Only persist user-created submissions to keep storage small
      const userSubs = submissions.filter((s) => !s.id.startsWith('demo-'))
      localStorage.setItem(SUB_KEY, JSON.stringify(userSubs))
    } catch {}
  }, [submissions, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
      else localStorage.removeItem(USER_KEY)
    } catch {}
  }, [user, hydrated])

  const value: AppContextValue = useMemo(
    () => ({
      user,
      submissions: [...submissions].sort((a, b) => b.createdAt - a.createdAt),
      hydrated,
      signIn: (email, name) => {
        const handle = (name || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 20) || 'reporter'
        const newUser: User = {
          id: 'u_' + Math.random().toString(36).slice(2, 10),
          name: name || email.split('@')[0],
          email,
          handle,
          joined: Date.now(),
          balance: 0,
          lifetimeEarnings: 0,
        }
        setUser(newUser)
        return newUser
      },
      signOut: () => setUser(null),
      addSubmission: (data) => {
        if (!user) throw new Error('Not signed in')
        const sub: Submission = {
          ...data,
          id: 's_' + Math.random().toString(36).slice(2, 10),
          createdAt: Date.now(),
          status: 'pending',
          earnings: 0,
          views: 0,
          authorId: user.id,
          authorName: user.name,
        }
        setSubmissions((prev) => [sub, ...prev])
        // Simulate review + sale
        const reviewMs = 4000 + Math.random() * 4000
        setTimeout(() => {
          setSubmissions((prev) =>
            prev.map((s) => (s.id === sub.id ? { ...s, status: 'approved' } : s))
          )
        }, reviewMs)
        const saleMs = reviewMs + 6000 + Math.random() * 8000
        setTimeout(() => {
          const payout = Math.round((sub.askingPrice * (0.85 + Math.random() * 0.6)) / 5) * 5
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === sub.id ? { ...s, status: 'sold', earnings: payout, views: 1000 + Math.round(Math.random() * 9000) } : s
            )
          )
          setUser((u) =>
            u
              ? {
                  ...u,
                  balance: u.balance + payout,
                  lifetimeEarnings: u.lifetimeEarnings + payout,
                }
              : u
          )
        }, saleMs)
        return sub
      },
      removeSubmission: (id) => setSubmissions((prev) => prev.filter((s) => s.id !== id)),
      updateSubmissionStatus: (id, status, earnings) =>
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status, ...(earnings !== undefined ? { earnings } : {}) }
              : s
          )
        ),
      setPayout: (method, detail) =>
        setUser((u) => (u ? { ...u, payoutMethod: method, payoutDetail: detail } : u)),
      withdraw: () => {
        let amount = 0
        setUser((u) => {
          if (!u) return u
          amount = u.balance
          return { ...u, balance: 0 }
        })
        return amount
      },
    }),
    [user, submissions, hydrated]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
