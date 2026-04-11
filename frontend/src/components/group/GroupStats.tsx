import { useMemo } from 'react'
import type { GroupExpense, GroupMember } from '../../types'
import { getCategoryIcon } from '../widgets/categoryIcons'

interface Props {
  expenses: GroupExpense[]
  currentUserId: string
  members: GroupMember[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const mono = "'Berkeley Mono','SF Mono','Fira Code',monospace"

const card: React.CSSProperties = {
  background: 'rgba(247,248,248,0.025)',
  border: '1px solid rgba(247,248,248,0.08)',
  borderRadius: 16,
  padding: '16px 18px',
}

const sectionLabel: React.CSSProperties = {
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'rgba(247,248,248,0.28)',
  marginBottom: 14,
}

function initial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? '?'
}

function Avatar({ name, isYou }: { name: string; isYou: boolean }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%',
      background: isYou ? 'rgba(159,232,112,0.12)' : 'rgba(247,248,248,0.07)',
      border: `1px solid ${isYou ? 'rgba(159,232,112,0.25)' : 'rgba(247,248,248,0.1)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 8, fontWeight: 700,
      color: isYou ? '#9fe870' : 'rgba(247,248,248,0.5)',
      flexShrink: 0,
    }}>
      {initial(name)}
    </div>
  )
}

function Bar({ pct, green }: { pct: number; green?: boolean }) {
  return (
    <div style={{ height: 3, background: 'rgba(247,248,248,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: green ? '#9fe870' : 'rgba(247,248,248,0.28)',
        borderRadius: 9999,
        opacity: 0.7,
        transition: 'width 0.45s cubic-bezier(.16,1,.3,1)',
      }} />
    </div>
  )
}

export default function GroupStats({ expenses, currentUserId, members }: Props) {
  const totalSpend = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const avgExpense = expenses.length > 0 ? totalSpend / expenses.length : 0
  const largestExpense = useMemo(
    () => expenses.reduce<GroupExpense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null),
    [expenses]
  )

  // Actual spend per member = sum of their split amounts across all expenses
  const actualSpend = useMemo(() => {
    const map: Record<string, { name: string; spent: number }> = {}
    for (const m of members) {
      map[m.user_id] = { name: m.display_name, spent: 0 }
    }
    for (const e of expenses) {
      for (const s of e.splits) {
        if (!map[s.user_id]) map[s.user_id] = { name: s.display_name || 'Unknown', spent: 0 }
        map[s.user_id].spent += s.amount
      }
    }
    return Object.entries(map)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.spent - a.spent)
  }, [expenses, members])
  const maxSpent = actualSpend[0]?.spent ?? 1

  // Your spending = sum of your split amounts
  const yourSpending = useMemo(
    () => expenses.reduce((s, e) => {
      const split = e.splits.find(sp => sp.user_id === currentUserId)
      return s + (split?.amount ?? 0)
    }, 0),
    [expenses, currentUserId]
  )

  const categoryData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {}
    for (const e of expenses) {
      const name = e.category_name ?? 'Uncategorized'
      if (!map[name]) map[name] = { amount: 0, count: 0 }
      map[name].amount += e.amount
      map[name].count += 1
    }
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses])
  const maxCatAmount = categoryData[0]?.amount ?? 1

  if (expenses.length === 0) {
    return (
      <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 10 }}>
        <div style={{ fontSize: 26, opacity: 0.5 }}>📊</div>
        <p style={{ fontSize: 13, color: 'rgba(247,248,248,0.3)', margin: 0 }}>Add expenses to see group stats.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Overview tiles ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { label: 'Total Spend', value: fmt(totalSpend), sub: null },
          { label: 'Your Spending', value: fmt(yourSpending), sub: null },
          { label: 'Avg Expense', value: fmt(avgExpense), sub: null },
          { label: 'Largest', value: largestExpense ? fmt(largestExpense.amount) : '—', sub: largestExpense?.name ?? null },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{
            background: 'rgba(247,248,248,0.025)',
            border: '1px solid rgba(247,248,248,0.08)',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}>
            <div style={{ ...sectionLabel, marginBottom: 0 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: label === 'Your Spending' ? '#9fe870' : '#f7f8f8', fontFamily: mono, letterSpacing: '-0.3px' }}>
              {value}
            </div>
            {sub && (
              <div style={{ fontSize: 10.5, color: 'rgba(247,248,248,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Actual spend + By category ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Actual spend */}
        <div style={card}>
          <div style={sectionLabel}>Actual spend</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actualSpend.map(({ userId, name, spent }) => {
              const isYou = userId === currentUserId
              return (
                <div key={userId}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <Avatar name={name} isYou={isYou} />
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: isYou ? 'rgba(247,248,248,0.9)' : 'rgba(247,248,248,0.65)', whiteSpace: 'nowrap' }}>
                        {isYou ? 'You' : name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: 'rgba(247,248,248,0.28)' }}>
                        {totalSpend > 0 ? ((spent / totalSpend) * 100).toFixed(0) : 0}%
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: mono, color: spent > 0 ? 'rgba(247,248,248,0.85)' : 'rgba(247,248,248,0.25)', minWidth: 56, textAlign: 'right' }}>
                        {spent > 0 ? fmt(spent) : '—'}
                      </span>
                    </div>
                  </div>
                  <Bar pct={(spent / maxSpent) * 100} green={isYou} />
                </div>
              )
            })}
          </div>
        </div>

        {/* By category */}
        <div style={card}>
          <div style={sectionLabel}>By category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryData.map(({ name, amount, count }) => {
              const Icon = getCategoryIcon(name)
              return (
                <div key={name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(247,248,248,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'rgba(247,248,248,0.38)', display: 'flex', alignItems: 'center' }}>
                        <Icon size={13} strokeWidth={1.5} />
                      </span>
                      {name}
                      <span style={{ fontSize: 10, color: 'rgba(247,248,248,0.22)' }}>{count}</span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: 'rgba(247,248,248,0.28)' }}>
                        {totalSpend > 0 ? ((amount / totalSpend) * 100).toFixed(0) : 0}%
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: mono, color: 'rgba(247,248,248,0.85)', minWidth: 56, textAlign: 'right' }}>
                        {fmt(amount)}
                      </span>
                    </div>
                  </div>
                  <Bar pct={(amount / maxCatAmount) * 100} green />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
