import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { User } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { GroupMember, GroupExpense } from '../../types'
import { Dropdown } from '@/components/ui/Dropdown'
import { CategoryDropdown } from '@/components/widgets/CategoryDropdown'
import { CardAliasDropdown } from '@/components/widgets/CardAliasDropdown'
import { groupStyles } from './groupStyles'

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
  const { user } = useAuth()
  const defaultCard = user?.preferences?.default_card_alias_id ?? ''
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [categoryId, setCategoryId] = useState('')
  const [cardAliasId, setCardAliasId] = useState(defaultCard)
  const [description, setDescription] = useState('')
  const [splits, setSplits] = useState<SplitRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [splitMode, setSplitMode] = useState<'even' | 'custom'>('even')
  const [involved, setInvolved] = useState<Record<string, boolean>>({})

  // Init involved state when modal opens
  useEffect(() => {
    if (!open) return
    const init: Record<string, boolean> = {}
    for (const m of members) init[m.user_id] = true
    setInvolved(init)
    setSplitMode('even')
  }, [open, members])

  // Recalculate even split whenever amount or involved set changes (even mode only)
  useEffect(() => {
    if (!open || splitMode !== 'even') return
    const amt = parseFloat(amount) || 0
    const involvedMembers = members.filter(m => involved[m.user_id])
    const evens = evenSplit(amt, involvedMembers.length)
    setSplits(members.map(m => {
      if (!involved[m.user_id]) {
        return { user_id: m.user_id, display_name: m.display_name, amount: '0.00' }
      }
      const idx = involvedMembers.findIndex(im => im.user_id === m.user_id)
      return { user_id: m.user_id, display_name: m.display_name, amount: evens[idx]?.toFixed(2) ?? '0.00' }
    }))
  }, [amount, involved, splitMode, open, members])

  function toggleInvolved(userId: string) {
    setInvolved(prev => {
      const next = { ...prev, [userId]: !prev[userId] }
      // In custom mode, zero out the unchecked member's split immediately
      if (splitMode === 'custom' && !next[userId]) {
        setSplits(s => s.map(r => r.user_id === userId ? { ...r, amount: '0.00' } : r))
      }
      return next
    })
  }

  useEffect(() => {
    if (paidBy !== currentUserId) setCardAliasId('')
  }, [paidBy, currentUserId])

  function switchMode(mode: 'even' | 'custom') {
    setSplitMode(mode)
    // Switching to even recalculates immediately via the useEffect
  }

  function updateSplit(userId: string, val: string) {
    setSplits(prev => prev.map(s => s.user_id === userId ? { ...s, amount: val } : s))
  }

  const involvedSplits = splits.filter(s => involved[s.user_id])
  const totalSplit = involvedSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
  const expenseAmt = parseFloat(amount) || 0
  const splitOk = involvedSplits.length > 0 && Math.abs(totalSplit - expenseAmt) < 0.01

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
        card_alias_id: cardAliasId || null,
        description: description.trim() || null,
        splits: involvedSplits.map(s => ({ user_id: s.user_id, amount: parseFloat(s.amount) || 0 })),
      })
      setName(''); setAmount(''); setDate(today()); setCategoryId(''); setCardAliasId(defaultCard); setDescription('')
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
        <div className="group-modal group-root expense-modal" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit} className="expense-form-wrap">
            <div className="group-modal-header">
              <div className="group-modal-title">Add expense</div>
              <button type="button" className="group-modal-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <div className="expense-modal-body">
              <div className="expense-form-grid">
                <div className="group-field">
                  <label className="group-label">Name</label>
                  <input className="group-input" placeholder="e.g. Dinner, Airbnb" value={name}
                    onChange={e => setName(e.target.value)} required autoFocus />
                </div>

                <div className="group-field">
                  <label className="group-label">Amount</label>
                  <input className="group-input" type="number" step="0.01" min="0.01"
                    placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required />
                </div>

                <div className="group-field">
                  <label className="group-label">Date</label>
                  <input className="group-input" type="date" value={date}
                    onChange={e => setDate(e.target.value)} required />
                </div>

                <div className="group-field">
                  <label className="group-label">Category</label>
                  <CategoryDropdown value={categoryId} onChange={setCategoryId} />
                </div>

                <div className="group-field">
                  <label className="group-label">Paid by</label>
                  <Dropdown
                    value={paidBy}
                    onChange={setPaidBy}
                    options={members.map(m => ({
                      value: m.user_id,
                      label: `${m.display_name}${m.user_id === currentUserId ? ' (You)' : ''}`,
                      icon: <User size={13} />,
                    }))}
                  />
                </div>

                {paidBy === currentUserId && (
                  <div className="group-field">
                    <label className="group-label">Card</label>
                    <CardAliasDropdown value={cardAliasId} onChange={setCardAliasId} />
                  </div>
                )}

                <div className="group-field note-field-mobile-hide">
                  <label className="group-label">Note</label>
                  <input className="group-input" placeholder="Optional" value={description}
                    onChange={e => setDescription(e.target.value)} />
                </div>
              </div>

              {/* Split section */}
              <div className="group-field" style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="group-label" style={{ margin: 0 }}>Split</label>
                  <div className="split-mode-toggle">
                    <button
                      type="button"
                      className={`split-mode-btn${splitMode === 'even' ? ' active' : ''}`}
                      onClick={() => switchMode('even')}
                    >
                      Even
                    </button>
                    <button
                      type="button"
                      className={`split-mode-btn${splitMode === 'custom' ? ' active' : ''}`}
                      onClick={() => switchMode('custom')}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                <div className="group-amount-grid">
                  {splits.map(s => {
                    const isInvolved = involved[s.user_id]
                    const isEven = splitMode === 'even'
                    return (
                      <div
                        key={s.user_id}
                        className="group-amount-row"
                        style={{ opacity: isInvolved ? 1 : 0.38, transition: 'opacity 0.15s' }}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          className={`split-checkbox${isInvolved ? ' checked' : ''}`}
                          onClick={() => toggleInvolved(s.user_id)}
                          aria-label={isInvolved ? 'Exclude from split' : 'Include in split'}
                        >
                          {isInvolved && (
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1.5 4.5l2 2 4-4" />
                            </svg>
                          )}
                        </button>

                        <span className="group-amount-name" onClick={() => toggleInvolved(s.user_id)} style={{ cursor: 'pointer' }}>
                          {s.display_name}{s.user_id === currentUserId ? ' (You)' : ''}
                        </span>

                        <input
                          className="group-amount-input"
                          type="number"
                          step="0.01"
                          min="0"
                          value={s.amount}
                          readOnly={isEven || !isInvolved}
                          disabled={!isInvolved}
                          onChange={e => updateSplit(s.user_id, e.target.value)}
                          style={{ opacity: isEven ? 0.6 : 1 }}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className={`group-sum-indicator ${splitOk ? 'ok' : 'error'}`} style={{ marginTop: 8 }}>
                  <span>Total splits</span>
                  <span>
                    ${totalSplit.toFixed(2)} / ${expenseAmt.toFixed(2)}
                    {splitOk ? ' ✓' : involvedSplits.length === 0 ? ' — select at least one member' : ' — must match'}
                  </span>
                </div>
              </div>

              {error && <div className="group-error">{error}</div>}
            </div>

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
