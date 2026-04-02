import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL as string

interface User {
  id: string
  email: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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

    setUser({ id: data.user.id, email: data.user.email ?? '' })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
    // Supabase sends a confirmation email — user must verify before logging in
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
