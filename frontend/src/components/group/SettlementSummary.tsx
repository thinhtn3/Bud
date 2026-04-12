import { useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import type { Settlement, SettlementRecord } from '../../types'
import { groupStyles } from './groupStyles'

interface Props {
  settlements: Settlement[]
  currentUserId: string
  groupId: string
  onSettled: (record: SettlementRecord) => void
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function initial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? '?'
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface SettleModalProps {
  toDisplayName: string
  toUserID: string
  defaultAmount: number
  groupId: string
  pardon?: boolean
  onSettled: (record: SettlementRecord) => void
  onClose: () => void
}

function SettleModal({ toDisplayName, toUserID, defaultAmount, groupId, pardon, onSettled, onClose }: SettleModalProps) {
  const [amount, setAmount] = useState(defaultAmount.toFixed(2))
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
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
        ...(note.trim() ? { note: note.trim() } : {}),
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
                  autoFocus
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
              <label className="group-label">Note (optional)</label>
              <input
                className="group-input"
                placeholder="e.g. Venmo'd, Cash at dinner…"
                value={note}
                onChange={e => setNote(e.target.value)}
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

export default function SettlementSummary({ settlements, currentUserId, groupId, onSettled }: Props) {
  const [settling, setSettling] = useState<Settlement | null>(null)
  const [pardoning, setPardoning] = useState<Settlement | null>(null)

  const youOweCount = settlements.filter(s => s.from_user_id === currentUserId).length
  const totalOutstanding = settlements.reduce((sum, s) => sum + s.amount, 0)
  const youOweTotal = settlements
    .filter(s => s.from_user_id === currentUserId)
    .reduce((sum, s) => sum + s.amount, 0)
  const youAreOwedTotal = settlements
    .filter(s => s.to_user_id === currentUserId)
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="gss-card">
      <style>{groupStyles}</style>
      <div className="gss-header">
        <span className="gss-title">{settlements.length > 0 ? 'Outstanding' : 'Settlements'}</span>
        {settlements.length > 0 && <span className="gss-count">{settlements.length}</span>}
        {settlements.length > 0 && youOweCount > 0 && (
          <span className="gss-you-owe-badge">You owe {youOweCount === 1 ? '1 payment' : `${youOweCount} payments`}</span>
        )}
        {settlements.length === 0 && (
          <span className="gss-settled-badge">All settled up</span>
        )}
      </div>
      {settlements.length > 0 ? (
        <>
          <div className="gss-rows">
            {settlements.map((s, i) => {
              const youOwe = s.from_user_id === currentUserId
              const owedToYou = s.to_user_id === currentUserId
              const rowClass = `gss-row${youOwe ? ' you-owe' : owedToYou ? ' owed-to-you' : ''}`

              return (
                <div key={i} className={rowClass}>
                  <div className="gss-party">
                    <div className={`gss-avatar${youOwe ? ' you' : ''}`}>
                      {youOwe ? 'You' : initial(s.from_display_name)}
                    </div>
                    <span className="gss-name">
                      {youOwe ? 'You' : s.from_display_name}
                    </span>
                  </div>

                  <div className="gss-arrow">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 7h10M8 3l4 4-4 4"/>
                    </svg>
                  </div>

                  <div className="gss-party">
                    <div className={`gss-avatar${owedToYou ? ' you' : ''}`}>
                      {owedToYou ? 'You' : initial(s.to_display_name)}
                    </div>
                    <span className="gss-name">
                      {owedToYou ? 'You' : s.to_display_name}
                    </span>
                  </div>

                  <span className="gss-amount">{fmt(s.amount)}</span>

                  {youOwe && (
                    <button
                      className="gss-settle-btn"
                      onClick={() => setSettling(s)}
                    >
                      Settle up
                    </button>
                  )}
                  {owedToYou && (
                    <button
                      className="gss-pardon-btn"
                      onClick={() => setPardoning(s)}
                    >
                      Pardon
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="gss-footer">
            <div className="gss-stat">
              <span className="gss-stat-label">Total outstanding</span>
              <span className="gss-stat-value">{fmt(totalOutstanding)}</span>
            </div>
            <div className="gss-stat-divider" />
            <div className="gss-stat gss-stat-center">
              <span className="gss-stat-label">You owe</span>
              <span className={`gss-stat-value${youOweTotal > 0 ? ' gss-stat-owe' : ''}`}>
                {youOweTotal > 0 ? fmt(youOweTotal) : '—'}
              </span>
            </div>
            <div className="gss-stat-divider" />
            <div className="gss-stat">
              <span className="gss-stat-label">You are owed</span>
              <span className={`gss-stat-value${youAreOwedTotal > 0 ? ' gss-stat-owed' : ''}`}>
                {youAreOwedTotal > 0 ? fmt(youAreOwedTotal) : '—'}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="gss-settled-state">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#9fe870" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8.5" opacity="0.25" />
            <path d="M6.5 10.5l2.5 2.5 5-5" />
          </svg>
          <span>No outstanding balances — everyone is even.</span>
        </div>
      )}

      {settling && (
        <SettleModal
          toDisplayName={settling.to_display_name}
          toUserID={settling.to_user_id}
          defaultAmount={settling.amount}
          groupId={groupId}
          onSettled={record => { onSettled(record); setSettling(null) }}
          onClose={() => setSettling(null)}
        />
      )}

      {pardoning && (
        <SettleModal
          toDisplayName={pardoning.from_display_name}
          toUserID={pardoning.from_user_id}
          defaultAmount={pardoning.amount}
          groupId={groupId}
          pardon
          onSettled={record => { onSettled(record); setPardoning(null) }}
          onClose={() => setPardoning(null)}
        />
      )}
    </div>
  )
}
