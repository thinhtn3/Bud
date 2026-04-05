import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  loading: boolean
  error: string | null
}

export function RecentTransactionsWidget({ transactions, loading, error }: Props) {
  return (
    <div className="bud-widget">
      <div className="bud-widget-header">
        <p className="bud-widget-label" style={{ marginBottom: 0 }}>Recent Transactions</p>
        {!loading && !error && transactions.length > 0 && (
          <span className="bud-count-badge">{transactions.length}</span>
        )}
      </div>

      {loading && <p className="bud-tx-loading">Loading…</p>}
      {error && <p className="bud-error">{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <p className="bud-tx-empty">No transactions yet — add your first one.</p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <ul className="bud-tx-list">
          {transactions.map(tx => (
            <li key={tx.id} className="bud-tx-row">
              <div className="bud-tx-left">
                <span className={`bud-tx-dot ${tx.type}`} />
                <div className="bud-tx-meta">
                  <span className="bud-tx-name">{tx.name}</span>
                  <span className="bud-tx-date">{formatDate(tx.date)}</span>
                </div>
              </div>
              <span className={`bud-tx-amount ${tx.type}`}>
                {tx.type === 'income' ? '+' : '−'}${tx.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
