const API_URL = import.meta.env.VITE_API_URL as string

// Prevents concurrent refresh calls — Supabase refresh tokens are single-use.
let refreshPromise: Promise<void> | null = null

async function refreshSession(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/session/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Session expired')
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include', // always send cookies
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  // On 401, attempt one silent refresh then retry
  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => {
        refreshPromise = null
      })
    }

    try {
      await refreshPromise
    } catch {
      // Refresh failed — caller should redirect to /login
      throw new Error('unauthenticated')
    }

    // Retry original request once
    const retry = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })

    if (!retry.ok) throw new Error(`Request failed: ${retry.status}`)
    return retry.json() as Promise<T>
  }

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}

export async function checkDisplayNameAvailable(name: string): Promise<boolean> {
  const res = await fetch(
    `${API_URL}/api/auth/check-display-name?name=${encodeURIComponent(name)}`,
  )
  if (!res.ok) throw new Error('Could not check display name')
  return ((await res.json()) as { available: boolean }).available
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
