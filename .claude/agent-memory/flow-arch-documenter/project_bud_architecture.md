---
name: Bud Project Architecture
description: Complete backend reference — tech stack, all tables, all routes, auth flow, and key design decisions for the Bud personal finance app
type: project
---

Go/Gin backend (`/backend`), React + TypeScript frontend (`/frontend/src`).
Auth via Supabase ECDSA JWT (ES256) validated from JWKS, stored as HTTP-only cookies. DB via GORM + PostgreSQL (Supabase-hosted), AutoMigrate + manual FK constraints on startup.

## Key file locations

- Models: `backend/models/` — Profile, Transaction, Category, CardAlias, Widget, Group, GroupMember, GroupExpense, GroupExpenseSplit, GroupSettlement
- Handlers: `backend/handlers/` — one file per resource domain
- Routes: `backend/routes/routes.go` — all API route registration
- Auth middleware: `backend/middleware/auth.go` — fetches JWKS at startup, verifies ES256 on every protected request
- Migration: `backend/db/migrate.go` — AutoMigrate + manual FK via addFKIfNotExists (pg_constraint check)
- Config: `backend/config/config.go` — only place touching os.Getenv; fatal on missing required vars
- Supabase client: `backend/supabase/client.go` — only used for token refresh (POST /auth/v1/token)
- Frontend API client: `frontend/src/lib/api.ts`
- Frontend types: `frontend/src/types/index.ts`
- Split feature page: `frontend/src/pages/SplitPage.tsx` (route: /split)

## Route groups

- `/api/auth/*` — no auth middleware (SetSession, RefreshSession, ClearSession)
- `/api/*` — all other routes require `access_token` cookie, ES256 validated

## All 23 API endpoints

POST /api/auth/session — exchange Supabase tokens for HTTP-only cookies, upsert profile on first login
POST /api/auth/session/refresh — read refresh_token cookie, call Supabase, set new cookies
DELETE /api/auth/session — clear both session cookies
GET /api/me — profile + categories (system + user) + card aliases + preferences
PUT /api/me/preferences — save all preference fields, marks onboarding_completed=true
GET /api/dashboard/widgets — ordered widget layout
PUT /api/dashboard/widgets — full replace of widget layout in one transaction
POST /api/categories — create user-owned category
GET /api/cards — list card aliases
POST /api/cards — create card alias
PUT /api/cards/:id — full update card alias (ownership enforced)
DELETE /api/cards/:id — delete card alias (ownership enforced)
GET /api/transactions — list with optional filters: type, category_id, from, to (date)
POST /api/transactions — create transaction
PATCH /api/transactions/:id — full update transaction (ownership enforced)
DELETE /api/transactions/:id — delete transaction (ownership enforced)
GET /api/transactions/quick-add — recurring (name+type count>1) and 5 recent distinct transactions
GET /api/groups — groups the caller belongs to with member counts
POST /api/groups — create group + auto-join creator (invite code 8-char, math/rand)
POST /api/groups/join — join by invite code (case-insensitive, idempotent)
GET /api/groups/:id — group detail + member list (membership required)
GET /api/groups/:id/expenses — expenses with splits and display names (membership required)
POST /api/groups/:id/expenses — create expense + splits + payer's personal transaction (one atomic DB tx)
DELETE /api/groups/:id/expenses/:expenseId — payer or group creator only; cascades to payer's personal tx
GET /api/groups/:id/balances — net balances, suggested settlements (greedy), history
POST /api/groups/:id/settlements — record payment; creates expense tx for payer and reimbursement tx for recipient

## Key design decisions

1. JWKS-based ES256 verification — SUPABASE_JWT_SECRET is loaded but unused; public key fetched from /auth/v1/.well-known/jwks.json at startup
2. SetSession decodes JWT without verification — token just came from Supabase; verification happens in middleware on all subsequent requests
3. FinancialGoals stored as text column containing JSON string, not JSONB — manually marshaled/unmarshaled in handlers
4. Only payer gets auto-created personal transaction on group expense — non-payers see obligation only via /balances
5. Widget save is full replace (delete all + insert) in a transaction — not a patch
6. Invite codes use math/rand (not crypto/rand) — cosmetic identifiers, not security tokens
7. pgx SimpleProtocol mode set to avoid prepared statement conflicts with GORM migration introspection
8. Ownership enforcement: WHERE id = ? AND user_id = ? → 404 (not 403) for unauthorized resource access

## Balance algorithm

Greedy debt simplification (computeSettlementsFromNet):
net[user] = Σ paid_by - Σ split_amount, then adjusted for past settlements.
Creditors (positive) and debtors (negative) sorted largest-to-largest.
Each iteration transfers min(creditor, debtor), rounded to 2dp. Epsilon 0.005 for float comparison.

## Error handling

All errors: { "error": "string" }. Status codes: 400 validation, 401 auth, 403 forbidden, 404 not found/not owned, 500 DB error.

**Why:** Full backend documented 2026-04-08 from reading every file.
**How to apply:** Use as ground truth when extending any backend feature or writing frontend integrations.
