import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, CardAlias } from '@/types'

const API_URL = import.meta.env.VITE_API_URL as string

interface UserPreferences {
  onboarding_completed: boolean
  budget_period: string
  budget_amount: number
  carry_over_excess: boolean
  monthly_income: number | null
  currency: string
  financial_goals: string[]
}

interface User {
  id: string
  email: string
  display_name: string
  categories: Category[]
  card_aliases: CardAlias[]
  preferences: UserPreferences
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  addCategory: (name: string) => Promise<Category>
  addCardAlias: (card: Omit<CardAlias, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CardAlias>
  updateCardAlias: (id: string, card: Omit<CardAlias, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CardAlias>
  deleteCardAlias: (id: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, verify the session cookie is still valid by calling /api/me.
  // If it fails with 401, try a silent refresh once before giving up.
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_URL}/api/me`, { credentials: 'include' })

        if (res.status === 401) {
          const refreshRes = await fetch(`${API_URL}/api/auth/session/refresh`, {
            method: 'POST',
            credentials: 'include',
          })
          if (!refreshRes.ok) {
            setUser(null)
            return
          }
          const retryRes = await fetch(`${API_URL}/api/me`, { credentials: 'include' })
          if (!retryRes.ok) { setUser(null); return }
          const data = await retryRes.json() as User
          setUser(data)
          return
        }

        if (!res.ok) { setUser(null); return }
        const data = await res.json() as User
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void checkSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) throw new Error(error?.message ?? 'Login failed')

    // Hand tokens to Go — it sets the HTTP-only cookies
    const res = await fetch(`${API_URL}/api/auth/session`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }),
    })
    if (!res.ok) throw new Error('Failed to create session')

    const userData = await res.json() as User
    setUser(userData)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw new Error(error.message)
    // Supabase sends a confirmation email — user must verify before logging in
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/me`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json() as User
      setUser(data)
    } catch {
      // silently ignore — stale data is better than crashing
    }
  }, [])

  const addCategory = useCallback(async (name: string): Promise<Category> => {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) throw new Error('Failed to create category')
    const cat = await res.json() as Category
    setUser(prev => prev ? { ...prev, categories: [...prev.categories, cat] } : prev)
    return cat
  }, [])

  const addCardAlias = useCallback(async (card: Omit<CardAlias, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CardAlias> => {
    const res = await fetch(`${API_URL}/api/cards`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    })
    if (!res.ok) throw new Error('Failed to create card alias')
    const newCard = await res.json() as CardAlias
    setUser(prev => prev ? { ...prev, card_aliases: [newCard, ...prev.card_aliases] } : prev)
    return newCard
  }, [])

  const updateCardAlias = useCallback(async (id: string, card: Omit<CardAlias, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CardAlias> => {
    const res = await fetch(`${API_URL}/api/cards/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    })
    if (!res.ok) throw new Error('Failed to update card alias')
    const updatedCard = await res.json() as CardAlias
    setUser(prev => prev ? {
      ...prev,
      card_aliases: prev.card_aliases.map(c => c.id === id ? updatedCard : c)
    } : prev)
    return updatedCard
  }, [])

  const deleteCardAlias = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/cards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to delete card alias')
    setUser(prev => prev ? {
      ...prev,
      card_aliases: prev.card_aliases.filter(c => c.id !== id)
    } : prev)
  }, [])

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/session`, {
      method: 'DELETE',
      credentials: 'include',
    })
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      addCategory,
      addCardAlias,
      updateCardAlias,
      deleteCardAlias
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
