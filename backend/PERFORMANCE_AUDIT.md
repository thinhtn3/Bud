# Performance Audit: Bud Backend

Full codebase audit identifying latency bottlenecks, wasted computation, and production-risk issues.

---

## Critical (Production Risk)

### 1. No database connection pool configuration
**File:** `db/db.go:14-28`
- `stdlib.OpenDB` returns `*sql.DB` but `SetMaxOpenConns`, `SetMaxIdleConns`, `SetConnMaxLifetime` are never called
- Defaults: unlimited open connections (can exhaust DB), only 2 idle connections (constant open/close churn), no lifetime limit
- **Fix:** Extract `*sql.DB` and configure pool (e.g. 25 max open, 10 idle, 5min lifetime, 1min idle time)

### 2. `QueryExecModeSimpleProtocol` disables prepared statements globally
**File:** `db/db.go:20`
- Every query is parsed and planned from scratch by PostgreSQL on every execution
- Set to avoid migration conflicts, but penalizes all runtime queries
- **Fix:** Use simple protocol only during migrations, or switch to `QueryExecModeDescribeExec`

### 3. No HTTP client timeouts on Supabase calls
**Files:** `supabase/client.go:33`, `middleware/auth.go:30`
- Both use `http.DefaultClient` which has zero timeout — can hang indefinitely
- **Fix:** Use `&http.Client{Timeout: 10 * time.Second}`

### 4. `GET /api/transactions` has no pagination
**File:** `handlers/transaction.go:206`
- Returns ALL user transactions with only optional date/type/category filters, no LIMIT
- Memory and response size grow unbounded with user activity
- **Fix:** Add cursor-based or offset pagination with a default limit

### 5. `GetBalances` loads entire group history into memory
**File:** `handlers/group.go:777-790`
- Fetches ALL expenses, ALL splits, ALL settlements for a group to compute net balances
- Could be a single SQL `SUM()` aggregation returning only net balance per member
- **Fix:** Replace with SQL aggregation query

---

## High Impact

### 6. Missing indexes on foreign key columns
PostgreSQL does NOT auto-index FK columns. These need indexes:
- `transactions.category_id` — filtered in List handler
- `transactions.card_alias_id` — FK cascade deletes
- `transactions.group_expense_id` — FK cascade deletes
- `transactions.group_settlement_id` — DELETE WHERE clause
- `group_expenses.paid_by`
- `group_expense_splits.user_id`
- `group_settlements.from_user_id`
- `group_settlements.to_user_id`
- Missing composite index `(user_id, name, type)` for QuickAdd GROUP BY
- Missing composite index `(user_id, type)` for transaction type filtering

### 7. `LOWER(invite_code)` bypasses B-tree index
**File:** `handlers/group.go:357`
- `WHERE LOWER(invite_code) = LOWER(?)` cannot use the existing unique index on `invite_code`
- **Fix:** Store codes lowercased, or create a functional index on `LOWER(invite_code)`

### 8. N+1 query in `QuickAdd`
**File:** `handlers/transaction.go:89-96`
- Loop executes 1 query per recurring (name, type) pair (up to 5 queries)
- **Fix:** Single query with `DISTINCT ON (name, type)` or window function

### 9. Redundant `isMember`/`requireMember` calls across group endpoints
**Files:** `handlers/group.go:415-432` (CreateExpense), `:641-671` (CreateSettlement), `:610-622` (DeleteExpense), `:731-743` (DeleteSettlement)
- 2-3 separate membership queries per endpoint when one would suffice
- **Fix:** Fetch all member IDs once and check in-memory, or merge into the main query with a JOIN

### 10. `loadUserData` runs 3 sequential independent DB queries
**File:** `handlers/auth.go:122-157`
- Profile, categories, card aliases fetched sequentially — called on every app load (`GET /api/me`)
- **Fix:** Use `errgroup` to run all 3 concurrently, cutting latency from 3x RTT to 1x RTT

### 11. Wasted `computeSettlements` call
**File:** `handlers/group.go:831-833`
- Result of `computeSettlements()` is immediately overwritten by `computeSettlementsFromNet()`
- All computation (iterating expenses/splits, building net map, sorting, greedy algo) is thrown away
- **Fix:** Remove the dead call on line 831

