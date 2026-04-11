import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import type { GroupDetail as GroupDetailType, GroupExpense, GroupBalances, SettlementRecord } from '../../types'
import { groupStyles } from './groupStyles'
import AddExpenseModal from './AddExpenseModal'
import BalancesPanel from './BalancesPanel'
import SettlementSummary from './SettlementSummary'
import GroupStats from './GroupStats'
import { getCategoryIcon } from '../widgets/categoryIcons'

interface Props {
  groupId: string
  currentUserId: string
  onBack: () => void
}

type Tab = 'expenses' | 'balances' | 'stats'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function personInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? '?'
}

function categoryHue(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.5 6.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-6.5"/>
    </svg>
  )
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

  async function handleExpenseAdded(_expense: GroupExpense) {
    setAddOpen(false)
    const [exp, bal] = await Promise.all([
      api.get<GroupExpense[]>(`/api/groups/${groupId}/expenses`),
      api.get<GroupBalances>(`/api/groups/${groupId}/balances`),
    ])
    setExpenses(exp)
    setBalances(bal)
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

      {balances && balances.settlements.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SettlementSummary
            settlements={balances.settlements}
            currentUserId={currentUserId}
            groupId={groupId}
            onSettled={handleSettled}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="group-tab-bar">
          <button className={`group-tab${tab === 'expenses' ? ' active' : ''}`} onClick={() => setTab('expenses')}>
            Expenses
          </button>
          <button className={`group-tab${tab === 'balances' ? ' active' : ''}`} onClick={() => setTab('balances')}>
            Balances
          </button>
          <button className={`group-tab${tab === 'stats' ? ' active' : ''}`} onClick={() => setTab('stats')}>
            Stats
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
          {expenses.map(e => {
            const hue = e.category_name ? categoryHue(e.category_name) : null
            const expanded = expandedIds.has(e.id)
            const youPaid = e.paid_by === currentUserId
            const payerLabel = youPaid ? 'You' : (e.paid_by_name || 'Unknown')

            const CategoryIcon = getCategoryIcon(e.category_name ?? e.name)

            return (
              <div key={e.id} className="ge-card">
                <div className="ge-main">
                  {/* Category icon */}
                  <div
                    className="ge-icon"
                    style={hue !== null ? {
                      background: `hsla(${hue}, 50%, 26%, 0.55)`,
                      border: `1px solid hsla(${hue}, 50%, 44%, 0.25)`,
                      color: `hsl(${hue}, 62%, 68%)`,
                    } : undefined}
                  >
                    <CategoryIcon size={17} strokeWidth={1.6} />
                  </div>

                  {/* Body */}
                  <div className="ge-body">
                    <div className="ge-title">{e.name}</div>
                    <div className="ge-meta">
                      {/* Payer */}
                      <div className="ge-chip">
                        <div className="ge-payer-avatar">{personInitial(e.paid_by_name || '?')}</div>
                        <span>{payerLabel} paid</span>
                      </div>
                      {/* Date */}
                      <div className="ge-chip">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="2" width="10" height="9" rx="1.5"/>
                          <path d="M1 5h10M4 1v2M8 1v2"/>
                        </svg>
                        <span>{formatDate(e.date)}</span>
                      </div>
                      {/* Category */}
                      {e.category_name && (
                        <div className="ge-chip ge-chip-cat">
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 1h4l6 6-4 4-6-6V1z"/>
                            <circle cx="3.5" cy="3.5" r="0.75" fill="currentColor" stroke="none"/>
                          </svg>
                          <span>{e.category_name}</span>
                        </div>
                      )}
                    </div>
                    {e.description && (
                      <div className="ge-note">{e.description}</div>
                    )}
                  </div>

                  {/* Right: amount + actions */}
                  <div className="ge-right">
                    <div className="ge-amount">{fmt(e.amount)}</div>
                    <div className="ge-actions">
                      <button
                        className={`ge-splits-btn${expanded ? ' active' : ''}`}
                        onClick={() => toggleExpand(e.id)}
                      >
                        {expanded ? 'Hide' : `${e.splits.length} splits`}
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <path d="M2 3.5l3 3 3-3"/>
                        </svg>
                      </button>
                      {canDelete(e) && (
                        <button
                          className="ge-delete-btn"
                          disabled={deletingId === e.id}
                          onClick={() => handleDelete(e.id)}
                          title="Delete expense"
                        >
                          {deletingId === e.id ? '…' : <TrashIcon />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Splits panel */}
                {expanded && (
                  <div className="ge-splits-panel">
                    {e.splits.map(s => (
                      <div key={s.user_id} className="ge-split-row">
                        <div className="ge-split-avatar">{personInitial(s.display_name || '?')}</div>
                        <span className="ge-split-name">
                          {s.display_name || 'Unknown'}{s.user_id === currentUserId ? ' (You)' : ''}
                        </span>
                        <span className="ge-split-amount">{fmt(s.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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

      {tab === 'stats' && (
        <GroupStats
          expenses={expenses}
          currentUserId={currentUserId}
          members={group.members}
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
