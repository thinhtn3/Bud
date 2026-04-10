import { useMemo } from 'react'
import { Tag } from 'lucide-react'
import type { GroupExpense } from '../../types'
import { getCategoryIcon } from '../widgets/categoryIcons'

interface Props {
  expenses: GroupExpense[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// ── Component ─────────────────────────────────────────────────────────────────

export default function GroupCategoryBreakdown({ expenses }: Props) {
  const data = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const e of expenses) {
      const name = e.category_name ?? 'Uncategorized'
      totals[name] = (totals[name] ?? 0) + e.amount
    }
    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses])

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const max = data[0]?.amount ?? 1

  if (data.length === 0) {
    return (
      <div style={{
        background: 'rgba(247,248,248,0.025)',
        border: '1px solid rgba(247,248,248,0.08)',
        borderRadius: 16,
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 100,
      }}>
        <Tag size={14} strokeWidth={1.5} />
        <p style={{ fontSize: 13, color: 'rgba(247,248,248,0.35)', textAlign: 'center' }}>
          No expenses to break down yet
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(247,248,248,0.025)',
      border: '1px solid rgba(247,248,248,0.08)',
      borderRadius: 16,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div className="group-section-header" style={{ margin: 0 }}>Spending by Category</div>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#f7f8f8',
          letterSpacing: '-0.4px',
          fontFamily: "'Berkeley Mono','SF Mono',monospace",
        }}>
          {fmt(total)}
        </span>
      </div>

      {/* Category rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map(({ name, amount }) => {
          const pct = (amount / total) * 100
          const barW = (amount / max) * 100
          const Icon = getCategoryIcon(name)
          return (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 510, color: 'rgba(247,248,248,0.75)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: 'rgba(247,248,248,0.4)', display: 'flex', alignItems: 'center' }}>
                    <Icon size={14} strokeWidth={1.5} />
                  </span>
                  {name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(247,248,248,0.3)' }}>{pct.toFixed(0)}%</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(247,248,248,0.85)',
                    fontFamily: "'Berkeley Mono','SF Mono',monospace",
                    minWidth: 64,
                    textAlign: 'right',
                  }}>
                    {fmt(amount)}
                  </span>
                </div>
              </div>
              <div style={{ height: 3, background: 'rgba(247,248,248,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${barW}%`,
                  background: '#9fe870',
                  borderRadius: 9999,
                  opacity: 0.65,
                  transition: 'width 0.4s cubic-bezier(.16,1,.3,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