### 12. No response compression (gzip)
- No gzip middleware configured anywhere
- JSON responses sent uncompressed — 70-80% larger than necessary
- **Fix:** Add `github.com/gin-contrib/gzip` middleware

### 13. System categories never cached
**Files:** `handlers/categories.go:24-31`, `handlers/auth.go:129`
- Immutable system categories (`user_id IS NULL`) queried from DB on every request
- **Fix:** Cache in memory with `sync.Once` at startup

### 14. `CreateGroup` retry logic broken by PG transaction semantics
**File:** `handlers/group.go:321-337`
- After a statement fails inside a PG transaction, the transaction is aborted — retry within the same tx will always fail
- Error type not checked (retries on ANY error, not just unique violation)
- **Fix:** Use a SAVEPOINT, or retry outside the transaction, or use a loop with a new transaction

---

## Medium Impact

### 15. Loop inserts instead of batch
**Files:** `handlers/widget.go:58-65` (widgets), `handlers/group.go:472-480` (expense splits)
- Individual INSERT per iteration — GORM supports `tx.Create(&slice)` for batch insert

### 16. Sorting inside settlement loop is O(n^2 log n)
**Files:** `handlers/group.go:154-156`, `:215-216`
- `sort.Slice` called on every iteration of the greedy settlement algorithm
- **Fix:** Use `container/heap` priority queue for O(n log n) total

### 17. No pagination on group expenses or settlement history
**Files:** `handlers/group.go:523` (ListExpenses), `:790` (GetBalances settlements)
- Both return unbounded result sets

### 18. Slice pre-allocation
**Files:** `handlers/transaction.go:212-216`, `handlers/group.go:557-562`
- Slices grow via append without pre-allocation despite known upper bounds
- **Fix:** `make([]string, 0, len(transactions))`

### 19. JWKS key never refreshed
**File:** `middleware/auth.go:62-65`
- EC public key fetched once at startup, cached forever in closure
- If Supabase rotates its key, all JWTs rejected until restart
- **Fix:** Periodic background refresh with `sync.RWMutex`

### 20. Synchronous migrations on every startup
**Files:** `main.go:15-16`, `db/migrate.go:12-31`
- AutoMigrate (10 models) + seed categories (9 queries) + FK checks (16 queries) = ~35 DB round-trips blocking boot
- **Fix:** Separate migration step in deploy pipeline; only run in development

### 21. `jwt.MapClaims` uses reflection-based map instead of typed struct
**File:** `middleware/auth.go:74-98`
- `jwt.ParseWithClaims` with a typed struct avoids map lookups and type assertions per request

### 22. No structured/leveled logging
- All files use `log` stdlib — no level differentiation, no JSON output
- `gin.Default()` attaches unstructured logger middleware to every request
- **Fix:** Use `slog` or `zerolog` with leveled output; use `gin.New()` in production

### 23. `GetBalances` makes 5 sequential DB queries
**File:** `handlers/group.go:769-855`
- Expenses, splits, settlements, member IDs, and name map — all independent, all sequential
- **Fix:** Run concurrently with `errgroup` (in addition to the SQL aggregation fix in #5)

### 24. `ListExpenses` makes 4+ sequential queries
**File:** `handlers/group.go:514-602`
- Membership check, expenses, splits, name map, category names — partially parallelizable

### 25. `DeleteExpense` fetches group unconditionally
**File:** `handlers/group.go:620-624`
- Group is fetched even when `expense.PaidBy == userID` makes it unnecessary
- **Fix:** Only fetch group when needed: `if expense.PaidBy != userID { fetch group }`

---

## Verification Checklist
After implementing fixes:
- [ ] `go build ./...` compiles cleanly
- [ ] `go test ./...` passes (if tests exist)
- [ ] Key endpoints respond correctly: `GET /api/me`, `GET /api/transactions`, `GET /api/groups/:id/balances`
- [ ] DB pool config verified via `SELECT count(*) FROM pg_stat_activity` under load
- [ ] Response sizes reduced with gzip
- [ ] Pagination works with `?limit=20&offset=0` or cursor params
