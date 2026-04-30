import { useState } from 'react'
import type { Transaction } from '@/types'
import { parseLocalDate } from '@/lib/dateUtils'
import { WidgetSkeleton } from './WidgetSkeleton'

type Period = 'biweekly' | 'monthly'
type View   = 'net' | 'gross'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'biweekly', label: 'Biweekly' },
  { key: 'monthly',  label: 'Monthly'  },
]

const VIEWS: { key: View; label: string }[] = [
  { key: 'net',   label: 'Net'   },
  { key: 'gross', label: 'Gross' },
]

function getPeriodRange(period: Period, year: number, month: number): { start: Date; end: Date } {
  const lastDay = new Date(year, month + 1, 0).getDate()
  if (period === 'biweekly') {
    const now = new Date()
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    const useFirstHalf = isCurrentMonth ? now.getDate() <= 15 : false
    return useFirstHalf
      ? { start: new Date(year, month, 1),  end: new Date(year, month, 15) }
      : { start: new Date(year, month, 16), end: new Date(year, month, lastDay) }
  }
  return { start: new Date(year, month, 1), end: new Date(year, month, lastDay) }
}

function filterByPeriod(txs: Transaction[], period: Period, year: number, month: number): Transaction[] {
  const { start, end } = getPeriodRange(period, year, month)
  return txs.filter(t => {
    const d = parseLocalDate(t.date)
    return d >= start && d <= end
  })
}

function toMonthlyBudget(amount: number, storedPeriod: string): number {
  if (storedPeriod === 'monthly')  return amount
  if (storedPeriod === 'biweekly') return amount * 2
  return amount * 4
}

function periodLabel(period: Period, year: number, month: number): string {
  if (period === 'monthly') return 'this month'
  const lastDay = new Date(year, month + 1, 0).getDate()
  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  if (isCurrentMonth) return now.getDate() <= 15 ? '1–15' : `16–${lastDay}`
  return `16–${lastDay}`
}

interface Props {
  transactions: Transaction[]
  allTransactions: Transaction[]
  loading: boolean
  size?: 'small' | 'medium' | 'large'
  budgetAmount?: number
  budgetPeriod?: string
  viewYear: number
  viewMonth: number
}

export function SpendingSummaryWidget({ transactions, loading, size = 'medium', budgetAmount, budgetPeriod, viewYear, viewMonth }: Props) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [view,   setView]   = useState<View>('net')

  if (loading) {
    return <WidgetSkeleton type="spending_summary" size={size} />
  }

  const periodTxs       = filterByPeriod(transactions, period, viewYear, viewMonth)
  const expenses        = periodTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const reimbursements  = periodTxs.filter(t => t.type === 'reimbursement').reduce((s, t) => s + t.amount, 0)
  const income          = periodTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const netSpending     = expenses - reimbursements
  const expenseCount    = periodTxs.filter(t => t.type === 'expense').length
  const incomeCount     = periodTxs.filter(t => t.type === 'income').length
  const reimburseCount  = periodTxs.filter(t => t.type === 'reimbursement').length

  const displayed  = view === 'net' ? netSpending : expenses

  const monthlyBudget = (!!budgetAmount && budgetAmount > 0 && !!budgetPeriod)
    ? toMonthlyBudget(budgetAmount, budgetPeriod)
    : null
  const periodBudget = monthlyBudget !== null
    ? (period === 'biweekly' ? monthlyBudget / 2 : monthlyBudget)
    : null
  const budgetPct  = periodBudget ? Math.min(displayed / periodBudget, 1) : null
  const overBudget = periodBudget !== null && displayed > periodBudget

  function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const label = periodLabel(period, viewYear, viewMonth)

  return (
    <div className="bud-stat-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="bud-period-chips">
          {PERIODS.map(p => (
            <button key={p.key} className={`bud-period-chip ${period === p.key ? 'active' : ''}`} onClick={() => setPeriod(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="bud-period-chips">
          {VIEWS.map(v => (
            <button key={v.key} className={`bud-period-chip ${view === v.key ? 'active' : ''}`} onClick={() => setView(v.key)}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spending (left) + Income/Reimbursed (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, flex: 1 }}>

        {/* Left: spending */}
        <div style={{ paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span className="bud-stat-label">{view === 'net' ? 'Net Spending' : 'Gross Expenses'}</span>
            <p className={`bud-stat-amount ${overBudget ? 'bud-stat-amount-expense' : 'bud-stat-amount-balance'}`} style={{ marginTop: 6 }}>
              −${fmt(displayed)}
            </p>
            <p className="bud-stat-sub">{expenseCount} transaction{expenseCount !== 1 ? 's' : ''} · {label}</p>
          </div>
          {periodBudget !== null && (
            <div>
              <div className="bud-budget-bar-wrap">
                <div
                  className={`bud-budget-bar-fill ${overBudget ? 'bud-budget-bar-over' : ''}`}
                  style={{ width: `${(budgetPct! * 100).toFixed(1)}%` }}
                />
              </div>
              <p className="bud-stat-sub" style={{ marginTop: 4 }}>
                {overBudget ? 'over budget · ' : ''}${fmt(displayed)} of ${fmt(periodBudget)}
              </p>
            </div>
          )}
        </div>

        {/* Right: income + reimbursed */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span className="bud-stat-label">Income</span>
            <p className="bud-stat-amount bud-stat-amount-balance" style={{ marginTop: 6, fontSize: '1.1rem' }}>
              +${fmt(income)}
            </p>
            <p className="bud-stat-sub">{incomeCount} transaction{incomeCount !== 1 ? 's' : ''}</p>
          </div>
          <div>
            <span className="bud-stat-label">Reimbursed</span>
            <p className="bud-stat-amount" style={{ marginTop: 6, fontSize: '1.1rem', color: '#2dd4bf' }}>
              +${fmt(reimbursements)}
            </p>
            <p className="bud-stat-sub">{reimburseCount} transaction{reimburseCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

      </div>

    </div>
  )
}
