import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface Transaction {
  id: string
  type: 'expense' | 'income'
  name: string
  description: string | null
  amount: number
  date: string
  category_id: string | null
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [errorTx, setErrorTx] = useState<string | null>(null)

  useEffect(() => {
    api.get<Transaction[]>('/api/transactions')
      .then(setTransactions)
      .catch(() => setErrorTx('Failed to load transactions'))
      .finally(() => setLoadingTx(false))
  }, [])

  function handleAdd(tx: Transaction) {
    setTransactions(prev => [tx, ...prev])
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{user?.display_name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-input px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AddTransactionWidget onAdd={handleAdd} />
        <RecentTransactionsWidget
          transactions={transactions}
          loading={loadingTx}
          error={errorTx}
        />
      </div>
    </div>
  )
}

// ── Add Transaction Widget ────────────────────────────────────────────────────

function AddTransactionWidget({ onAdd }: { onAdd: (tx: Transaction) => void }) {
  const { user } = useAuth()

  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const tx = await api.post<Transaction>('/api/transactions', {
        type,
        name,
        amount: parseFloat(amount),
        date,
        category_id: categoryId || null,
        description: description || null,
      })
      onAdd(tx)
      setName('')
      setAmount('')
      setDescription('')
      setCategoryId('')
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-base font-medium text-foreground">Add Transaction</h2>

      {/* Type toggle */}
      <div className="mb-4 flex rounded-md border border-input overflow-hidden">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 text-sm font-medium transition-colors capitalize
              ${type === t
                ? t === 'expense'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <input
          required
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">No category</option>
          {user?.categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-colors"
        >
          {loading ? 'Adding…' : 'Add'}
        </button>
      </form>
    </div>
  )
}

// ── Recent Transactions Widget ────────────────────────────────────────────────

function RecentTransactionsWidget({
  transactions,
  loading,
  error,
}: {
  transactions: Transaction[]
  loading: boolean
  error: string | null
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-base font-medium text-foreground">Recent Transactions</h2>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <p className="text-sm text-muted-foreground">No transactions yet — add your first one.</p>
      )}

      <ul className="space-y-2">
        {transactions.map(tx => (
          <li key={tx.id} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">{tx.name}</p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
            <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
              {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
