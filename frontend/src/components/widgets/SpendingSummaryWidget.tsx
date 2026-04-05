import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  loading: boolean
}

export function SpendingSummaryWidget({ transactions, loading }: Props) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const net = totalIncome - totalExpenses
  const incomeCount = transactions.filter(t => t.type === 'income').length
  const expenseCount = transactions.filter(t => t.type === 'expense').length

  function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <div className="bud-widget">
        <p className="bud-tx-loading">Loading summary…</p>
      </div>
    )
  }

  return (
    <div className="bud-widget">
      <div className="bud-summary-grid">
        <div className="bud-summary-item">
          <p className="bud-summary-label">Income</p>
          <p className="bud-summary-amount income">+${fmt(totalIncome)}</p>
          <p className="bud-summary-sub">{incomeCount} transaction{incomeCount !== 1 ? 's' : ''}</p>
        </div>

        <div className="bud-summary-item">
          <p className="bud-summary-label">Expenses</p>
          <p className="bud-summary-amount expense">−${fmt(totalExpenses)}</p>
          <p className="bud-summary-sub">{expenseCount} transaction{expenseCount !== 1 ? 's' : ''}</p>
        </div>

        <div className="bud-summary-item">
          <p className="bud-summary-label">Net Balance</p>
          <p className={`bud-summary-amount ${net >= 0 ? 'neutral' : 'negative'}`}>
            {net >= 0 ? '' : '−'}${fmt(Math.abs(net))}
          </p>
          <p className="bud-summary-sub">{net >= 0 ? 'positive cashflow' : 'negative cashflow'}</p>
        </div>
      </div>
    </div>
  )
}
