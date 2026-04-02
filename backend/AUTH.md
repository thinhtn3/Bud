# Auth — Flow & Data Model

> Temporary reference doc. The Go backend fully owns the session lifecycle via HTTP-only cookies. Supabase Auth handles credential verification only.

---

## Data Model

Supabase Auth manages `auth.users` internally. The app extends it with a `profiles` table.

### `auth.users` (Supabase-managed)
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key — used as user identifier everywhere |
| `email` | `text` | Managed by Supabase |
| `created_at` | `timestamptz` | Managed by Supabase |

### `profiles` (app-managed)
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | FK → `auth.users.id`, primary key |
| `display_name` | `text` | User-facing name |
| `created_at` | `timestamptz` | Auto-set on insert |

A `profiles` row is created automatically via a Supabase database trigger on `auth.users` insert.

---

## Session Cookies

The backend sets two HTTP-only cookies after a successful login:

| Cookie | TTL | Purpose |
|---|---|---|
| `access_token` | 1 hour | Validated on every protected request |
| `refresh_token` | 7 days | Used to obtain a new access token |

**Cookie flags:** `HttpOnly`, `Secure` (production only), `SameSite=Strict`, `Path=/`

---

## Auth Flow

### Register
```
1. Frontend → supabase.auth.signUp({ email, password })
2. Supabase creates auth.users row + sends confirmation email
3. Supabase trigger creates profiles row
4. On confirmation, user can log in
```

### Login
```
1. Frontend → supabase.auth.signInWithPassword({ email, password })
2. Supabase returns { access_token, refresh_token }
3. Frontend → POST /api/auth/session  { access_token, refresh_token }
4. Go validates access_token (SUPABASE_JWT_SECRET), reads sub claim as userID
5. Go sets access_token cookie (1h) + refresh_token cookie (7d)
6. All subsequent API calls to Go include cookies automatically
```

### Per-request auth (Go middleware)
```
1. Read access_token cookie
2. Validate JWT signature using SUPABASE_JWT_SECRET
3. Extract sub claim → set userID on Gin context
4. Handler proceeds with c.GetString("userID")
```

### Token refresh
```
1. Go returns 401 (access_token expired)
2. Frontend → POST /api/auth/session/refresh
3. Go reads refresh_token cookie
4. Go → POST https://<SUPABASE_URL>/auth/v1/token?grant_type=refresh_token
5. Supabase returns new { access_token, refresh_token }
6. Go sets new cookies
7. Frontend retries original request
```

### Logout
```
1. Frontend → DELETE /api/auth/session
2. Go clears both cookies (MaxAge = -1)
3. Frontend → supabase.auth.signOut() (invalidates Supabase session)
4. Redirect to /login
```

---

## API Endpoints

| Method | Path | Auth required | Description |
|---|---|---|---|
| `POST` | `/api/auth/session` | No | Set session cookies after Supabase login |
| `POST` | `/api/auth/session/refresh` | No (reads cookie) | Refresh access token |
| `DELETE` | `/api/auth/session` | No | Clear session cookies |

---

## Frontend Responsibilities

- Call Supabase SDK for login/signup — never send credentials to Go directly
- Set `persistSession: false` on the Supabase client — Go owns the session, not localStorage
- Use `credentials: 'include'` on all fetch calls to Go so cookies are sent
- On 401: call `POST /api/auth/session/refresh` once, retry request; if refresh fails, redirect to `/login`
- Implement a refresh lock to prevent concurrent refresh calls (Supabase refresh tokens are single-use)

---

## Known Vulnerabilities & Mitigations

| Issue | Risk | Mitigation |
|---|---|---|
| CSRF | Medium | `SameSite=Strict` prevents cross-origin cookie submission |
| Refresh token in JS memory at login | Low | Window is milliseconds; not persisted |
| `Secure` flag breaks local dev (HTTP) | Low | Set `Secure: false` when `APP_ENV=development` |
| Refresh race condition | Medium | Refresh lock on frontend — queue retries behind a single in-flight refresh |
| Cookie scope too broad | Low | Acceptable for MVP; scope to `/api` later if needed |
