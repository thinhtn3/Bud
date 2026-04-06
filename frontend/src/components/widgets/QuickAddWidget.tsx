import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Transaction } from '@/types'

interface QuickAddData {
  recurring: Transaction[]
  recent: Transaction[]
}

interface Props {
  onAdd: (tx: Transaction) => void
}

export function QuickAddWidget({ onAdd }: Props) {
  const { user } = useAuth()
  const [data, setData] = useState<QuickAddData | null>(null)
  const [loading, setLoading] = useState(true)

  // Inline form state — null means no chip selected
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<QuickAddData>('/api/transactions/quick-add')
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  function prefill(tx: Transaction) {
    setSelected(tx)
    setAmount(String(tx.amount))
    setCategoryId(tx.category_id ?? '')
    setDate(new Date().toISOString().split('T')[0])
    setError(null)
  }

  function dismiss() {
    setSelected(null)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError(null)
    setSubmitting(true)
    try {
      const tx = await api.post<Transaction>('/api/transactions', {
        type: selected.type,
        name: selected.name,
        amount: parseFloat(amount),
        date,
        category_id: categoryId || null,
        description: selected.description ?? null,
      })
      onAdd(tx)
      dismiss()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setSubmitting(false)
    }
  }

  const isEmpty = !data || (data.recurring.length === 0 && data.recent.length === 0)

  return (
    <div className="bud-widget">
      <p className="bud-widget-label">Quick Add</p>

      {loading ? (
        <p className="bud-tx-loading">Loading shortcuts…</p>
      ) : isEmpty ? (
        <p className="bud-tx-empty">
          Add a few transactions to unlock one-tap shortcuts here.
        </p>
      ) : (
        <>
          {(data!.recurring.length > 0) && (
            <div className="bud-qa-section">
              <p className="bud-qa-section-label">Recurring</p>
              <div className="bud-qa-chips">
                {data!.recurring.map(tx => (
                  <button
                    key={tx.id}
                    className={`bud-qa-chip bud-qa-chip-${tx.type} ${selected?.id === tx.id ? 'bud-qa-chip-active' : ''}`}
                    onClick={() => selected?.id === tx.id ? dismiss() : prefill(tx)}
                    type="button"
                  >
                    <span className="bud-qa-chip-name">{tx.name}</span>
                    <span className={`bud-qa-chip-amt bud-qa-chip-amt-${tx.type}`}>
                      {tx.type === 'expense' ? '−' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(data!.recent.length > 0) && (
            <div className="bud-qa-section">
              <p className="bud-qa-section-label">Recent</p>
              <div className="bud-qa-chips">
                {data!.recent.map(tx => (
                  <button
                    key={tx.id}
                    className={`bud-qa-chip bud-qa-chip-${tx.type} ${selected?.id === tx.id ? 'bud-qa-chip-active' : ''}`}
                    onClick={() => selected?.id === tx.id ? dismiss() : prefill(tx)}
                    type="button"
                  >
                    <span className="bud-qa-chip-name">{tx.name}</span>
                    <span className={`bud-qa-chip-amt bud-qa-chip-amt-${tx.type}`}>
                      {tx.type === 'expense' ? '−' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected && (
            <form className="bud-qa-form" onSubmit={handleSubmit}>
              <div className="bud-qa-form-header">
                <div className="bud-qa-form-title-row">
                  <span className="bud-qa-form-name">{selected.name}</span>
                  <span className={`bud-qa-form-badge bud-qa-form-badge-${selected.type}`}>
                    {selected.type}
                  </span>
                </div>
                <button type="button" className="bud-qa-dismiss" onClick={dismiss}>✕</button>
              </div>

              <div className="bud-input-row">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="bud-input"
                  placeholder="Amount"
                />
                <input
                  required
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bud-input"
                />
              </div>

              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="bud-select"
              >
                <option value="">No category</option>
                {user?.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {error && <p className="bud-error">{error}</p>}

              <button type="submit" disabled={submitting} className="bud-submit">
                {submitting ? 'Adding…' : `Add ${selected.type === 'expense' ? 'Expense' : 'Income'}`}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
