# Bud Backend — Architecture & API Reference

> Go/Gin REST API backed by PostgreSQL (Supabase-hosted), authenticated via Supabase-issued JWTs.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Components](#components)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [Auth Flow](#auth-flow)
6. [Handler Logic](#handler-logic)
7. [Balance Algorithm](#balance-algorithm)
8. [Database Layer](#database-layer)
9. [Error Handling](#error-handling)
10. [Key Design Decisions](#key-design-decisions)

---

## Project Structure

```
backend/
├── main.go               # Entry point — wires config, DB, JWKS fetch, and routes
├── config/
│   └── config.go         # Env var loading (DB_URL, SUPABASE_URL, SUPABASE_JWT_SECRET, etc.)
├── db/
│   └── migrate.go        # GORM AutoMigrate + manual FK constraint pass on every startup
├── middleware/
│   └── auth.go           # JWT validation via JWKS-fetched ES256 public key; injects userID into Gin context
├── models/
│   ├── profile.go        # Profile, Preferences
│   ├── transaction.go    # Transaction
│   ├── category.go       # Category
│   ├── card_alias.go     # CardAlias
│   ├── widget.go         # Widget
│   └── group.go          # Group, GroupMember, GroupExpense, GroupExpenseSplit, GroupSettlement
├── handlers/
│   ├── auth.go           # SetSession, RefreshSession, DeleteSession
│   ├── profile.go        # GetMe, UpdatePreferences
│   ├── transaction.go    # ListTransactions, CreateTransaction, UpdateTransaction, DeleteTransaction, QuickAdd
│   ├── category.go       # CreateCategory
│   ├── card_alias.go     # ListCards, CreateCard, UpdateCard, DeleteCard
│   ├── widget.go         # GetWidgets, SaveWidgets
│   └── group.go          # All group, expense, balance, and settlement logic
├── routes/
│   └── routes.go         # Registers all routes; applies auth middleware to protected paths
└── supabase/
    └── client.go         # Thin wrapper used only for token refresh (POST /auth/v1/token)
```

---

## Components

| Component | Role |
|---|---|
| **Go/Gin** | HTTP server and routing |
| **GORM + pgx** | ORM layer; pgx runs in `SimpleProtocol` mode to avoid prepared-statement conflicts with GORM's migration introspection |
| **PostgreSQL (Supabase)** | Primary datastore |
| **Supabase Auth** | Issues ECDSA JWTs (ES256); backend fetches public key from `/auth/v1/.well-known/jwks.json` at startup |
| **Auth middleware** | Validates `access_token` HTTP-only cookie on every protected request |
| **Supabase client** | Used exclusively for token refresh — no other Supabase SDK usage |

---

## Data Models

### Profile
```go
type Profile struct {
    UserID               string      // PK — Supabase auth UID
    DisplayName          string
    FinancialGoals       string      // JSON string stored in plain text column (NOT jsonb)
    OnboardingCompleted  bool
    Preferences          Preferences // Stored as embedded JSON
}
```
> `FinancialGoals` is a `text` column containing a JSON string. It is manually marshaled/unmarshaled in every handler that touches it — not a GORM association.

### Transaction
```go
type Transaction struct {
    ID              uuid.UUID
    UserID          string
    Name            string
    Amount          float64
    Type            string    // "expense" | "income" | "reimbursement"
    Date            time.Time
    CategoryID      *uuid.UUID  // nullable FK → categories
    CardAliasID     *uuid.UUID  // nullable FK → card_aliases
    GroupExpenseID  *uuid.UUID  // nullable FK → group_expenses (cascade delete)
    GroupMyShare    *float64    // payer's split amount for group expenses
}
```

### Category
```go
type Category struct {
    ID     uuid.UUID
    UserID *string   // null = system category visible to all users
    Name   string
    Icon   string
    Color  string
}
```

### CardAlias
```go
type CardAlias struct {
    ID          uuid.UUID
    UserID      string
    DisplayName string
    Network     string  // "Visa" | "Mastercard" | "Amex" | "Discover" | etc.
    LastFour    string
}
```

### Widget
```go
type Widget struct {
    ID       uuid.UUID
    UserID   string
    Type     string
    Position int
    Config   string  // JSON blob
}
```

### Group models
```go
type Group struct {
    ID         uuid.UUID
    Name       string
    CreatedBy  string    // user_id
    InviteCode string    // 8-char alphanumeric, unique (generated with math/rand)
}

type GroupMember struct {
    ID        uuid.UUID
    GroupID   uuid.UUID
    UserID    string
    JoinedAt  time.Time
    // UNIQUE(group_id, user_id)
}

type GroupExpense struct {
    ID          uuid.UUID
    GroupID     uuid.UUID
    PaidBy      string    // user_id of payer
    Name        string
    Amount      float64
    Date        time.Time
    Description string
}

type GroupExpenseSplit struct {
    ID        uuid.UUID
    ExpenseID uuid.UUID
    UserID    string
    Amount    float64
}

type GroupSettlement struct {
    ID         uuid.UUID
    GroupID    uuid.UUID
    FromUserID string    // payer
    ToUserID   string    // recipient
    Amount     float64
    Date       time.Time
}
```

---

## API Endpoints

### Auth — no middleware

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/session` | Exchange Supabase tokens for HTTP-only cookies; upserts profile on first login |
| `POST` | `/api/auth/session/refresh` | Reads `refresh_token` cookie, calls Supabase, sets new cookies |
| `DELETE` | `/api/auth/session` | Clears both session cookies |

### Profile & Preferences

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/me` | Returns profile + system/user categories + card aliases + preferences |
| `PUT` | `/api/me/preferences` | Saves all preference fields; sets `onboarding_completed = true` |

### Dashboard Widgets

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/widgets` | Returns ordered widget layout for the caller |
| `PUT` | `/api/dashboard/widgets` | Full replace: deletes all widgets then inserts new set in one DB transaction |

### Categories

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/categories` | Creates a user-owned category |

### Card Aliases

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/cards` | List caller's card aliases |
| `POST` | `/api/cards` | Create card alias |
| `PUT` | `/api/cards/:id` | Full update (ownership enforced via `WHERE id = ? AND user_id = ?`) |
| `DELETE` | `/api/cards/:id` | Delete (ownership enforced) |

### Transactions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/transactions` | List with optional filters: `type`, `category_id`, `from`, `to` (date range) |
| `POST` | `/api/transactions` | Create transaction |
| `PATCH` | `/api/transactions/:id` | Full update (ownership enforced) |
| `DELETE` | `/api/transactions/:id` | Delete (ownership enforced) |
| `GET` | `/api/transactions/quick-add` | Returns recurring transactions (name+type seen >1x) and 5 recent distinct transactions |

### Groups

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/groups` | Groups the caller belongs to, with member counts |
| `POST` | `/api/groups` | Create group + auto-join creator |
| `POST` | `/api/groups/join` | Join by invite code (case-insensitive, idempotent) |
| `GET` | `/api/groups/:id` | Group detail + member list (membership required) |

### Group Expenses

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/groups/:id/expenses` | Expenses with embedded splits and display names |
| `POST` | `/api/groups/:id/expenses` | Create expense + splits + payer's personal transaction — one atomic DB transaction |
| `DELETE` | `/api/groups/:id/expenses/:expenseId` | Payer or group creator only; cascades to payer's personal transaction |

### Group Balances & Settlements

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/groups/:id/balances` | Net balances, suggested settlements (greedy algorithm), settlement history |
| `POST` | `/api/groups/:id/settlements` | Record payment; creates `expense` transaction for payer and `reimbursement` transaction for recipient |

---

## Auth Flow

JWKS public key is fetched from Supabase at server startup and cached in memory. Every protected request runs the auth middleware which verifies the ES256 signature against this key and injects `userID` into the Gin context.

```
Startup:
  GET /auth/v1/.well-known/jwks.json → cache ES256 public key

Login (POST /api/auth/session):
  Receive Supabase tokens from client
  Decode JWT (no re-verification — just arrived from Supabase)
  Upsert profile row
  Set HTTP-only cookies: access_token, refresh_token

Protected request:
  Auth middleware reads access_token cookie
  Verifies ES256 signature with cached public key
  Extracts sub claim → userID
  Injects into Gin context as "userID"
  Handler reads: c.GetString("userID")

Token refresh (POST /api/auth/session/refresh):
  Read refresh_token cookie
  POST /auth/v1/token → Supabase
  Set new HTTP-only cookies
```

> `SUPABASE_JWT_SECRET` is loaded from env but **never used** — JWKS is the live verification path.

---

## Handler Logic

### `CreateExpense` (Group)

1. Verify caller is a group member
2. Verify `paid_by` is a group member
3. Fetch all member IDs; validate every split `user_id` is a member
4. Validate `sum(splits) == expense.amount ±$0.01` (enforced on both backend and frontend)
5. Begin DB transaction:
   - INSERT `group_expenses`
   - INSERT `group_expense_splits` (one row per member)
   - INSERT `transactions` for payer only (`type=expense`, `group_expense_id`, `group_my_share`)
6. Commit

Non-paying members receive no personal `Transaction` row. Their obligation is reflected only in `group_expense_splits` and visible via `/balances`.

### `CreateSettlement`

1. Validate caller ≠ recipient; both are group members
2. Begin DB transaction:
   - INSERT `group_settlements`
   - INSERT `transactions` for payer (`type=expense`, name=`"Settlement · {group.Name}"`)
   - INSERT `transactions` for recipient (`type=reimbursement`, name=`"Settlement · {group.Name}"`)
3. Commit

### `GetBalances`

Runs entirely in Go — no stored procedure, no caching.

```
net[user] = 0 for each member
for each expense:    net[paid_by]   += expense.amount
for each split:      net[user_id]   -= split.amount
for each settlement: net[from_user] += settlement.amount
                     net[to_user]   -= settlement.amount
```

Then calls `computeSettlementsFromNet` (see [Balance Algorithm](#balance-algorithm)).

> `computeSettlements` is also called in this handler but its result is immediately discarded — `computeSettlementsFromNet` is the live path. Likely a refactor artifact.

### `DeleteExpense`

Authorization: caller must be the expense's `paid_by` user **or** the group's `created_by`. The associated payer `Transaction` row is cascade-deleted via the `ON DELETE CASCADE` FK on `group_expense_id`. Settlement transactions are not affected.

### `SaveWidgets` (`PUT /api/dashboard/widgets`)

Full replace only. Deletes all widgets for the user then inserts the new set in one DB transaction. No partial patch.

---

## Balance Algorithm

`computeSettlementsFromNet` uses greedy debt simplification to produce the minimum number of transfers:

1. Separate members into creditors (net > 0) and debtors (net < 0), sorted by magnitude descending.
2. Match the largest creditor with the largest debtor.
3. Emit a transfer for `min(creditor balance, |debtor balance|)`, rounded to 2 decimal places.
4. Reduce both sides by the transfer amount; remove any that reach zero.
5. Repeat until all balances are within epsilon `0.005`.

---

## Database Layer

### Migration

`db/migrate.go` runs on every server startup:

1. `db.AutoMigrate(...)` — creates or updates all tables from model structs
2. `addFKIfNotExists(...)` — checks `pg_constraint` before adding each FK; safe to run repeatedly

### Foreign Keys

| Table | Column | References | On Delete |
|---|---|---|---|
| `transactions` | `category_id` | `categories(id)` | SET NULL |
| `transactions` | `card_alias_id` | `card_aliases(id)` | SET NULL |
| `transactions` | `group_expense_id` | `group_expenses(id)` | CASCADE |
| `group_members` | `group_id` | `groups(id)` | CASCADE |
| `group_members` | `user_id` | `profiles(user_id)` | CASCADE |
| `group_expenses` | `group_id` | `groups(id)` | CASCADE |
| `group_expenses` | `paid_by` | `profiles(user_id)` | CASCADE |
| `group_expense_splits` | `expense_id` | `group_expenses(id)` | CASCADE |
| `group_expense_splits` | `user_id` | `profiles(user_id)` | CASCADE |
| `group_settlements` | `group_id` | `groups(id)` | CASCADE |
| `group_settlements` | `from_user_id` | `profiles(user_id)` | CASCADE |
| `group_settlements` | `to_user_id` | `profiles(user_id)` | CASCADE |

### pgx SimpleProtocol

pgx is configured with `QueryExecModeSimpleProtocol` to prevent prepared-statement conflicts with GORM's migration introspection. This is required and must not be removed.

---

## Error Handling

All errors return a consistent JSON body:

```json
{ "error": "string describing what went wrong" }
```

| Status | Meaning |
|---|---|
| `400` | Validation error (missing field, split mismatch, etc.) |
| `401` | Missing or invalid JWT |
| `403` | Forbidden (explicit permission failure — e.g. non-member accessing group) |
| `404` | Not found **or** resource exists but is not owned by the caller |
| `500` | Database or internal server error |

Ownership is enforced by including `AND user_id = ?` in WHERE clauses. Unauthorized access to another user's resource returns `404` — the resource is indistinguishable from non-existent.

---

## Key Design Decisions

| Decision | Detail |
|---|---|
| JWKS-based auth | `SUPABASE_JWT_SECRET` is loaded but unused. Public key fetched from JWKS at startup and cached. |
| `SetSession` skips verification | Token just arrived from Supabase — verification deferred to middleware on all subsequent calls |
| Ownership returns 404, not 403 | `WHERE id = ? AND user_id = ?` — unauthorized access appears as not found |
| Widget save is full replace | `PUT /api/dashboard/widgets` deletes all then inserts; no partial patch |
| Invite codes use `math/rand` | Cosmetic identifiers only — not security-sensitive |
| `pgx` SimpleProtocol mode | Prevents prepared-statement conflicts with GORM's migration introspection |
| `FinancialGoals` as `text` | Stored as a JSON string in a plain text column; manually marshaled/unmarshaled per handler |
| Settlement creates 2 tx rows | Payer gets `type=expense`, recipient gets `type=reimbursement` — written atomically |
| Balance calc is stateless | Greedy simplification runs in Go on every `GET /balances` — no caching or materialization |
| `computeSettlements` dead code | Called in `GetBalances` but result discarded immediately; likely a refactor artifact |
| Invite code collision retry | `CreateGroup` retries once with a new code on unique-constraint violation |
