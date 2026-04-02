# Budget App — MVP Proposal (Revised)

## Overview

A minimalist personal and shared budgeting app. Users can track their own spending and join groups to split bills and track shared finances. The core design principle is **clarity over complexity** — every interaction should be fast, obvious, and uncluttered.

---

## Core MVP Features

### 1. Authentication
- Email/password signup and login via **Supabase Auth**
- Session managed by Supabase JS SDK on the frontend
- Go backend validates Supabase-issued JWTs on every protected request

### 2. Personal Finance Tracking
- Add, edit, delete transactions manually
- Categorise transactions (Food, Transport, Utilities, Entertainment, Other)
- View personal transaction history with simple filters (by date, by category)
- Running balance display on the dashboard

### 3. Groups
- Create a group (name, optional description)
- Invite members by email
- Accept/decline group invitations
- Leave a group

**Group settings (set at creation, editable by creator):**

| Setting | Default | Description |
|---|---|---|
| Split bills | On | Members can split transactions within the group |
| Shared transaction visibility | Off (toggle) | When on, all members see each other's transactions added to the group |

> If visibility is off, members only see their own transactions and the splits they are part of.

### 4. Group Transactions & Bill Splitting
- Add a transaction to a group (who paid, total amount, category, note)
- Split the transaction: equal split (default), or custom amounts per member
- The person who paid is recorded as the "payer" — others owe them their share
- Splits update the debt ledger immediately on submission

### 5. Smart Debt Tracking (Net Settlement)

Each pair of users within a group has a single net debt value. Rather than tracking every individual split, the system **nets debts against each other** so the balance reflects the minimum anyone actually owes.

**How it works:**

For any pair `(A, B)` in a group, one number is stored: the net amount A owes B (negative means B owes A).

When a split is recorded:
1. Identify the payer and each participant's share
2. For each non-payer participant, calculate: `their_share = split_amount`
3. Update the net debt: `debt[participant → payer] += their_share`
4. If the resulting debt crosses zero (i.e. payer now owes participant), the direction flips automatically

**Example walkthrough:**

```
Initial state:  A owes B $100

A pays a $50 dinner for A and B (equal split → B's share = $25)
→ B owes A $25
→ Net: A's $100 debt minus B's $25 credit = A owes B $75

Result: A owes B $75
```

**Settle up:** Either member can mark the debt as settled (full or partial payment recorded outside the app for MVP).

---

## Data Models

> Supabase Auth owns the `auth.users` table. The app references users by their Supabase UUID.

### profiles
```
id (uuid, FK → auth.users.id), display_name, created_at
```

### groups
```
id, name, description, creator_id (uuid), visibility_enabled (bool), split_enabled (bool), created_at
```

### group_members
```
id, group_id, user_id (uuid), role (owner|member), status (invited|active|left), joined_at
```

### transactions
```
id, user_id (uuid), group_id (nullable — null = personal), amount, category, note, paid_at, created_at
```
> A transaction with a `group_id` is a group transaction. Without one, it's personal.

### transaction_splits
```
id, transaction_id, participant_user_id (uuid), amount_owed, settled (bool)
```
> One row per non-payer participant. The payer is identified from the parent transaction's `user_id`.

### group_debts
```
id, group_id, user_a_id (uuid), user_b_id (uuid), net_amount (decimal)
```
> `net_amount > 0` means user_a owes user_b. `net_amount < 0` means user_b owes user_a. One row per unique pair per group.

---

## API Design (Go Backend)

**Framework:** Gin
**ORM:** GORM (pgx driver)
**Database:** Supabase (PostgreSQL — connected via Supabase connection string)
**Auth:** Supabase Auth — Go middleware validates Supabase JWTs

> Auth routes (register, login, refresh) are handled entirely by Supabase. The Go backend only exposes a profile endpoint.

### Endpoints

```
Profile
  GET    /api/me
  PATCH  /api/me

Transactions (personal)
  GET    /api/transactions
  POST   /api/transactions
  PATCH  /api/transactions/:id
  DELETE /api/transactions/:id

Groups
  GET    /api/groups
  POST   /api/groups
  GET    /api/groups/:id
  PATCH  /api/groups/:id
  DELETE /api/groups/:id

Group Members
  POST   /api/groups/:id/invite
  PATCH  /api/groups/:id/members/:userId   (accept/decline/remove)
  DELETE /api/groups/:id/members/me        (leave group)

Group Transactions
  GET    /api/groups/:id/transactions
  POST   /api/groups/:id/transactions      (add + optional split payload)
  PATCH  /api/groups/:id/transactions/:txId
  DELETE /api/groups/:id/transactions/:txId

Debts
  GET    /api/groups/:id/debts             (net debt summary for group)
  POST   /api/groups/:id/debts/settle      (record a settlement)
```

