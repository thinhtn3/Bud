import { useMemo, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Transaction } from '@/types'
import { WidgetSkeleton } from './WidgetSkeleton'
// transactions prop is already filtered to current month by DashboardPage

interface Category {
  id: string
  name: string
}

interface Props {
  transactions: Transaction[]
  loading: boolean
  size?: 'small' | 'medium' | 'large'
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function buildChartData(
  transactions: Transaction[],
  categories: { id: string; name: string }[],
) {
  const relevant = transactions.filter(t => t.type === 'expense' || t.type === 'reimbursement')

  // Resolve category_id → display name first, then group by name.
  // Expenses add to a category total; reimbursements subtract from it.
  const namedTotals: Record<string, number> = {}
  for (const t of relevant) {
    const name = t.category_id
      ? (categories.find(c => c.id === t.category_id)?.name ?? 'Uncategorized')
      : 'Uncategorized'
    const delta = t.type === 'reimbursement' ? -t.amount : t.amount
    namedTotals[name] = (namedTotals[name] ?? 0) + delta
  }

  return Object.entries(namedTotals)
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; amount: number } }[] }) {
  if (!active || !payload?.length) return null
  const { name, amount } = payload[0].payload
  return (
    <div style={{
      background: '#191a1b',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 9,
      padding: '10px 14px',
      boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontFeatureSettings: '"cv01","ss03"',
      pointerEvents: 'none',
    }}>
      <p style={{ fontSize: 11, fontWeight: 510, color: '#62666d', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
        {name}
      </p>
      <p style={{ fontSize: 20, fontWeight: 900, color: '#f7f8f8', letterSpacing: '-0.5px', lineHeight: 1, fontFamily: "'Berkeley Mono','SF Mono','Fira Code',monospace" }}>
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}

// ── Custom Y-axis tick ────────────────────────────────────────────────────────

function CustomYTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const raw = payload?.value ?? ''
  const label = raw.length > 12 ? raw.slice(0, 11) + '…' : raw
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="#8a8f98"
      fontSize={12}
      fontWeight={400}
      fontFamily="'Inter', -apple-system, sans-serif"
    >
      {label}
    </text>
  )
}

// ── X-axis formatter ──────────────────────────────────────────────────────────

function fmtX(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

// ── Bar color — single accent, opacity fades by rank ─────────────────────────

const BAR_BASE = '94, 106, 210' // #5e6ad2 in RGB

function barOpacity(index: number, total: number) {
  const min = 0.5
  const max = 1.0
  if (total <= 1) return max
  return max - (index / (total - 1)) * (max - min)
}

// ── Widget ────────────────────────────────────────────────────────────────────

export function CategoryBreakdownWidget({ transactions, loading, size = 'medium' }: Props) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>(user?.categories ?? [])

  // Fetch fresh categories on mount — ensures the chart resolves correctly
  // even if the auth context has stale data (e.g. after a category table reset).
  useEffect(() => {
    api.get<{ categories: Category[] }>('/api/me')
      .then(data => setCategories(data.categories))
      .catch(() => {}) // fall back to whatever the auth context has
  }, [])

  const data = useMemo(
    () => buildChartData(transactions, categories),
    [transactions, categories],
  )

  const chartHeight = Math.max(data.length * 46, 140)

  // ── Small variant: compact progress-bar rows ─────────────────────────────────
  if (size === 'small') {
    const topData = data.slice(0, 4)
    const max = topData[0]?.amount ?? 1
    return (
      <div className="bud-widget bud-cat-small">
        <p className="bud-widget-label" style={{ marginBottom: 12 }}>By Category</p>

        {loading && <WidgetSkeleton type="category_breakdown" size="small" />}

        {!loading && topData.length === 0 && (
          <p style={{ fontSize: 12, color: '#62666d', padding: '12px 0', textAlign: 'center' }}>
            No expenses this month.
          </p>
        )}

        {!loading && topData.length > 0 && (
          <div className="bud-cat-rows">
            {topData.map((item, i) => {
              const pct = (item.amount / max) * 100
              const opacity = 1 - (i / topData.length) * 0.45
              return (
                <div key={item.name} className="bud-cat-row">
                  <div className="bud-cat-row-label">
                    <span className="bud-cat-row-name">{item.name}</span>
                  </div>
                  <div className="bud-cat-row-bar-track">
                    <div
                      className="bud-cat-row-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: `rgba(${BAR_BASE}, ${opacity})`,
                      }}
                    />
                  </div>
                  <span className="bud-cat-row-amount">
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bud-widget">

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p className="bud-widget-label" style={{ marginBottom: 4 }}>Spending by Category</p>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#62666d', letterSpacing: '-0.13px' }}>
          this month
        </p>
      </div>

      {/* Loading */}
      {loading && <WidgetSkeleton type="category_breakdown" size={size ?? 'medium'} />}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <p style={{ fontSize: 13, color: '#62666d', padding: '24px 0', textAlign: 'center' }}>
          No expenses this month yet.
        </p>
      )}

      {/* Chart */}
      {!loading && data.length > 0 && (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
              barCategoryGap="28%"
            >
              <XAxis
                type="number"
                tickFormatter={fmtX}
                tick={{ fill: '#62666d', fontSize: 11, fontFamily: "'Inter', sans-serif" }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                axisLine={false}
                tickLine={false}
                tick={CustomYTick as React.ComponentType}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }}
              />
              <Bar
                dataKey="amount"
                radius={[0, 5, 5, 0]}
                isAnimationActive
                animationBegin={0}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`rgba(${BAR_BASE}, ${barOpacity(i, data.length)})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}
