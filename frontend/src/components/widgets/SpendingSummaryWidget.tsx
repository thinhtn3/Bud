import { useState } from 'react'
import type { Transaction } from '@/types'

type Period = 'week' | 'month' | '30d' | '90d'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',  label: 'This wk' },
  { key: 'month', label: 'This mo' },
  { key: '30d',   label: '30d' },
  { key: '90d',   label: '90d' },
]

function startOfPeriod(period: Period): Date {
  const now = new Date()
  if (period === 'week') {
    const d = new Date(now)
    const day = d.getDay() // 0 = Sun
    const diff = day === 0 ? 6 : day - 1 // shift so Mon = 0
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  const days = period === '30d' ? 30 : 90
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

function filterByPeriod(txs: Transaction[], period: Period): Transaction[] {
  const cutoff = startOfPeriod(period)
  return txs.filter(t => new Date(t.date) >= cutoff)
}

function periodLabel(period: Period): string {
  if (period === 'week')  return 'this week'
  if (period === 'month') return 'this month'
  if (period === '30d')   return 'last 30 days'
  return 'last 90 days'
}

interface Props {
  transactions: Transaction[]
  loading: boolean
  size?: 'small' | 'medium' | 'large'
}

export function SpendingSummaryWidget({ transactions, loading, size = 'large' }: Props) {
  const [period, setPeriod] = useState<Period>('week')

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net           = totalIncome - totalExpenses

  const periodTxs      = filterByPeriod(transactions, period)
  const periodExpenses = periodTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const periodCount    = periodTxs.filter(t => t.type === 'expense').length

  const incomeCount  = transactions.filter(t => t.type === 'income').length
  const expenseCount = transactions.filter(t => t.type === 'expense').length

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
        {[0, 1, 2, 3].map(i => (
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
        <p className="bud-stat-sub">all time</p>
      </div>

      {/* Total Expenses */}
      <div className="bud-stat-card bud-stat-expense">
        <div className="bud-stat-top">
          <span className="bud-stat-label">Total Expenses</span>
          <span className="bud-stat-icon bud-stat-icon-expense">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 9l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <p className="bud-stat-amount bud-stat-amount-expense">−${fmt(totalExpenses)}</p>
        <p className="bud-stat-sub">{expenseCount} transaction{expenseCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Total Income */}
      <div className="bud-stat-card bud-stat-income">
        <div className="bud-stat-top">
          <span className="bud-stat-label">Total Income</span>
          <span className="bud-stat-icon bud-stat-icon-income">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M3 5l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <p className="bud-stat-amount bud-stat-amount-income">+${fmt(totalIncome)}</p>
        <p className="bud-stat-sub">{incomeCount} transaction{incomeCount !== 1 ? 's' : ''}</p>
      </div>

      {/* Period Spending */}
      <div className="bud-stat-card bud-stat-count">
        <div className="bud-stat-top">
          <span className="bud-stat-label">Spending</span>
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
        <p className="bud-stat-amount bud-stat-amount-count">−${fmt(periodExpenses)}</p>
        <p className="bud-stat-sub">{periodCount} expense{periodCount !== 1 ? 's' : ''} · {periodLabel(period)}</p>
      </div>

    </div>
  )
}
