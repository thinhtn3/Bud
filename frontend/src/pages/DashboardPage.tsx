import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Transaction } from '@/types'
import { budStyles } from '@/components/widgets/budStyles'
import { WidgetGrid, WidgetCell } from '@/components/widgets/WidgetGrid'
import { WidgetPicker } from '@/components/widgets/WidgetPicker'
import { SpendingSummaryWidget } from '@/components/widgets/SpendingSummaryWidget'
import { AddTransactionWidget } from '@/components/widgets/AddTransactionWidget'
import { AddTransactionModal } from '@/components/widgets/AddTransactionModal'
import { RecentTransactionsWidget } from '@/components/widgets/RecentTransactionsWidget'
import { QuickAddWidget } from '@/components/widgets/QuickAddWidget'
import { CategoryBreakdownWidget } from '@/components/widgets/CategoryBreakdownWidget'
import { CardSpendingWidget } from '@/components/widgets/CardSpendingWidget'
import { useDragReorder } from '@/components/widgets/useDragReorder'
import { WIDGET_REGISTRY, type WidgetType, type WidgetSize, type WidgetInstance } from '@/components/widgets/widgetRegistry'
import { WidgetSkeleton } from '@/components/widgets/WidgetSkeleton'
import { parseLocalDate, formatMonthYear } from '@/lib/dateUtils'
import { PreferencesModal } from '@/components/PreferencesModal'
import { Navbar } from '@/components/Navbar'

const STORAGE_KEY = 'bud-dashboard-widgets'

const DEFAULT_SKELETON_LAYOUT: WidgetInstance[] = [
  { id: 'skel-1', type: 'spending_summary',    size: 'medium' },
  { id: 'skel-2', type: 'recent_transactions', size: 'medium' },
  { id: 'skel-3', type: 'category_breakdown',  size: 'medium' },
  { id: 'skel-4', type: 'card_spending',       size: 'medium' },
]

function loadLocalWidgets(): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    return JSON.parse(saved).map((w: Record<string, unknown>) => {
      if (w.size) return w as WidgetInstance
      const cols = (w.cols as number) ?? 6
      const size: WidgetSize = cols >= 10 ? 'large' : cols >= 4 ? 'medium' : 'small'
      return { id: w.id as string, type: w.type as WidgetType, size }
    })
  } catch {
    return []
  }
}

