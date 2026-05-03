import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { GroupDetail as GroupDetailType, GroupExpense, GroupBalances, SettlementRecord } from '../../types'
import { filterByMonth, formatMonthYear, parseLocalDate } from '../../lib/dateUtils'
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

type Tab = 'expenses' | 'balances' | 'stats' | 'settings'
const TAB_ORDER: Tab[] = ['expenses', 'balances', 'stats', 'settings']

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function personInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? '?'
}

function categoryHue(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

function getDateKey(dateStr: string): string {
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
}

function formatDateLabel(dateStr: string): string {
  const key = getDateKey(dateStr)
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`

  const d = parseLocalDate(key)
  const base = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (key === todayKey) return `${base} (Today)`
  if (key === yesterdayKey) return `${base} (Yesterday)`
  return base
}

function groupByDate(expenses: GroupExpense[]): { dateKey: string; label: string; items: GroupExpense[] }[] {
  const groups = new Map<string, GroupExpense[]>()
  for (const e of expenses) {
    const key = getDateKey(e.date)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }
  return Array.from(groups.entries()).map(([key, items]) => ({
    dateKey: key,
    label: formatDateLabel(key),
    items,
  }))
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.5 6.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-6.5"/>
    </svg>
  )
}

export default function GroupDetail({ groupId, currentUserId, onBack }: Props) {
  const { user } = useAuth()
  const [group, setGroup] = useState<GroupDetailType | null>(null)
  const [expenses, setExpenses] = useState<GroupExpense[]>([])
  const [balances, setBalances] = useState<GroupBalances | null>(null)
  const [tab, setTab] = useState<Tab>('expenses')
  const tabAnimDir = useRef<'forward' | 'back'>('forward')
  const [addOpen, setAddOpen] = useState(false)
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingsName, setSettingsName] = useState('')
  const [renameSaving, setRenameSaving] = useState(false)
  const [renameSuccess, setRenameSuccess] = useState(false)
  const [renameError, setRenameError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [leaveConfirm, setLeaveConfirm] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (isCurrentMonth) return
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function switchTab(newTab: Tab) {
    if (newTab === tab) return
    tabAnimDir.current = TAB_ORDER.indexOf(newTab) > TAB_ORDER.indexOf(tab) ? 'forward' : 'back'
    setTab(newTab)
  }

  const filteredExpenses = useMemo(
    () => filterByMonth(expenses, viewYear, viewMonth),
    [expenses, viewYear, viewMonth]
  )

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [g, exp, bal] = await Promise.all([
        api.get<GroupDetailType>(`/api/groups/${groupId}`),
        api.get<GroupExpense[]>(`/api/groups/${groupId}/expenses`),
        api.get<GroupBalances>(`/api/groups/${groupId}/balances`),
      ])
      setGroup(g)
      setSettingsName(g.name)
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

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!settingsName.trim() || !group) return
    setRenameSaving(true)
    setRenameError('')
    setRenameSuccess(false)
    try {
      const updated = await api.patch<GroupDetailType>(`/api/groups/${groupId}`, { name: settingsName.trim() })
      setGroup(updated)
      setRenameSuccess(true)
      setTimeout(() => setRenameSuccess(false), 2500)
    } catch {
      setRenameError('Could not rename group. Please try again.')
    } finally {
      setRenameSaving(false)
    }
  }

  async function handleDeleteGroup() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/api/groups/${groupId}`)
      onBack()
    } catch {
      setDeleteError('Could not delete group. Please try again.')
      setDeleting(false)
    }
  }

  function handleCopyCode() {
    if (!group) return
    navigator.clipboard.writeText(group.invite_code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  async function handleRemoveMember(userId: string) {
    setRemovingUserId(userId)
    try {
      await api.delete(`/api/groups/${groupId}/members/${userId}`)
      setGroup(prev => prev ? { ...prev, members: prev.members.filter(m => m.user_id !== userId) } : prev)
    } catch { /* silent — member stays in list */ } finally {
      setRemovingUserId(null)
    }
  }

  async function handleLeaveGroup() {
    setLeaving(true)
    setLeaveError('')
    try {
      await api.delete(`/api/groups/${groupId}/members/me`)
      onBack()
    } catch {
      setLeaveError('Could not leave group. Please try again.')
      setLeaving(false)
    }
  }

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
          <button className={`group-tab${tab === 'expenses' ? ' active' : ''}`} onClick={() => switchTab('expenses')}>
            Expenses
          </button>
          <button className={`group-tab${tab === 'balances' ? ' active' : ''}`} onClick={() => switchTab('balances')}>
            Balances
          </button>
          <button className={`group-tab${tab === 'stats' ? ' active' : ''}`} onClick={() => switchTab('stats')}>
            Stats
          </button>
          <button className={`group-tab${tab === 'settings' ? ' active' : ''}`} onClick={() => switchTab('settings')}>
            Settings
          </button>
        </div>
        <div className="bud-month-nav">
          <button className="bud-month-arrow" onClick={prevMonth} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="bud-month-label">{formatMonthYear(viewYear, viewMonth)}</span>
          <button className="bud-month-arrow" onClick={nextMonth} disabled={isCurrentMonth} aria-label="Next month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div key={tab} className={`tab-content-slide tab-slide-${tabAnimDir.current}`}>
      {tab === 'expenses' && (
        <>
          {filteredExpenses.length === 0 && (
            <div className="group-empty-state" style={{ padding: '48px 24px' }}>
              <div className="group-empty-state-icon">🧾</div>
              <h3>{expenses.length === 0 ? 'No expenses yet' : 'No expenses this month'}</h3>
              <p>{expenses.length === 0 ? 'Add the first expense to start tracking who owes what.' : 'Try navigating to a different month or add a new expense.'}</p>
              {expenses.length === 0 && <button className="group-btn-primary" onClick={() => setAddOpen(true)}>Add expense</button>}
            </div>
          )}
          {filteredExpenses.length > 0 && (
          <div
            className="group-expenses-scroll"
            onWheel={e => e.stopPropagation()}
          >
          {groupByDate(filteredExpenses).map(({ dateKey, label, items }) => (
            <div key={dateKey} className="ge-date-group">
              <div className="ge-date-heading">{label}</div>
              {items.map(e => {
                const hue = e.category_name ? categoryHue(e.category_name) : null
                const expanded = expandedIds.has(e.id)
                const youPaid = e.paid_by === currentUserId
                const payerLabel = youPaid ? 'You' : (e.paid_by_name || 'Unknown')
                const CategoryIcon = getCategoryIcon(e.category_name ?? e.name)

                return (
                  <div key={e.id} className="ge-card">
                    <div className="ge-main" onClick={() => toggleExpand(e.id)} style={{ cursor: 'pointer' }}>
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

                      <div className="ge-body">
                        <div className="ge-title">{e.name}</div>
                        <div className="ge-meta">
                          <div className="ge-chip">
                            <div className="ge-payer-avatar">{personInitial(e.paid_by_name || '?')}</div>
                            <span>{payerLabel} paid</span>
                          </div>
                          {e.category_name && (
                            <div className="ge-chip ge-chip-cat">
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 1h4l6 6-4 4-6-6V1z"/>
                                <circle cx="3.5" cy="3.5" r="0.75" fill="currentColor" stroke="none"/>
                              </svg>
                              <span>{e.category_name}</span>
                            </div>
                          )}
                          {e.card_alias_id && (() => {
                            const card = user?.card_aliases?.find(c => c.id === e.card_alias_id)
                            return card ? (
                              <div className="ge-chip ge-chip-cat">
                                <span>{card.card_name}{card.last4 ? ` · ${card.last4}` : ''}</span>
                              </div>
                            ) : null
                          })()}
                        </div>
                        {e.description && (
                          <div className="ge-note">{e.description}</div>
                        )}
                      </div>

                      <div className="ge-right">
                        <div className="ge-amount">{fmt(e.amount)}</div>
                        <div className="ge-actions">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path d="M2 3.5l3 3 3-3"/>
                          </svg>
                          {canDelete(e) && (
                            <button
                              className="ge-delete-btn"
                              disabled={deletingId === e.id}
                              onClick={ev => { ev.stopPropagation(); handleDelete(e.id) }}
                              title="Delete expense"
                            >
                              {deletingId === e.id ? '…' : <TrashIcon />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

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
          ))}
        </div>
          )}
      </>)}

      {tab === 'balances' && balances && (
        <BalancesPanel
          balances={balances}
          currentUserId={currentUserId}
          groupId={groupId}
          groupName={group.name}
          onSettled={handleSettled}
          onSettlementDeleted={handleSettlementDeleted}
        />
      )}

      {tab === 'stats' && (
        <GroupStats
          expenses={filteredExpenses}
          currentUserId={currentUserId}
          members={group.members}
        />
      )}

      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Group name + Invite code side by side */}
          <div className="gs-row">
            {group.created_by === currentUserId ? (
              <div className="gs-section" style={{ flex: 1 }}>
                <div className="gs-section-title">Group name</div>
                <form onSubmit={handleRename} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="group-field">
                    <input
                      className="group-input"
                      value={settingsName}
                      onChange={e => { setSettingsName(e.target.value); setRenameSuccess(false) }}
                      placeholder="Group name"
                      required
                    />
                  </div>
                  {renameError && <div className="group-error">{renameError}</div>}
                  {renameSuccess && <div className="gs-success">Name updated successfully.</div>}
                  <div>
                    <button
                      type="submit"
                      className="group-btn-primary"
                      disabled={renameSaving || !settingsName.trim() || settingsName.trim() === group.name}
                    >
                      {renameSaving ? 'Saving…' : 'Save name'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="gs-section" style={{ flex: 1 }}>
                <div className="gs-section-title">Group name</div>
                <div className="gs-readonly-name">{group.name}</div>
                <p className="gs-readonly-note">Only the group creator can rename this group.</p>
              </div>
            )}
            <div className="gs-section" style={{ flex: 1 }}>
              <div className="gs-section-title">Invite code</div>
              <div className="gs-invite-row">
                <code className="gs-invite-code">{group.invite_code}</code>
                <button type="button" className="group-btn-ghost" onClick={handleCopyCode}>
                  {codeCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Members - owner only */}
          {group.created_by === currentUserId && (
            <div className="gs-section">
              <div className="gs-section-title">Members</div>
              <div className="gs-members-list">
                {group.members.map(m => (
                  <div key={m.user_id} className="gs-member-row">
                    <span className="gs-member-name">
                      {m.display_name}{m.user_id === currentUserId ? ' (You)' : ''}
                    </span>
                    {m.user_id === group.created_by ? (
                      <span className="gs-owner-badge">Owner</span>
                    ) : (
                      <button
                        type="button"
                        className="gs-remove-btn"
                        disabled={removingUserId === m.user_id}
                        onClick={() => handleRemoveMember(m.user_id)}
                      >
                        {removingUserId === m.user_id ? '…' : 'Remove'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger: owner sees delete, non-owner sees leave */}
          {group.created_by === currentUserId && (
            <div className="gs-section gs-danger-zone">
              <div className="gs-section-title gs-danger-title">Danger zone</div>
              <p className="gs-danger-desc">Permanently delete this group and all its expenses, splits, and settlement history. This cannot be undone.</p>
              {deleteError && <div className="group-error" style={{ marginBottom: 10 }}>{deleteError}</div>}
              {!deleteConfirm ? (
                <button
                  type="button"
                  className="group-btn-danger"
                  onClick={() => setDeleteConfirm(true)}
                >
                  Delete group
                </button>
              ) : (
                <div className="gs-confirm-row">
                  <span className="gs-confirm-text">Are you sure? This cannot be undone.</span>
                  <button
                    type="button"
                    className="gs-confirm-btn"
                    disabled={deleting}
                    onClick={handleDeleteGroup}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    type="button"
                    className="group-btn-secondary"
                    onClick={() => { setDeleteConfirm(false); setDeleteError('') }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {group.created_by !== currentUserId && (
            <div className="gs-section gs-danger-zone">
              <div className="gs-section-title gs-danger-title">Danger zone</div>
              <p className="gs-danger-desc">Leave this group. Your expense history will remain.</p>
              {leaveError && <div className="group-error" style={{ marginBottom: 10 }}>{leaveError}</div>}
              {!leaveConfirm ? (
                <button type="button" className="group-btn-danger" onClick={() => setLeaveConfirm(true)}>
                  Leave group
                </button>
              ) : (
                <div className="gs-confirm-row">
                  <span className="gs-confirm-text">Are you sure you want to leave?</span>
                  <button type="button" className="gs-confirm-btn" disabled={leaving} onClick={handleLeaveGroup}>
                    {leaving ? 'Leaving…' : 'Yes, leave'}
                  </button>
                  <button type="button" className="group-btn-secondary" onClick={() => { setLeaveConfirm(false); setLeaveError('') }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>

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
