import { useState } from 'react'
import type { Transaction } from '@/types'
import { parseLocalDate } from '@/lib/dateUtils'

type Period = 'biweekly' | 'monthly'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'biweekly', label: 'Biweekly' },
  { key: 'monthly',  label: 'Monthly' },
]

// Biweekly = first half (1–15) or second half (16–end).
// For the current month, splits based on today's date; for past months, defaults to second half.
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

// Budget scaling: biweekly = half of monthly
function deriveBudget(amount: number, storedPeriod: string, viewPeriod: Period): number {
  const monthly = storedPeriod === 'monthly'   ? amount
                : storedPeriod === 'biweekly'  ? amount * 2
                : amount * 4 // stored weekly (legacy)

  return viewPeriod === 'biweekly' ? monthly / 2 : monthly
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
  transactions: Transaction[]       // selected month — used for stat cards
  allTransactions: Transaction[]    // selected month — used for period spending card
  loading: boolean
  size?: 'small' | 'medium' | 'large'
  budgetAmount?: number
  budgetPeriod?: string
  viewYear: number
  viewMonth: number
}

export function SpendingSummaryWidget({ transactions, allTransactions, loading, size = 'large', budgetAmount, budgetPeriod, viewYear, viewMonth }: Props) {
  const [period, setPeriod] = useState<Period>('biweekly')

  const totalIncome         = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalReimbursements = transactions.filter(t => t.type === 'reimbursement').reduce((s, t) => s + t.amount, 0)
  const totalExpenses       = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netExpenses         = totalExpenses - totalReimbursements
  const net                 = totalIncome + totalReimbursements - totalExpenses

  const periodTxs            = filterByPeriod(allTransactions, period, viewYear, viewMonth)
  const periodExpenses       = periodTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const periodReimbursements = periodTxs.filter(t => t.type === 'reimbursement').reduce((s, t) => s + t.amount, 0)
  const netPeriodExpenses    = periodExpenses - periodReimbursements
  const periodCount          = periodTxs.filter(t => t.type === 'expense').length

  const expenseCount        = transactions.filter(t => t.type === 'expense').length
  const reimbursementCount  = transactions.filter(t => t.type === 'reimbursement').length
  const incomeCount         = transactions.filter(t => t.type === 'income').length

  const hasBudget    = !!budgetAmount && budgetAmount > 0 && !!budgetPeriod
  const periodBudget = hasBudget ? deriveBudget(budgetAmount!, budgetPeriod!, period) : null
  const budgetPct    = periodBudget ? Math.min(netPeriodExpenses / periodBudget, 1) : null
  const overBudget   = periodBudget !== null && netPeriodExpenses > periodBudget

  function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const rowClass = size === 'small'
    ? 'bud-stat-row bud-stat-row--vertical'
    : size === 'medium'
      ? 'bud-stat-row bud-stat-row--grid'
      : 'bud-stat-row'

  if (loading) {
    return (
      <div className={rowClass}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bud-stat-card bud-stat-skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className={rowClass}>

      {/* Net Balance */}
      <div className="bud-stat-card bud-stat-balance">
        <div className="bud-stat-top">
          <span className="bud-stat-label">Net Balance</span>
          <span className="bud-stat-icon bud-stat-icon-balance">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 6.5h12" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="4" cy="9.5" r="1" fill="currentColor"/>
            </svg>
          </span>
        </div>
        <p className={`bud-stat-amount ${net >= 0 ? 'bud-stat-amount-balance' : 'bud-stat-amount-expense'}`}>
          {net < 0 ? '−' : ''}${fmt(Math.abs(net))}
        </p>
        <p className="bud-stat-sub">this month</p>
      </div>

      {/* Total Expenses */}
      <div className="bud-stat-card bud-stat-expense">
        <div className="bud-stat-top">
          <span className="bud-stat-label">Gross Expenses</span>
          <span className="bud-stat-icon bud-stat-icon-expense">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 9l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <p className="bud-stat-amount bud-stat-amount-expense">−${fmt(totalExpenses)}</p>
        <p className="bud-stat-sub">{expenseCount} transaction{expenseCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Income & Reimbursements */}
      <div className="bud-stat-card bud-stat-income">
        <p className="bud-stat-label" style={{ marginBottom: 14 }}>Income & Reimbursed</p>
        <div className="bud-inco-rows">
          <div className="bud-inco-row">
            <span className="bud-inco-label bud-inco-label-income">Income</span>
            <span className="bud-inco-amount bud-inco-amount-income">+${fmt(totalIncome)}</span>
            <span className="bud-stat-sub">{incomeCount} transaction{incomeCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="bud-inco-row">
            <span className="bud-inco-label bud-inco-label-reimburse">Reimbursed</span>
            <span className="bud-inco-amount bud-inco-amount-reimburse">+${fmt(totalReimbursements)}</span>
            <span className="bud-stat-sub">{reimbursementCount} transaction{reimbursementCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Period Spending */}
      <div className="bud-stat-card bud-stat-count">
        <div className="bud-stat-top">
          <span className="bud-stat-label">Net Spending</span>
          <span className="bud-stat-icon bud-stat-icon-count">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 7h6M4 4.5h3M4 9.5h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        <div className="bud-period-chips">
          {PERIODS.map(p => (
            <button
              key={p.key}
              className={`bud-period-chip ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className={`bud-stat-amount ${overBudget ? 'bud-stat-amount-expense' : 'bud-stat-amount-count'}`}>
          −${fmt(netPeriodExpenses)}
        </p>
        {periodBudget !== null ? (
          <>
            <div className="bud-budget-bar-wrap">
              <div
                className={`bud-budget-bar-fill ${overBudget ? 'bud-budget-bar-over' : ''}`}
                style={{ width: `${(budgetPct! * 100).toFixed(1)}%` }}
              />
            </div>
            <p className="bud-stat-sub">
              {overBudget ? 'over budget · ' : ''}of ${fmt(periodBudget)} · {periodCount} expense{periodCount !== 1 ? 's' : ''} · {periodLabel(period, viewYear, viewMonth)}
            </p>
          </>
        ) : (
          <p className="bud-stat-sub">{periodCount} expense{periodCount !== 1 ? 's' : ''} · {periodLabel(period, viewYear, viewMonth)}</p>
        )}
      </div>

    </div>
  )
}
