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
import { WIDGET_REGISTRY, type WidgetType, type WidgetInstance } from '@/components/widgets/widgetRegistry'

const STORAGE_KEY = 'bud-dashboard-widgets'

function loadWidgets(): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveWidgets(widgets: WidgetInstance[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [errorTx, setErrorTx] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<WidgetInstance[]>(loadWidgets)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    api.get<Transaction[]>('/api/transactions')
      .then(setTransactions)
      .catch(() => setErrorTx('Failed to load transactions'))
      .finally(() => setLoadingTx(false))
  }, [])

  function handleAdd(tx: Transaction) {
    setTransactions(prev => [tx, ...prev])
  }

  const addWidget = useCallback((type: WidgetType) => {
    const def = WIDGET_REGISTRY.find(d => d.type === type)
    if (!def) return
    const instance: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      cols: def.defaultCols,
    }
    setWidgets(prev => {
      const next = [...prev, instance]
      saveWidgets(next)
      return next
    })
  }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const next = prev.filter(w => w.id !== id)
      saveWidgets(next)
      return next
    })
  }, [])

  function renderWidget(w: WidgetInstance) {
    switch (w.type) {
      case 'spending_summary':
        return <SpendingSummaryWidget transactions={transactions} loading={loadingTx} />
      case 'recent_transactions':
        return <RecentTransactionsWidget transactions={transactions} loading={loadingTx} error={errorTx} />
      case 'add_transaction':
        return <AddTransactionWidget onAdd={handleAdd} />
      default:
        return null
    }
  }

  return (
    <>
      <style>{budStyles}</style>
      <div className="bud-root">
        <header className="bud-header">
          <div>
            <p className="bud-greeting">Good {getTimeOfDay()}</p>
            <h1 className="bud-name">{user?.display_name}</h1>
            <p className="bud-email">{user?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {widgets.length > 0 && (
              <button className="bud-add-widget-btn" onClick={() => setPickerOpen(true)}>
                + Add Widget
              </button>
            )}
            <button className="bud-signout" onClick={logout}>Sign out</button>
          </div>
        </header>

        {widgets.length === 0 ? (
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
          <WidgetGrid>
            {widgets.map(w => (
              <WidgetCell key={w.id} cols={w.cols as 1|2|3|4|5|6|7|8|9|10|11|12}>
                <div className="bud-widget-wrapper" style={{ position: 'relative', height: '100%' }}>
                  {renderWidget(w)}
                  <button
                    className="bud-widget-remove"
                    onClick={() => removeWidget(w.id)}
                    aria-label="Remove widget"
                  >
                    ✕
                  </button>
                </div>
              </WidgetCell>
            ))}
          </WidgetGrid>
        )}

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
