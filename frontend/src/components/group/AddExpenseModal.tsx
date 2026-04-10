import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import type { GroupMember, GroupExpense } from '../../types'
import { groupStyles } from './groupStyles'

interface Category {
  id: string
  name: string
}

interface SplitRow {
  user_id: string
  display_name: string
  amount: string
}

interface Props {
  open: boolean
  onClose: () => void
  members: GroupMember[]
  groupId: string
  currentUserId: string
  onAdded: (expense: GroupExpense) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function evenSplit(amount: number, memberCount: number): number[] {
  if (memberCount === 0) return []
  const base = Math.floor((amount * 100) / memberCount) / 100
  const remainder = Math.round((amount - base * memberCount) * 100) / 100
  const splits = Array(memberCount).fill(base)
  splits[0] = Math.round((splits[0] + remainder) * 100) / 100
  return splits
}

export default function AddExpenseModal({ open, onClose, members, groupId, currentUserId, onAdded }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [splits, setSplits] = useState<SplitRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch system categories once on first open
  useEffect(() => {
    if (!open || categories.length > 0) return
    api.get<Category[]>('/api/categories').then(setCategories).catch(() => {})
  }, [open])

  // Init splits whenever members or amount changes
  useEffect(() => {
    if (!open) return
    const amt = parseFloat(amount) || 0
    const evens = evenSplit(amt, members.length)
    setSplits(members.map((m, i) => ({
      user_id: m.user_id,
      display_name: m.display_name,
      amount: evens[i]?.toFixed(2) ?? '0.00',
    })))
  }, [open, members])

  function recalcEvenSplit() {
    const amt = parseFloat(amount) || 0
    const evens = evenSplit(amt, members.length)
    setSplits(prev => prev.map((s, i) => ({ ...s, amount: evens[i]?.toFixed(2) ?? '0.00' })))
  }

  function updateSplit(userId: string, val: string) {
    setSplits(prev => prev.map(s => s.user_id === userId ? { ...s, amount: val } : s))
  }

  const totalSplit = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
  const expenseAmt = parseFloat(amount) || 0
  const splitOk = Math.abs(totalSplit - expenseAmt) < 0.01

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!splitOk) return
    setError('')
    setLoading(true)
    try {
      const expense = await api.post<GroupExpense>(`/api/groups/${groupId}/expenses`, {
        name: name.trim(),
        amount: expenseAmt,
        date,
        paid_by: paidBy,
        category_id: categoryId || null,
        description: description.trim() || null,
        splits: splits.map(s => ({ user_id: s.user_id, amount: parseFloat(s.amount) || 0 })),
      })
      setName(''); setAmount(''); setDate(today()); setCategoryId(''); setDescription('')
      onAdded(expense)
    } catch {
      setError('Could not add expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      <style>{groupStyles}</style>
      <div className="group-modal-overlay" onClick={onClose}>
        <div className="group-modal group-root" onClick={e => e.stopPropagation()}>
          <div className="group-modal-title">Add expense</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div className="group-field">
              <label className="group-label">Name</label>
              <input className="group-input" placeholder="e.g. Dinner, Airbnb" value={name}
                onChange={e => setName(e.target.value)} required autoFocus />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="group-field">
                <label className="group-label">Amount</label>
                <input className="group-input" type="number" step="0.01" min="0.01"
                  placeholder="0.00" value={amount}
                  onChange={e => { setAmount(e.target.value) }}
                  onBlur={recalcEvenSplit}
                  required />
              </div>
              <div className="group-field">
                <label className="group-label">Date</label>
                <input className="group-input" type="date" value={date}
                  onChange={e => setDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="group-field">
                <label className="group-label">Paid by</label>
                <select className="group-select" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.display_name}{m.user_id === currentUserId ? ' (You)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="group-field">
                <label className="group-label">Category</label>
                <select className="group-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">— None —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="group-label" style={{ margin: 0 }}>Split</label>
                <button type="button" className="group-btn-ghost" style={{ padding: '2px 8px' }}
                  onClick={recalcEvenSplit}>
                  Even split
                </button>
              </div>
              <div className="group-amount-grid">
                {splits.map(s => (
                  <div key={s.user_id} className="group-amount-row">
                    <span className="group-amount-name">
                      {s.display_name}{s.user_id === currentUserId ? ' (You)' : ''}
                    </span>
                    <input
                      className="group-amount-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={s.amount}
                      onChange={e => updateSplit(s.user_id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className={`group-sum-indicator ${splitOk ? 'ok' : 'error'}`}
                style={{ marginTop: 8 }}>
                <span>Total splits</span>
                <span>
                  ${totalSplit.toFixed(2)} / ${expenseAmt.toFixed(2)}
                  {splitOk ? ' ✓' : ' — must match'}
                </span>
              </div>
            </div>

            <div className="group-field">
              <label className="group-label">Note (optional)</label>
              <input className="group-input" placeholder="Add a note…" value={description}
                onChange={e => setDescription(e.target.value)} />
            </div>

            {error && <div className="group-error">{error}</div>}

            <div className="group-modal-footer">
              <button type="button" className="group-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="group-btn-primary"
                disabled={loading || !name.trim() || !amount || !splitOk}>
                {loading ? 'Adding…' : 'Add expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
