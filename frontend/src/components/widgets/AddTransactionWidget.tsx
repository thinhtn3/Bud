import { useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import type { Transaction } from '@/types'
import { CategoryDropdown } from '@/components/widgets/CategoryDropdown'
import { CardAliasDropdown } from '@/components/widgets/CardAliasDropdown'

interface Props {
  onAdd: (tx: Transaction) => void
  size?: 'small' | 'medium'
}

export function AddTransactionWidget({ onAdd, size = 'medium' }: Props) {

  const [type, setType] = useState<'expense' | 'reimbursement'>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [cardAliasId, setCardAliasId] = useState('')
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
        card_alias_id: cardAliasId || null,
        description: description || null,
      })
      onAdd(tx)
      setName('')
      setAmount('')
      setDescription('')
      setCategoryId('')
      setCardAliasId('')
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const toggle = (
    <div className="bud-toggle" data-active={type}>
      <div className="bud-toggle-thumb" />
      {(['expense', 'reimbursement'] as const).map(t => (
        <button key={t} type="button" data-value={t} onClick={() => setType(t)} className="bud-toggle-btn">
          {t}
        </button>
      ))}
    </div>
  )

  if (size === 'small') {
    return (
      <div className="bud-widget">
        <p className="bud-widget-label">Add Transaction</p>
        {toggle}
        <form className="bud-form" onSubmit={handleSubmit}>
          <input
            required
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bud-input"
          />
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
          <CategoryDropdown value={categoryId} onChange={setCategoryId} />
          <CardAliasDropdown value={cardAliasId} onChange={setCardAliasId} />
          <input
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="bud-input"
          />
          {error && <p className="bud-error">{error}</p>}
          <button type="submit" disabled={loading} className="bud-submit">
            {loading ? 'Adding…' : type === 'expense' ? 'Add Expense' : 'Add Reimbursement'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bud-widget">
      <p className="bud-widget-label">Add Transaction</p>
      {toggle}
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

        <CategoryDropdown value={categoryId} onChange={setCategoryId} />
        <CardAliasDropdown value={cardAliasId} onChange={setCardAliasId} />

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
