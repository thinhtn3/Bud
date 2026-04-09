import { useState } from 'react'
import { parseLocalDate } from '@/lib/dateUtils'
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
        <ul
          className="bud-tx-list"
          onWheel={e => e.stopPropagation()}
        >
          {groupByDate(transactions).flatMap(({ dateKey, label, txs }) => [
            <li key={`heading-${dateKey}`} className="bud-tx-date-heading">{label}</li>,
            ...txs.map(tx => (
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
                  {(() => {
                    const cat = getCategoryMeta(tx.category_id)
                    const Icon = cat ? cat.Icon : (tx.type === 'income' || tx.type === 'reimbursement') ? ArrowUp : ArrowDown
                    return (
                      <div className={`bud-tx-icon-wrap ${tx.type}`}>
                        <Icon size={14} />
                      </div>
                    )
                  })()}
                  <div className="bud-tx-meta">
                    <span className="bud-tx-name">
                      {tx.name}
                      {tx.group_expense_id && (
                        <span style={{
                          marginLeft: 6,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: 'rgba(159,232,112,0.12)',
                          color: '#9fe870',
                          verticalAlign: 'middle',
                          letterSpacing: '0.04em',
                        }}>GROUP</span>
                      )}
                    </span>
                    {(getCategoryMeta(tx.category_id) || tx.description) && (
                      <span className="bud-tx-date">
                        {getCategoryMeta(tx.category_id)?.name}
                      </span>
                    )}
                    {tx.description && (
                      <span className="bud-tx-note">{tx.description}</span>
                    )}
                    {tx.group_expense_id && tx.group_my_share != null && (
                      <span className="bud-tx-note" style={{ color: 'rgba(247,248,248,0.45)' }}>
                        Your share: ${tx.group_my_share.toFixed(2)}
                        {tx.group_reimbursements && tx.group_reimbursements.length > 0 && (
                          <> · Awaiting: {tx.group_reimbursements.map(r =>
                            `${r.display_name} ($${r.amount.toFixed(2)})`
                          ).join(', ')}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`bud-tx-amount ${tx.type}`}>
                      {tx.type === 'income' || tx.type === 'reimbursement' ? '+' : '−'}${tx.amount.toFixed(2)}
                    </span>
                    {tx.group_expense_id && tx.group_my_share != null && tx.amount !== tx.group_my_share && (
                      <div style={{ fontSize: 10, color: 'rgba(247,248,248,0.35)', marginTop: 1 }}>
                        net −${tx.group_my_share.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <span className="bud-tx-edit-hint">✎</span>
                </div>
              </li>
            )),
          ])}
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

function getDateKey(dateStr: string): string {
  // Normalize to YYYY-MM-DD regardless of backend format
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
}

function formatDateLabel(dateStr: string): string {
  const key = getDateKey(dateStr)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  if (key === todayKey) return 'Today'
  if (key === yesterdayKey) return 'Yesterday'
  return parseLocalDate(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function groupByDate(transactions: Transaction[]): { dateKey: string; label: string; txs: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = getDateKey(tx.date)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }
  return Array.from(groups.entries()).map(([key, txs]) => ({
    dateKey: key,
    label: formatDateLabel(key),
    txs,
  }))
}