function saveLocalWidgets(widgets: WidgetInstance[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}

// Convert WidgetInstance[] → backend PUT payload
function toPayload(widgets: WidgetInstance[]) {
  return widgets.map((w, i) => ({ type: w.type, size: w.size, position: i }))
}

// Convert backend response → WidgetInstance[]
function fromBackend(data: { id: string; type: string; size: string; position: number }[]): WidgetInstance[] {
  return data
    .sort((a, b) => a.position - b.position)
    .map(w => ({ id: w.id, type: w.type as WidgetType, size: w.size as WidgetSize }))
}

// Debounced sync — collapses rapid calls (e.g. StrictMode double-fire) into one PUT
let _syncTimer: ReturnType<typeof setTimeout> | null = null
function syncToBackend(widgets: WidgetInstance[]) {
  if (_syncTimer) clearTimeout(_syncTimer)
  _syncTimer = setTimeout(() => {
    _syncTimer = null
    api.put('/api/dashboard/widgets', toPayload(widgets)).catch(() => {})
  }, 300)
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [errorTx, setErrorTx] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<WidgetInstance[]>([])
  const [widgetsReady, setWidgetsReady] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const [spendingPeriod, setSpendingPeriod] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')
  const spendingPeriodSeeded = useRef(false)
  useEffect(() => {
    const p = user?.preferences?.budget_period
    if (!spendingPeriodSeeded.current && p) {
      if (p === 'weekly' || p === 'biweekly' || p === 'monthly') {
        spendingPeriodSeeded.current = true
        setSpendingPeriod(p)
      }
    }
  }, [user?.preferences?.budget_period])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (isCurrentMonth) return
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }
  function goToCurrentMonth() {
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
  }

  // Load widgets + user: runs once on mount
  useEffect(() => {
    refreshUser()

    api.get<{ id: string; type: string; size: string; position: number }[]>('/api/dashboard/widgets')
      .then(data => {
        if (data.length > 0) {
          // Backend has widgets — use them
          const w = fromBackend(data)
          setWidgets(w)
          saveLocalWidgets(w)
        } else {
          // Backend empty — check localStorage for one-time migration
          const local = loadLocalWidgets()
          if (local.length > 0) {
            setWidgets(local)
            syncToBackend(local)
          }
        }
      })
      .catch(() => {
        // Backend unreachable — fall back to localStorage
        setWidgets(loadLocalWidgets())
      })
      .finally(() => setWidgetsReady(true))
  }, [])

  // Fetch transactions for the viewed month; re-runs on month navigation
  useEffect(() => {
    let cancelled = false
    setLoadingTx(true)
    setErrorTx(null)
    setTransactions([])
    const { from, to } = monthRange(viewYear, viewMonth)
    api.get<Transaction[]>(`/api/transactions?from=${from}&to=${to}`)
      .then(data  => { if (!cancelled) setTransactions(data) })
      .catch(()   => { if (!cancelled) setErrorTx('Failed to load transactions') })
      .finally(() => { if (!cancelled) setLoadingTx(false) })
    return () => { cancelled = true }
  }, [viewYear, viewMonth])

  function handleAdd(tx: Transaction) {
    // Only prepend if the transaction falls within the currently viewed month
    const d = parseLocalDate(tx.date)
    const start = new Date(viewYear, viewMonth, 1)
    const end   = new Date(viewYear, viewMonth + 1, 1)
    if (d >= start && d < end) {
      setTransactions(prev => [tx, ...prev])
    }
  }
  function handleUpdate(updated: Transaction) {
    const d = parseLocalDate(updated.date)
    const start = new Date(viewYear, viewMonth, 1)
    const end   = new Date(viewYear, viewMonth + 1, 1)
    const inMonth = d >= start && d < end
    setTransactions(prev =>
      inMonth
        ? prev.map(t => t.id === updated.id ? updated : t)   // update in-place
        : prev.filter(t => t.id !== updated.id)               // date moved to another month — remove
    )
  }
  function handleDelete(id: string) {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const handleReorder = useCallback((newOrder: WidgetInstance[]) => {
    setWidgets(newOrder)
    saveLocalWidgets(newOrder)
    syncToBackend(newOrder)
  }, [])

  const { dragState, displayWidgets, cellRefs, floatingRef, onPointerDown } = useDragReorder({
    widgets,
    editMode,
    onReorder: handleReorder,
  })

  const addWidget = useCallback((type: WidgetType, size: WidgetSize) => {
    const instance: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      size,
    }
    setWidgets(prev => {
      const next = [...prev, instance]
      saveLocalWidgets(next)
      syncToBackend(next)
      return next
    })
  }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const next = prev.filter(w => w.id !== id)
      saveLocalWidgets(next)
      syncToBackend(next)
      if (next.length === 0) setEditMode(false)
      return next
    })
  }, [])

  function renderWidget(w: WidgetInstance) {
    switch (w.type) {
      case 'spending_summary':
        return <SpendingSummaryWidget
          transactions={transactions}
          allTransactions={transactions}
          loading={loadingTx}
          size={w.size}
          budgetAmount={user?.preferences?.budget_amount}
          budgetPeriod={user?.preferences?.budget_period}
          viewYear={viewYear}
          viewMonth={viewMonth}
          period={spendingPeriod}
        />
      case 'recent_transactions':
        return <RecentTransactionsWidget transactions={transactions} loading={loadingTx} error={errorTx} size={w.size} onUpdate={handleUpdate} onDelete={handleDelete} />
      case 'add_transaction':
        return <AddTransactionWidget onAdd={handleAdd} size={w.size === 'small' ? 'small' : 'medium'} />
      case 'quick_add':
        return <QuickAddWidget onAdd={handleAdd} size={w.size === 'small' ? 'small' : 'default'} />
      case 'category_breakdown':
        return <CategoryBreakdownWidget transactions={transactions} loading={loadingTx} size={w.size} />
      case 'card_spending':
        return <CardSpendingWidget transactions={transactions} loading={loadingTx} size={w.size} />
      default:
        return null
    }
  }

  return (
    <>
      <style>{budStyles}</style>
      <Navbar />
      <div className="bud-root" style={{ paddingLeft: 'var(--desktop-nav-offset, 220px)' }}>
        <div className="bud-bg-blob bud-bg-blob-1" />
        <div className="bud-bg-blob bud-bg-blob-2" />
        <div className="bud-bg-blob bud-bg-blob-3" />
        <header className="bud-header">
          <div className="bud-header-user">
            <span className="bud-greeting">Good {getTimeOfDay()},</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="bud-name">{user?.display_name}</h1>
              <button
                className="bud-prefs-trigger"
                onClick={() => setPrefsOpen(true)}
                aria-label="Open preferences"
              >
                <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                  <path d="M9.5 1.5a1.414 1.414 0 0 1 2 2L4 11H1.5V8.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="bud-email">{user?.email}</p>
          </div>
          <div className="bud-header-actions">
            {widgets.length > 0 && (
              <>
                <button className="bud-add-widget-btn" onClick={() => setPickerOpen(true)}>
                  + Add Widget
                </button>
                <button
                  className={`bud-edit-btn ${editMode ? 'bud-edit-btn-done' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Done' : 'Edit'}
                </button>
              </>
            )}
          </div>
        </header>

        <div className="bud-month-nav">
          <button className="bud-month-arrow" onClick={prevMonth} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="bud-month-label">{formatMonthYear(viewYear, viewMonth)}</span>
          <button
            className="bud-month-arrow"
            onClick={nextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {!isCurrentMonth && (
            <button className="bud-month-today" onClick={goToCurrentMonth}>
              Today
            </button>
          )}
          {widgetsReady && widgets.some(w => w.type === 'spending_summary') && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {(['weekly', 'biweekly', 'monthly'] as const).map(p => (
                <button
                  key={p}
                  className={`bud-period-chip${spendingPeriod === p ? ' active' : ''}`}
                  onClick={() => setSpendingPeriod(p)}
                >
                  {p === 'weekly' ? 'Weekly' : p === 'biweekly' ? 'Biweekly' : 'Monthly'}
                </button>
              ))}
            </div>
          )}
        </div>

        {!widgetsReady ? (
          <WidgetGrid>
            {(loadLocalWidgets().length > 0 ? loadLocalWidgets() : DEFAULT_SKELETON_LAYOUT).map(w => (
              <WidgetCell key={w.id} size={w.size}>
                <div className="bud-widget-wrapper" style={{ position: 'relative', height: '100%' }}>
                  <WidgetSkeleton type={w.type} size={w.size} />
                </div>
              </WidgetCell>
            ))}
          </WidgetGrid>
        ) : widgets.length === 0 ? (
          <div className="bud-empty-state">
            <p className="bud-empty-title">Your dashboard is empty</p>
            <p className="bud-empty-sub">
              Add widgets to see your balances, transactions, and spending at a glance.
            </p>
            <button className="bud-add-widget-btn-primary" onClick={() => setPickerOpen(true)}>
              + Add Widget
            </button>
          </div>
        ) : (
          <WidgetGrid className={editMode ? 'bud-edit-mode' : ''}>
            {displayWidgets.map((w) => (
              <WidgetCell
                key={w.id}
                size={w.size}
                cellRef={(el) => {
                  if (el) cellRefs.current.set(w.id, el)
                  else cellRefs.current.delete(w.id)
                }}
                className={dragState?.activeId === w.id ? 'bud-drag-placeholder' : ''}
              >
                <div
                  className="bud-widget-wrapper"
                  style={{ position: 'relative', height: '100%' }}
                >
                  {renderWidget(w)}
                  {/* 6-dot drag handle — only active in edit mode */}
                  <div
                    className="bud-drag-handle"
                    onPointerDown={(e) => onPointerDown(e, w.id)}
                    aria-label="Drag to reorder"
                  >
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                      <circle cx="3" cy="2" r="1.5"/>
                      <circle cx="9" cy="2" r="1.5"/>
                      <circle cx="3" cy="7" r="1.5"/>
                      <circle cx="9" cy="7" r="1.5"/>
                      <circle cx="3" cy="12" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/>
                    </svg>
                  </div>
                  <button
                    className="bud-widget-remove"
                    onClick={(e) => { e.stopPropagation(); removeWidget(w.id) }}
                    aria-label="Remove widget"
                  >
                    ✕
                  </button>
                </div>
              </WidgetCell>
            ))}
          </WidgetGrid>
        )}

        {/* Floating dragged widget — follows pointer */}
        {dragState && (() => {
          const w = widgets.find(w => w.id === dragState.activeId)
          if (!w) return null
          return (
            <div
              ref={floatingRef}
              className="bud-drag-floating"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: dragState.originalRect.width,
                height: dragState.originalRect.height,
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <div className="bud-widget-wrapper" style={{ height: '100%' }}>
                {renderWidget(w)}
              </div>
            </div>
          )
        })()}

        <WidgetPicker
          open={pickerOpen}
          activeWidgets={widgets}
          onAdd={addWidget}
          onClose={() => setPickerOpen(false)}
        />
        {prefsOpen && <PreferencesModal onClose={() => setPrefsOpen(false)} />}
        {addOpen && <AddTransactionModal onAdd={handleAdd} onClose={() => setAddOpen(false)} />}
      </div>

      <button className="bud-fab" onClick={() => setAddOpen(true)} aria-label="Add transaction">
        +
      </button>
    </>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function monthRange(year: number, month: number): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0')
  const from = `${year}-${pad(month + 1)}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const to = `${year}-${pad(month + 1)}-${pad(lastDay)}`
  return { from, to }
}
