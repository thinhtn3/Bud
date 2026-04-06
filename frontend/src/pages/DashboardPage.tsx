import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Transaction } from '@/types'
import { budStyles } from '@/components/widgets/budStyles'
import { WidgetGrid, WidgetCell } from '@/components/widgets/WidgetGrid'
import { WidgetPicker } from '@/components/widgets/WidgetPicker'
import { SpendingSummaryWidget } from '@/components/widgets/SpendingSummaryWidget'
import { AddTransactionWidget } from '@/components/widgets/AddTransactionWidget'
import { RecentTransactionsWidget } from '@/components/widgets/RecentTransactionsWidget'
import { QuickAddWidget } from '@/components/widgets/QuickAddWidget'
import { CategoryBreakdownWidget } from '@/components/widgets/CategoryBreakdownWidget'
import { useDragReorder } from '@/components/widgets/useDragReorder'
import { WIDGET_REGISTRY, type WidgetType, type WidgetSize, type WidgetInstance } from '@/components/widgets/widgetRegistry'

const STORAGE_KEY = 'bud-dashboard-widgets'

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
  const { user, logout, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [errorTx, setErrorTx] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<WidgetInstance[]>([])
  const [widgetsReady, setWidgetsReady] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Load widgets: backend first, localStorage fallback + migration
  useEffect(() => {
    refreshUser()
    api.get<Transaction[]>('/api/transactions')
      .then(setTransactions)
      .catch(() => setErrorTx('Failed to load transactions'))
      .finally(() => setLoadingTx(false))

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

  function handleAdd(tx: Transaction) {
    setTransactions(prev => [tx, ...prev])
  }
  function handleUpdate(updated: Transaction) {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t))
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
        return <SpendingSummaryWidget transactions={transactions} loading={loadingTx} size={w.size} />
      case 'recent_transactions':
        return <RecentTransactionsWidget transactions={transactions} loading={loadingTx} error={errorTx} onUpdate={handleUpdate} onDelete={handleDelete} />
      case 'add_transaction':
        return <AddTransactionWidget onAdd={handleAdd} size={w.size === 'small' ? 'small' : 'medium'} />
      case 'quick_add':
        return <QuickAddWidget onAdd={handleAdd} size={w.size === 'small' ? 'small' : 'default'} />
      case 'category_breakdown':
        return <CategoryBreakdownWidget transactions={transactions} loading={loadingTx} size={w.size} />
      default:
        return null
    }
  }

  return (
    <>
      <style>{budStyles}</style>
      <div className="bud-root">
        <div className="bud-bg-blob bud-bg-blob-1" />
        <div className="bud-bg-blob bud-bg-blob-2" />
        <div className="bud-bg-blob bud-bg-blob-3" />
        <header className="bud-header">
          <div>
            <p className="bud-greeting">Good {getTimeOfDay()}</p>
            <h1 className="bud-name">{user?.display_name}</h1>
            <p className="bud-email">{user?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
            <button className="bud-signout" onClick={logout}>Sign out</button>
          </div>
        </header>

        {!widgetsReady ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p className="bud-tx-loading">Loading dashboard…</p>
          </div>
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
      </div>
    </>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
