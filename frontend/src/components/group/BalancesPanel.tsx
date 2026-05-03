import { useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import type { GroupBalances, SettlementRecord } from '../../types'
import { groupStyles } from './groupStyles'
import { useAuth } from '../../context/AuthContext'
import { CategoryDropdown } from '../widgets/CategoryDropdown'
import { CardAliasDropdown } from '../widgets/CardAliasDropdown'

interface Props {
  balances: GroupBalances
  currentUserId: string
  groupId: string
  groupName: string
  onSettled: (record: SettlementRecord) => void
  onSettlementDeleted: (id: string) => void
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface SettleModalProps {
  toUserID: string
  toDisplayName: string
  defaultAmount: number
  groupId: string
  groupName: string
  pardon?: boolean
  onSettled: (record: SettlementRecord) => void
  onClose: () => void
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function SettleModal({ toUserID, toDisplayName, defaultAmount, groupId, groupName, pardon, onSettled, onClose }: SettleModalProps) {
  const { user } = useAuth()
  const defaultCard = user?.preferences?.default_card_alias_id ?? ''

  const [name, setName] = useState(`Settlement · ${groupName}`)
  const [amount, setAmount] = useState(defaultAmount.toFixed(2))
  const [date, setDate] = useState(todayStr())
  const [categoryId, setCategoryId] = useState('')
  const [cardAliasId, setCardAliasId] = useState(defaultCard)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const record = await api.post<SettlementRecord>(`/api/groups/${groupId}/settlements`, {
        to_user_id: toUserID,
        amount: parseFloat(amount),
        date,
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        card_alias_id: cardAliasId || undefined,
        ...(pardon ? { pardon: true } : {}),
      })
      onSettled(record)
    } catch {
      setError('Could not record settlement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      <style>{groupStyles}</style>
      <div className="group-modal-overlay" onClick={onClose}>
        <div className="group-modal group-root" onClick={e => e.stopPropagation()}>
          <div className="group-modal-title">{pardon ? `Pardon ${toDisplayName}` : `Settle up with ${toDisplayName}`}</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="group-field">
              <label className="group-label">Name</label>
              <input
                className="group-input"
                placeholder="Settlement name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="group-field">
                <label className="group-label">Amount</label>
                <input
                  className="group-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="group-field">
                <label className="group-label">Date</label>
                <input
                  className="group-input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="group-field">
              <label className="group-label">Category</label>
              <CategoryDropdown value={categoryId} onChange={setCategoryId} />
            </div>
            <div className="group-field">
              <label className="group-label">Card</label>
              <CardAliasDropdown value={cardAliasId} onChange={setCardAliasId} />
            </div>
            <div className="group-field">
              <label className="group-label">Description (optional)</label>
              <input
                className="group-input"
                placeholder="Add a description…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            {error && <div className="group-error">{error}</div>}
            <div className="group-modal-footer">
              <button type="button" className="group-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="group-btn-primary" disabled={loading || !amount}>
                {loading ? 'Recording…' : pardon ? 'Confirm pardon' : 'Confirm payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}

interface DeleteSettlementModalProps {
  settlement: SettlementRecord
  groupId: string
  onDeleted: (id: string) => void
  onClose: () => void
}

function DeleteSettlementModal({ settlement, groupId, onDeleted, onClose }: DeleteSettlementModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete(deleteTransactions: boolean) {
    setError('')
    setLoading(true)
    try {
      const url = `/api/groups/${groupId}/settlements/${settlement.id}${deleteTransactions ? '?delete_transactions=true' : ''}`
      await api.delete(url)
      onDeleted(settlement.id)
    } catch {
      setError('Could not delete settlement. Please try again.')
      setLoading(false)
    }
  }

  return createPortal(
    <>
      <style>{groupStyles}</style>
      <div className="group-modal-overlay" onClick={onClose}>
        <div className="group-modal group-root" onClick={e => e.stopPropagation()}>
          <div className="group-modal-title">Delete settlement?</div>
          <div style={{ fontSize: 13, color: 'rgba(247,248,248,0.6)', lineHeight: 1.5 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'rgba(247,248,248,0.85)' }}>{settlement.from_display_name}</span>
              {' paid '}
              <span style={{ fontWeight: 600, color: 'rgba(247,248,248,0.85)' }}>{settlement.to_display_name}</span>
              {' · '}
              <span style={{ fontWeight: 600, color: 'rgba(247,248,248,0.85)' }}>{fmt(settlement.amount)}</span>
              {' · '}
              {formatDate(settlement.date)}
            </div>
            <div>Do you also want to remove the related transaction from your personal dashboard?</div>
          </div>
          {error && <div className="group-error" style={{ marginTop: 8 }}>{error}</div>}
          <div className="group-modal-footer" style={{ flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                className="group-btn-danger"
                style={{ flex: 1 }}
                disabled={loading}
                onClick={() => handleDelete(true)}
              >
                {loading ? '…' : 'Remove from dashboard'}
              </button>
              <button
                className="group-btn-secondary"
                style={{ flex: 1 }}
                disabled={loading}
                onClick={() => handleDelete(false)}
              >
                Keep in my dashboard
              </button>
            </div>
            <button
              type="button"
              className="group-btn-ghost"
              style={{ width: '100%' }}
              disabled={loading}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default function BalancesPanel({ balances, currentUserId, groupId, groupName, onSettled, onSettlementDeleted }: Props) {
  const { net_balances, settlements, history } = balances
  const [settling, setSettling] = useState<{ toUserID: string; toDisplayName: string; amount: number; pardon?: boolean } | null>(null)
  const [deletingSettlement, setDeletingSettlement] = useState<SettlementRecord | null>(null)

  function balanceClass(b: number) {
    if (b > 0.005) return 'positive'
    if (b < -0.005) return 'negative'
    return 'zero'
  }

  function balanceLabel(b: number) {
    if (b > 0.005) return `+${fmt(b)}`
    if (b < -0.005) return `-${fmt(b)}`
    return 'Settled'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{groupStyles}</style>

      {/* Net balances + Suggested settlements side by side */}
      <div className="balances-columns">
        {/* Net balances */}
        <div className="balances-col">
          <div className="group-section-header">Net balances</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {net_balances.length === 0 && (
              <div style={{ fontSize: 13, color: 'rgba(247,248,248,0.35)', padding: '12px 0' }}>No expenses yet.</div>
            )}
            {net_balances.map(m => (
              <div key={m.user_id} className={`group-balance-row${m.user_id === currentUserId ? ' is-you' : ''}`}>
                <span className="group-balance-name">
                  {m.display_name || 'Unknown'}
                  {m.user_id === currentUserId && <span className="group-you-badge">You</span>}
                </span>
                <span className={`group-balance-amount ${balanceClass(m.balance)}`}>
                  {balanceLabel(m.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested settlements */}
        <div className="balances-col">
          <div className="group-section-header">Suggested settlements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {settlements.length === 0 && (
              <div style={{ fontSize: 13, color: 'rgba(247,248,248,0.35)', padding: '12px 0' }}>
                Everyone is settled up.
              </div>
            )}
            {settlements.map((s, i) => {
              const isYou = s.from_user_id === currentUserId
              const owedToYou = s.to_user_id === currentUserId
              return (
                <div key={i} className={`group-settlement-row${isYou || owedToYou ? ' involves-you' : ''}`}>
                  <div className="group-settlement-info">
                    <div className="group-settlement-parties">
                      <span className="group-settlement-from">{s.from_display_name || 'Unknown'}</span>
                      <span className="group-settlement-arrow">→</span>
                      <span className="group-settlement-to">{s.to_display_name || 'Unknown'}</span>
                    </div>
                    <span className="group-settlement-amount">{fmt(s.amount)}</span>
                  </div>
                  {(isYou || owedToYou) && (
                    <div className="group-settlement-actions">
                      {isYou && (
                        <button
                          className="group-btn-primary"
                          onClick={() => setSettling({ toUserID: s.to_user_id, toDisplayName: s.to_display_name, amount: s.amount })}
                        >
                          Settle up
                        </button>
                      )}
                      {owedToYou && (
                        <button
                          className="group-btn-ghost"
                          onClick={() => setSettling({ toUserID: s.from_user_id, toDisplayName: s.from_display_name, amount: s.amount, pardon: true })}
                        >
                          Pardon
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Settlement history */}
      {history.length > 0 && (
        <div>
          <div className="group-section-header">Settlement history</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.map(h => (
              <div key={h.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(247,248,248,0.02)',
                border: '1px solid rgba(247,248,248,0.05)',
                fontSize: 12,
                color: 'rgba(247,248,248,0.5)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: h.from_user_id === currentUserId ? '#ff6b6b' : 'rgba(247,248,248,0.7)' }}>
                      {h.from_display_name}
                    </span>
                    <span>paid</span>
                    <span style={{ fontWeight: 600, color: h.to_user_id === currentUserId ? '#9fe870' : 'rgba(247,248,248,0.7)' }}>
                      {h.to_display_name}
                    </span>
                  </div>
                  {h.note && (
                    <span style={{ fontSize: 11, color: 'rgba(247,248,248,0.3)', fontStyle: 'italic' }}>{h.note}</span>
                  )}
                </div>
                <span style={{ fontWeight: 600, color: 'rgba(247,248,248,0.6)', flexShrink: 0 }}>
                  {fmt(h.amount)}
                </span>
                <span style={{ color: 'rgba(247,248,248,0.25)', flexShrink: 0 }}>{formatDate(h.date)}</span>
                {h.from_user_id === currentUserId && (
                  <button
                    className="group-btn-danger"
                    style={{ fontSize: 11, padding: '3px 10px', flexShrink: 0 }}
                    onClick={() => setDeletingSettlement(h)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {settling && (
        <SettleModal
          toUserID={settling.toUserID}
          toDisplayName={settling.toDisplayName}
          defaultAmount={settling.amount}
          groupId={groupId}
          groupName={groupName}
          pardon={settling.pardon}
          onSettled={record => { onSettled(record); setSettling(null) }}
          onClose={() => setSettling(null)}
        />
      )}

      {deletingSettlement && (
        <DeleteSettlementModal
          settlement={deletingSettlement}
          groupId={groupId}
          onDeleted={id => { onSettlementDeleted(id); setDeletingSettlement(null) }}
          onClose={() => setDeletingSettlement(null)}
        />
      )}
    </div>
  )
}