### Split Transaction Payload (POST)

```json
{
  "amount": 50.00,
  "category": "Food",
  "note": "Dinner at Nobu",
  "paid_at": "2025-04-01T19:30:00Z",
  "splits": [
    { "user_id": "uuid-of-B", "amount": 25.00 }
  ]
}
```

> Payer is inferred from the authenticated user. If no `splits` array is provided, the transaction is personal with no debt implication.

---

## Frontend Architecture (React)

**Framework:** React + Vite + TypeScript
**Routing:** React Router v6
**Styling:** Tailwind CSS + shadcn/ui + 21st.dev components
**Auth:** Supabase JS SDK (`@supabase/supabase-js`)

> State management (Zustand) and data fetching (TanStack Query) will be added in a later phase. For MVP, React's built-in state and fetch are sufficient.

### Pages / Routes

```
/login                   Auth screen
/register                Registration
/                        Dashboard — personal spend overview
/transactions            Personal transaction list + add
/groups                  Group list
/groups/new              Create group
/groups/:id              Group detail — transactions + debt summary
/groups/:id/settings     Group settings (visibility, split toggle)
/groups/:id/settle       Settle up flow
```

### Key Components

- `TransactionForm` — shared between personal and group transactions
- `SplitBuilder` — UI for defining how a bill is split (equal or custom)
- `DebtSummary` — card per pair showing net balance and a "settle up" CTA
- `GroupFeed` — transaction list, respects visibility setting

---

## Minimalist UI Principles

- **One primary action per screen.** No cluttered toolbars.
- **Numbers first.** Balances, amounts, and totals are always the largest element on any financial screen.
- **Colour for state only.** Green = you are owed money. Red = you owe money. No decorative colour.
- **Empty states are friendly, not alarming.** "No transactions yet — add your first one" rather than a blank void.
- **No modals for forms.** Slide-in panels or dedicated pages keep focus and avoid z-index chaos.

---

## Build Order

1. **Step 1 — Scaffold:** Init React + Vite, Tailwind, shadcn/ui. Init Go module, install Gin + GORM + pgx.
2. **Step 2 — Supabase setup:** Create project, run migrations, configure RLS, collect env vars.
3. **Step 3 — Auth:** Supabase Auth on frontend (login/register pages). JWT validation middleware in Go.
4. **Step 4 — Personal transactions:** CRUD handlers in Go. Transaction list + form in React.
5. **Step 5 — Groups + invitations:** Group CRUD, invite by email, accept/decline flow.
6. **Step 6 — Bill splitting + debt tracking:** Split builder UI, debt netting logic in Go, settle up flow.

---

## Out of Scope for MVP (Future Roadmap)

| Feature | Notes |
|---|---|
| Real-time updates | WebSocket broadcast when splits are added (gorilla/websocket) |
| Global state management | Zustand for client state |
| Smart data fetching | TanStack Query for caching + background refetch |
| Plaid integration | Bank feed auto-import |
| AI insights | Spend pattern analysis, anomaly detection |
| Custom charts | Monthly breakdowns, category pie charts |
| Recurring transactions | Fixed bills, subscriptions |
| Multi-currency | FX rates and currency selection |
| Push notifications | Mobile alerts for new splits |
| Export (CSV/PDF) | Transaction history export |
| OAuth login | Google / Apple Sign In |

---

## Tech Stack Summary

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast DX, ecosystem maturity |
| Styling | Tailwind CSS + shadcn/ui + 21st.dev | Minimal, polished UI without fighting a component library |
| Backend | Go + Gin | Fast, low overhead, excellent concurrency |
| ORM | GORM (pgx driver) | Pragmatic for relational models, good PostgreSQL support |
| Database | Supabase (PostgreSQL) | Managed Postgres with built-in auth, instant setup |
| Auth | Supabase Auth | No custom auth infra needed for MVP |
| Hosting (suggestion) | Railway or Fly.io | Simple Go + Postgres deploys with free tiers |
