import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { Transaction } from '@/types'
import { EditTransactionModal } from './EditTransactionModal'
import { getCategoryIcon } from './categoryIcons'

interface Props {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  onUpdate: (updated: Transaction) => void
  onDelete: (id: string) => void
}

export function RecentTransactionsWidget({ transactions, loading, error, onUpdate, onDelete }: Props) {
  const { user } = useAuth()
  const [editing, setEditing] = useState<Transaction | null>(null)

  function getCategoryMeta(categoryId: string | null) {
    if (!categoryId) return null
    const cat = user?.categories.find(c => c.id === categoryId)
    if (!cat) return null
    return { name: cat.name, Icon: getCategoryIcon(cat.name) }
  }

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
            <li
              key={tx.id}
              className="bud-tx-row bud-tx-row-clickable"
              onClick={() => setEditing(tx)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setEditing(tx)}
              aria-label={`Edit ${tx.name}`}
            >
              <div className="bud-tx-left">
                {/* Category icon — falls back to arrow for uncategorised */}
                {(() => {
                  const cat = getCategoryMeta(tx.category_id)
                  const Icon = cat ? cat.Icon : tx.type === 'income' ? ArrowUp : ArrowDown
                  return (
                    <div className={`bud-tx-icon-wrap ${tx.type}`}>
                      <Icon size={14} />
                    </div>
                  )
                })()}
                <div className="bud-tx-meta">
                  <span className="bud-tx-name">{tx.name}</span>
                  <span className="bud-tx-date">
                    {formatDate(tx.date)}
                    {getCategoryMeta(tx.category_id) && ` · ${getCategoryMeta(tx.category_id)!.name}`}
                  </span>
                  {tx.description && (
                    <span className="bud-tx-note">{tx.description}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`bud-tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '−'}${tx.amount.toFixed(2)}
                </span>
                <span className="bud-tx-edit-hint">✎</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditTransactionModal
          transaction={editing}
          onSave={onUpdate}
          onDelete={onDelete}
          onClose={() => setEditing(null)}
        />
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
