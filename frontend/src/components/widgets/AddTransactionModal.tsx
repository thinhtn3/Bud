import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { Transaction } from '@/types'
import { CategoryDropdown } from '@/components/widgets/CategoryDropdown'
import { CardAliasDropdown } from '@/components/widgets/CardAliasDropdown'

interface Props {
  onAdd: (tx: Transaction) => void
  onClose: () => void
}

type TxType = 'expense' | 'reimbursement' | 'income'

const TYPE_LABELS: Record<TxType, string> = {
  expense: 'Expense',
  reimbursement: 'Reimbursement',
  income: 'Income',
}

export function AddTransactionModal({ onAdd, onClose }: Props) {
  const { user } = useAuth()
  const defaultCard = user?.preferences?.default_card_alias_id ?? ''

  const [type, setType]             = useState<TxType>('expense')
  const [name, setName]             = useState('')
  const [amount, setAmount]         = useState('')
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [cardAliasId, setCardAliasId] = useState(defaultCard)
  const [description, setDescription] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [submitted, setSubmitted]   = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  function handleAddAnother() {
    setName('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId('')
    setCardAliasId(defaultCard)
    setDescription('')
    setError(null)
    setSubmitted(false)
  }

  return createPortal(
    <div className="bud-modal-overlay" onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bud-modal" role="dialog" aria-modal="true" aria-label="Add transaction">

        <div className="bud-modal-header">
          <p className="bud-modal-title">Add Transaction</p>
          <button className="bud-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {submitted ? (
          <div className="bud-add-success">
            <div className="bud-add-success-check">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#9fe870" strokeWidth="1.5"/>
                <path d="M6.5 11l3 3 6-6" stroke="#9fe870" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="bud-add-success-label">Transaction added</p>
            <div className="bud-modal-actions">
              <button className="bud-modal-save" onClick={handleAddAnother}>
                Add Another
              </button>
              <button className="bud-modal-secondary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bud-toggle bud-toggle--three" data-active={type} style={{ marginBottom: 18 }}>
              <div className="bud-toggle-thumb" />
              {(['expense', 'reimbursement', 'income'] as const).map(t => (
                <button key={t} type="button" data-value={t} onClick={() => setType(t)} className="bud-toggle-btn">
                  {TYPE_LABELS[t]}
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
                autoFocus
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
              <div className="bud-modal-actions">
                <button type="submit" disabled={loading} className="bud-modal-save">
                  {loading ? 'Adding…' : `Add ${TYPE_LABELS[type]}`}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>,
    document.body,
  )
}
