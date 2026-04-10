import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import type { GroupDetail as GroupDetailType, GroupExpense, GroupBalances, SettlementRecord } from '../../types'
import { groupStyles } from './groupStyles'
import AddExpenseModal from './AddExpenseModal'
import BalancesPanel from './BalancesPanel'
import SettlementSummary from './SettlementSummary'

interface Props {
  groupId: string
  currentUserId: string
  onBack: () => void
}

type Tab = 'expenses' | 'balances'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function GroupDetail({ groupId, currentUserId, onBack }: Props) {
  const [group, setGroup] = useState<GroupDetailType | null>(null)
  const [expenses, setExpenses] = useState<GroupExpense[]>([])
  const [balances, setBalances] = useState<GroupBalances | null>(null)
  const [tab, setTab] = useState<Tab>('expenses')
  const [addOpen, setAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [g, exp, bal] = await Promise.all([
        api.get<GroupDetailType>(`/api/groups/${groupId}`),
        api.get<GroupExpense[]>(`/api/groups/${groupId}/expenses`),
        api.get<GroupBalances>(`/api/groups/${groupId}/balances`),
      ])
      setGroup(g)
      setExpenses(exp)
      setBalances(bal)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => { fetchAll() }, [fetchAll])

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleDelete(expenseId: string) {
    setDeletingId(expenseId)
    try {
      await api.delete(`/api/groups/${groupId}/expenses/${expenseId}`)
      setExpenses(prev => prev.filter(e => e.id !== expenseId))
      // Refresh balances
      const bal = await api.get<GroupBalances>(`/api/groups/${groupId}/balances`)
      setBalances(bal)
    } catch {
      // Silently restore — error visible to user via no-change
    } finally {
      setDeletingId(null)
    }
  }

  function handleExpenseAdded(expense: GroupExpense) {
    setExpenses(prev => [expense, ...prev])
    setAddOpen(false)
    api.get<GroupBalances>(`/api/groups/${groupId}/balances`).then(setBalances)
  }

  function handleSettled(_record: SettlementRecord) {
    api.get<GroupBalances>(`/api/groups/${groupId}/balances`).then(setBalances)
  }

  function handleSettlementDeleted(_id: string) {
    api.get<GroupBalances>(`/api/groups/${groupId}/balances`).then(setBalances)
  }

  const canDelete = (expense: GroupExpense) =>
    expense.paid_by === currentUserId || group?.created_by === currentUserId

  if (loading || !group) {
    return (
      <div className="group-root" style={{ padding: 40 }}>
        <style>{groupStyles}</style>
        <button className="group-back-btn" onClick={onBack}>← Back</button>
        <div style={{ color: 'rgba(247,248,248,0.35)', fontSize: 13 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div className="group-root" style={{ padding: 0 }}>
      <style>{groupStyles}</style>

      <button className="group-back-btn" onClick={onBack}>← All groups</button>

      <div className="group-detail-header">
        <div>
          <div className="group-detail-name">{group.name}</div>
          <div className="group-member-avatars" style={{ marginTop: 8 }}>
            {group.members.map(m => (
              <span key={m.user_id} className={`group-member-chip${m.user_id === currentUserId ? ' is-you' : ''}`}>
                {m.display_name || 'Unknown'}{m.user_id === currentUserId ? ' (You)' : ''}
              </span>
            ))}
          </div>
        </div>
        {tab === 'expenses' && (
          <button className="group-btn-primary" onClick={() => setAddOpen(true)}>+ Add expense</button>
        )}
      </div>

      {balances && (
        <SettlementSummary
          settlements={balances.settlements}
          currentUserId={currentUserId}
          groupId={groupId}
          onSettled={handleSettled}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="group-tab-bar">
          <button className={`group-tab${tab === 'expenses' ? ' active' : ''}`} onClick={() => setTab('expenses')}>
            Expenses
          </button>
          <button className={`group-tab${tab === 'balances' ? ' active' : ''}`} onClick={() => setTab('balances')}>
            Balances
          </button>
        </div>
      </div>

      {tab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {expenses.length === 0 && (
            <div className="group-empty-state" style={{ padding: '48px 24px' }}>
              <div className="group-empty-state-icon">🧾</div>
              <h3>No expenses yet</h3>
              <p>Add the first expense to start tracking who owes what.</p>
              <button className="group-btn-primary" onClick={() => setAddOpen(true)}>Add expense</button>
            </div>
          )}
          {expenses.map(e => (
            <div key={e.id} className="group-expense-row">
              <div className="group-expense-header">
                <div>
                  <div className="group-expense-name">{e.name}</div>
                  <div className="group-expense-meta">
                    <span className="group-paid-badge">Paid by {e.paid_by_name || 'Unknown'}</span>
                    <span>{formatDate(e.date)}</span>
                    {e.description && <span>· {e.description}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="group-expense-amount">{fmt(e.amount)}</span>
                  <button
                    className="group-btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => toggleExpand(e.id)}
                  >
                    {expandedIds.has(e.id) ? 'Hide' : 'Splits'}
                  </button>
                  {canDelete(e) && (
                    <button
                      className="group-btn-danger"
                      style={{ fontSize: 11 }}
                      disabled={deletingId === e.id}
                      onClick={() => handleDelete(e.id)}
                    >
                      {deletingId === e.id ? '…' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
              {expandedIds.has(e.id) && (
                <div className="group-splits-list">
                  {e.splits.map(s => (
                    <div key={s.user_id} className="group-group-item">
                      <span>{s.display_name || 'Unknown'}{s.user_id === currentUserId ? ' (You)' : ''}</span>
                      <span className="group-group-item-amount">{fmt(s.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'balances' && balances && (
        <BalancesPanel
          balances={balances}
          currentUserId={currentUserId}
          groupId={groupId}
          onSettled={handleSettled}
          onSettlementDeleted={handleSettlementDeleted}
        />
      )}

      <AddExpenseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        members={group.members}
        groupId={groupId}
        currentUserId={currentUserId}
        onAdded={handleExpenseAdded}
      />
    </div>
  )
}
