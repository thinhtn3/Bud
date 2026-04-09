import type { GroupBalances } from '../../types'
import { splitStyles } from './splitStyles'

interface Props {
  balances: GroupBalances
  currentUserId: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n))
}

export default function BalancesPanel({ balances, currentUserId }: Props) {
  const { net_balances, settlements } = balances

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
      <style>{splitStyles}</style>

      <div>
        <div className="split-section-header">Net balances</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {net_balances.length === 0 && (
            <div style={{ fontSize: 13, color: 'rgba(247,248,248,0.35)', padding: '12px 0' }}>
              No expenses yet.
            </div>
          )}
          {net_balances.map(m => (
            <div key={m.user_id} className={`split-balance-row${m.user_id === currentUserId ? ' is-you' : ''}`}>
              <span className="split-balance-name">
                {m.display_name || 'Unknown'}
                {m.user_id === currentUserId && <span className="split-you-badge">You</span>}
              </span>
              <span className={`split-balance-amount ${balanceClass(m.balance)}`}>
                {balanceLabel(m.balance)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="split-section-header">Suggested settlements</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {settlements.length === 0 && (
            <div style={{ fontSize: 13, color: 'rgba(247,248,248,0.35)', padding: '12px 0' }}>
              Everyone is settled up.
            </div>
          )}
          {settlements.map((s, i) => {
            const involvesYou = s.from_user_id === currentUserId || s.to_user_id === currentUserId
            return (
              <div key={i} className={`split-settlement-row${involvesYou ? ' involves-you' : ''}`}>
                <span className="split-settlement-from">{s.from_display_name || 'Unknown'}</span>
                <span style={{ color: 'rgba(247,248,248,0.35)' }}>pays</span>
                <span className="split-settlement-to">{s.to_display_name || 'Unknown'}</span>
                <span className="split-settlement-amount">{fmt(s.amount)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
