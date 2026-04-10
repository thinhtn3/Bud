import { useState } from 'react'
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

export default function SettlementSummary({ settlements, currentUserId, groupId, onSettled }: Props) {
  const [paying, setPaying] = useState<string | null>(null) // to_user_id being paid

  if (settlements.length === 0) return null

  async function settle(s: Settlement) {
    setPaying(s.to_user_id)
    try {
      const record = await api.post<SettlementRecord>(`/api/groups/${groupId}/settlements`, {
        to_user_id: s.to_user_id,
        amount: s.amount,
      })
      onSettled(record)
    } catch {
      // error is silent — balances will stay unchanged, user can retry
    } finally {
      setPaying(null)
    }
  }

  const youOweCount = settlements.filter(s => s.from_user_id === currentUserId).length

  return (
    <div className="gss-card">
      <style>{groupStyles}</style>
      <div className="gss-header">
        <span className="gss-title">Outstanding</span>
        <span className="gss-count">{settlements.length}</span>
        {youOweCount > 0 && (
          <span className="gss-you-owe-badge">You owe {youOweCount === 1 ? '1 payment' : `${youOweCount} payments`}</span>
        )}
      </div>
      <div className="gss-rows">
        {settlements.map((s, i) => {
          const youOwe = s.from_user_id === currentUserId
          const owedToYou = s.to_user_id === currentUserId
          const rowClass = `gss-row${youOwe ? ' you-owe' : owedToYou ? ' owed-to-you' : ''}`
          const isPaying = paying === s.to_user_id

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
                  disabled={isPaying}
                  onClick={() => settle(s)}
                >
                  {isPaying ? '…' : 'Settle up'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
