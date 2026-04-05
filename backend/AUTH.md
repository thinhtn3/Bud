# Auth — Flow & Data Model

> The Go backend fully owns the session lifecycle via HTTP-only cookies. Supabase Auth handles credential verification only.

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

A `profiles` row is created by Go's `SetSession` handler on the user's first login, using `display_name` from the JWT's `user_metadata` claim.

---

## Session Cookies

The backend sets two HTTP-only cookies after a successful login:

| Cookie | TTL | Purpose |
|---|---|---|
| `access_token` | 1 hour | Validated on every protected request |
| `refresh_token` | 7 days | Used to obtain a new access token |

**Cookie flags:** `HttpOnly`, `Secure` (production only), `SameSite=Strict`, `Path=/`

---

## What is a JWT?

A JWT (JSON Web Token) is a string with 3 base64-encoded parts separated by dots:

```
eyJhbGciOiJFUzI1NiJ9  .  eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiam9lQGV4YW1wbGUuY29tIiwiZXhwIjoxNzAwMDAwMDAwfQ  .  SIGNATURE
      HEADER                                              PAYLOAD                                                          SIGNATURE
```

- **Header** — metadata (e.g. signing algorithm: `ES256`)
- **Payload** — the claims: who the user is, when the token expires
- **Signature** — cryptographic proof that Supabase issued this exact token

Example decoded payload:
```json
{
  "sub": "a1b2c3d4-uuid",
  "email": "joe@example.com",
  "exp": 1700000000,
  "user_metadata": {
    "display_name": "Joe"
  }
}
```

The `sub` (subject) field is the user's UUID — this is how we identify users throughout the app.

---

## Auth Flow

### Register
```
1. Frontend → supabase.auth.signUp({ email, password, options: { data: { display_name } } })
2. Supabase creates auth.users row + sends confirmation email
3. User must verify email before logging in
4. profiles row is created on first login (see Login step 5)
```

### Login
```
1. Frontend → supabase.auth.signInWithPassword({ email, password })
2. Supabase returns { access_token, refresh_token }
3. Frontend → POST /api/auth/session  { access_token, refresh_token }
4. Go decodes access_token (no signature check — Supabase already authenticated the user)
5. Go reads sub + display_name claims, creates a profiles row on first login
6. Go sets access_token cookie (1h) + refresh_token cookie (7d)
7. All subsequent API calls to Go include cookies automatically
```

### Per-request auth (Go middleware)

Every protected route passes through `middleware/auth.go`. Here's what it does:

**Once at startup:** fetches Supabase's ECDSA public key from their JWKS endpoint and caches it.
```
GET {SUPABASE_URL}/auth/v1/.well-known/jwks.json → EC public key
```

**On every request:**
```
1. Read access_token cookie → missing? 401
2. jwt.Parse splits the token into header / payload / signature
3. Verifies the algorithm in the header is ECDSA (rejects anything else)
4. Recomputes the expected signature over "header.payload" using the cached EC public key
5. Compares against the actual signature in the token → mismatch? 401
6. Checks the exp claim hasn't passed → expired? 401
7. Extracts sub → set as userID on Gin context
8. Handler proceeds with c.GetString("userID")
```

**Why verify the signature?**  
The payload is just base64 — anyone can decode or modify it. The signature is what makes it tamper-proof. If someone changed the `sub` claim to impersonate another user, the signature would no longer match and the request would be rejected. Only Supabase — who holds the private key — can produce a valid signature.

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
2. Go clears both cookies (MaxAge = -1) — browser deletes them immediately
3. Frontend → supabase.auth.signOut() (invalidates Supabase session)
4. Redirect to /login
```

---

## API Endpoints

| Method | Path | Auth required | Description |
|---|---|---|---|
| `POST` | `/api/auth/session` | No | Set session cookies after Supabase login |
| `POST` | `/api/auth/session/refresh` | No (reads cookie) | Refresh access token |
| `DELETE` | `/api/auth/session` | No | Clear session cookies (logout) |
| `GET` | `/api/me` | Yes | Return current user's ID and email |

---

## Why HTTP-only Cookies (not localStorage)?

Tokens in `localStorage` are readable by any JavaScript on the page. If there's ever an XSS vulnerability, an attacker can steal them. HTTP-only cookies cannot be read by JavaScript at all — the browser sends them automatically on every request but they're invisible to scripts.

## Why do tokens go through Go to set cookies?

The frontend can't set HTTP-only cookies on itself — only a server can write them via a `Set-Cookie` response header. There's no browser API that can set `HttpOnly` from JavaScript.

So after Supabase returns the tokens, the frontend hands them to Go as fast as possible:

```
Supabase → tokens → frontend (briefly in memory)
                          ↓
                  POST /api/auth/session
                          ↓
              Go responds with Set-Cookie headers
                          ↓
              Browser stores them as HttpOnly cookies
                          ↓
              Frontend can no longer read the tokens
              — browser sends them automatically on every request
```

Go acts as the gatekeeper specifically because only a server response can write an HTTP-only cookie. Once the cookies are set, the frontend forgets the tokens entirely — they live exclusively in the browser's cookie jar.

## Frontend Responsibilities

- Call Supabase SDK for login/signup — never send credentials to Go directly
- Set `persistSession: false` on the Supabase client — Go owns the session, not localStorage
- Use `credentials: 'include'` on all fetch calls to Go so cookies are sent
- On 401: call `POST /api/auth/session/refresh` once, retry request; if refresh fails, redirect to `/login` (no concurrent-refresh lock yet — single-use refresh tokens can be exhausted by parallel calls)

---

## Known Vulnerabilities & Mitigations

| Issue | Risk | Mitigation |
|---|---|---|
| CSRF | Medium | `SameSite=Strict` prevents cross-origin cookie submission |
| Refresh token in JS memory at login | Low | Window is milliseconds; not persisted |
| `Secure` flag breaks local dev (HTTP) | Low | Set `Secure: false` when `APP_ENV=development` |
| Refresh race condition | Medium | Not yet mitigated — frontend retries once but has no lock for concurrent refresh calls |
| Cookie scope too broad | Low | Acceptable for MVP; scope to `/api` later if needed |
