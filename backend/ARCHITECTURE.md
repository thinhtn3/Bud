# Backend Architecture

Go + Gin REST API. Connects to Supabase Postgres via GORM. Auth is handled by Supabase — the backend validates Supabase-issued JWTs on every protected request.

## Structure

```
backend/
├── main.go          # Entry point — wires config, DB, and routes
├── config/          # Loads environment variables
├── db/              # Opens and exposes the GORM database connection
├── middleware/      # Gin middleware (JWT auth, CORS)
├── models/          # GORM model definitions
├── handlers/        # Request handlers, one file per resource
└── routes/          # Registers all routes and applies middleware
```

## Package responsibilities

**`config`** — reads `.env` and returns a typed `Config` struct. Any new env var is added here. Nothing else in the codebase touches `os.Getenv` directly.

**`db`** — opens the Postgres connection via GORM and exposes a package-level `DB` variable. Called once at startup.

**`middleware`** — contains the JWT auth middleware. Validates the Supabase-issued Bearer token on each request and sets `userID` on the Gin context for downstream handlers.

**`models`** — GORM struct definitions for each table. No business logic here — just field mappings and table names.

**`handlers`** — one file per resource (e.g. `transactions.go`, `groups.go`). Each handler reads from the Gin context, calls GORM, and writes the JSON response. Business logic (e.g. debt netting) lives here.

**`routes`** — registers route groups, applies middleware, and maps paths to handlers. `main.go` calls a single `routes.Register(r, cfg)` function.

## Request flow

```
HTTP request
  → CORS middleware
  → Auth middleware (validates JWT, sets userID)
  → Handler (reads params, queries DB via GORM)
  → JSON response
```

## Auth

The backend never issues tokens. Supabase Auth handles signup/login. The frontend sends `Authorization: Bearer <supabase_jwt>` on every API call. The auth middleware validates the token using `SUPABASE_JWT_SECRET` and rejects requests with missing or invalid tokens.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `SUPABASE_JWT_SECRET` | Used to verify Supabase JWTs |
| `PORT` | Server port (default: `8080`) |
