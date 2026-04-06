import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function OnboardingRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (user.preferences.onboarding_completed) return <Navigate to="/" replace />

  return <>{children}</>
}
