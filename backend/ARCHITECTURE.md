# Backend Architecture

Go + Gin REST API. Connects to Supabase Postgres via GORM. Go owns the session lifecycle via HTTP-only cookies — Supabase Auth handles credential verification only.

## Structure

```
backend/
├── main.go          # Entry point — wires config, DB, and routes
├── config/          # Loads environment variables
├── db/              # Opens and exposes the GORM database connection
├── middleware/      # Gin middleware (JWT auth, CORS)
├── models/          # GORM model definitions
├── handlers/        # Request handlers, one file per resource
├── supabase/        # Supabase client (token refresh calls)
└── routes/          # Registers all routes and applies middleware
```

## Package responsibilities

**`config`** — reads `.env` and returns a typed `Config` struct. Any new env var is added here. Nothing else in the codebase touches `os.Getenv` directly.

**`db`** — opens the Postgres connection via GORM and exposes a package-level `DB` variable. Called once at startup.

**`middleware`** — JWT auth middleware. At startup, fetches Supabase's ECDSA public key from their JWKS endpoint (`/auth/v1/.well-known/jwks.json`) and caches it. On each request, reads the `access_token` cookie, verifies the ES256 signature and expiry, then sets `userID` and `email` on the Gin context.

**`models`** — GORM struct definitions for each table. No business logic here — just field mappings and table names.

**`handlers`** — one file per resource. `auth.go` handles session create/refresh/clear and profile upsert on first login. Other handlers read from the Gin context, call GORM, and write JSON responses.

**`supabase`** — thin client for calling Supabase's REST Auth API (currently used for token refresh).

**`routes`** — registers route groups, applies middleware, and maps paths to handlers. `main.go` calls a single `routes.Register(r, cfg)` function.

## Request flow

```
HTTP request
  → CORS middleware
  → Auth middleware (reads access_token cookie, verifies ES256 signature + expiry, sets userID)
  → Handler (reads params, queries DB via GORM)
  → JSON response
```

## Auth

Go owns the session. After Supabase login, the frontend POSTs tokens to `POST /api/auth/session`. Go decodes the JWT, upserts the profile on first login, seeds default categories for new users, and sets two HTTP-only cookies (`access_token` 1h, `refresh_token` 7d). All subsequent requests are authenticated via cookie — no `Authorization` header. See `AUTH.md` for the full flow.

## Data Models

> Scoped to the personal finance phase. Group/split tables will be added in a later phase.

### `profiles`
```
id (uuid, PK, FK → auth.users.id), display_name (text), created_at (timestamptz)
```

### `categories`
```
id (uuid, PK), user_id (uuid, FK → profiles.id), name (text), created_at (timestamptz)
```
> User-owned. Pre-seeded with defaults on first login: Food, Transport, Utilities, Entertainment, Health, Shopping, Other. Users can add custom categories or delete any of them. Spend per category is computed from transactions — not stored here.

### `transactions`
```
id (uuid, PK), user_id (uuid, FK → profiles.id), type (text — 'expense'|'income'),
name (text), description (text, nullable), amount (decimal), date (date — defaults to today),
category_id (uuid, FK → categories.id, nullable), created_at (timestamptz)
```
> A `group_id` column will be added in the groups phase to support group transactions.
> Recurring transactions are detected dynamically (transactions sharing the same `name` + `amount` with `COUNT > 1`) — no stored flag.

### `widgets`
```
id (uuid, PK), user_id (uuid, FK → profiles.id), type (text), pos_x (int), pos_y (int),
w (int), h (int), created_at (timestamptz)
```
> One row per widget on the user's 12-column snap grid. `type` is one of: `total_balance`, `total_income`, `total_expenses`, `spending_summary`, `category_breakdown`, `recent_transactions`, `group_debts`.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `SUPABASE_URL` | Used to fetch the JWKS public key and call Supabase Auth API |
| `SUPABASE_JWT_SECRET` | Loaded by config but not currently used — JWKS-based verification is used instead |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:5173`) |
| `APP_ENV` | `production` enables `Secure` flag on cookies (default: `development`) |
| `PORT` | Server port (default: `8080`) |
