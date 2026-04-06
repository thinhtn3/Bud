import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Transaction } from '@/types'
import { Dropdown } from '@/components/ui/Dropdown'

interface Props {
  onAdd: (tx: Transaction) => void
}

export function AddTransactionWidget({ onAdd }: Props) {
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
    <div className="bud-widget">
      <p className="bud-widget-label">Add Transaction</p>

      <div className="bud-toggle" data-active={type}>
        <div className="bud-toggle-thumb" />
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            data-value={t}
            onClick={() => setType(t)}
            className="bud-toggle-btn"
          >
            {t}
          </button>
        ))}
      </div>

      <form className="bud-form" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="bud-input"
        />

        <div className="bud-input-row">
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bud-input"
          />
          <input
            required
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bud-input"
          />
        </div>

        <Dropdown
          value={categoryId || undefined}
          onChange={setCategoryId}
          placeholder="No category"
          options={[
            { value: '', label: 'No category' },
            ...(user?.categories ?? []).map(cat => ({
              value: cat.id,
              label: cat.name,
            })),
          ]}
        />

        <input
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="bud-input"
        />

        {error && <p className="bud-error">{error}</p>}

        <button type="submit" disabled={loading} className="bud-submit">
          {loading ? 'Adding…' : type === 'expense' ? 'Add Expense' : 'Add Income'}
        </button>
      </form>
    </div>
  )
}
