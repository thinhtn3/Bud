import { useMemo } from 'react'
import { CreditCard } from 'lucide-react'
import {
  VisaFlatIcon,
  MastercardFlatIcon,
  AmexIcon,
  DiscoverFlatIcon,
} from 'react-svg-credit-card-payment-icons'
import { useAuth } from '@/context/AuthContext'
import type { Transaction, CardAlias } from '@/types'

interface Props {
  transactions: Transaction[]
  loading: boolean
  size?: 'small' | 'medium' | 'large'
}

// ── Network icon ──────────────────────────────────────────────────────────────

function NetworkIcon({ network, size }: { network: string; size: number }) {
  switch (network?.toLowerCase()) {
    case 'visa':        return <VisaFlatIcon width={size} />
    case 'mastercard':  return <MastercardFlatIcon width={size} />
    case 'amex':        return <AmexIcon width={size} />
    case 'discover':    return <DiscoverFlatIcon width={size} />
    default:            return <CreditCard size={size} color="#8a8f98" />
  }
}

// ── Data helpers ──────────────────────────────────────────────────────────────

interface CardRow {
  alias: CardAlias | null
  name: string
  last4: string | null
  network: string
  color: string
  gross: number      // sum of expense amounts
  reimbursed: number // sum of reimbursement amounts
  net: number        // gross − reimbursed (can be negative)
  count: number      // expense tx count only
}

function buildCardData(transactions: Transaction[], cardAliases: CardAlias[]): CardRow[] {
  const totals: Record<string, { gross: number; reimbursed: number; count: number }> = {}

  for (const t of transactions) {
    if (t.type === 'income') continue
    const key = t.card_alias_id ?? '__none__'
    if (!totals[key]) totals[key] = { gross: 0, reimbursed: 0, count: 0 }
    if (t.type === 'expense') {
      totals[key].gross += t.amount
      totals[key].count++
    } else {
      totals[key].reimbursed += t.amount
    }
  }

  const rows: CardRow[] = []

  for (const alias of cardAliases) {
    const data = totals[alias.id]
    // Include any card with activity (gross or reimbursements)
    if (!data || (data.gross === 0 && data.reimbursed === 0)) continue
    rows.push({
      alias,
      name: alias.card_name,
      last4: alias.last4,
      network: alias.card_network,
      color: alias.color || '#5e6ad2',
      gross: data.gross,
      reimbursed: data.reimbursed,
      net: data.gross - data.reimbursed,
      count: data.count,
    })
  }

  // Unassigned — transactions with no card_alias_id
  const unassigned = totals['__none__']
  if (unassigned && (unassigned.gross > 0 || unassigned.reimbursed > 0)) {
    rows.push({
      alias: null,
      name: 'Unassigned',
      last4: null,
      network: '',
      color: '#3a3d42',
      gross: unassigned.gross,
      reimbursed: unassigned.reimbursed,
      net: unassigned.gross - unassigned.reimbursed,
      count: unassigned.count,
    })
  }

  // Spending cards (net > 0) first sorted desc, then gain cards (net ≤ 0) sorted by biggest gain
  return rows.sort((a, b) => {
    const aSpending = a.net > 0
    const bSpending = b.net > 0
    if (aSpending && bSpending) return b.net - a.net
    if (aSpending) return -1
    if (bSpending) return 1
    return a.net - b.net // most negative (biggest gain) first
  })
}

function fmtAmount(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1000) return `$${(abs / 1000).toFixed(1)}k`
  return `$${abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtFull(n: number) {
  return `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function Skeleton({ widths }: { widths: number[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {widths.map((w, i) => (
        <div key={i} style={{
          height: 14, borderRadius: 4,
          background: 'rgba(255,255,255,0.04)',
          width: `${w}%`,
          animation: 'bud-pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  )
}

// ── Shared card row renderer ──────────────────────────────────────────────────

function SpendingRow({ row, pct, shareOfTotal }: {
  row: CardRow
  pct: number
  shareOfTotal: string
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '12px 14px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <NetworkIcon network={row.network} size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 550, color: '#f7f8f8', letterSpacing: '-0.2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.name}
          </p>
          {row.last4 && (
            <p style={{ fontSize: 11, color: '#62666d', marginTop: 1, letterSpacing: '0.04em' }}>···· {row.last4}</p>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f7f8f8', letterSpacing: '-0.4px', lineHeight: 1.2, fontFamily: "'Berkeley Mono','SF Mono','Fira Code',monospace" }}>
            {fmtFull(row.net)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 1, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 11, color: '#62666d', letterSpacing: '0.02em' }}>
              {shareOfTotal}% · {row.count} tx
            </p>
            {row.reimbursed > 0 && (
              <p style={{ fontSize: 11, color: '#2dd4bf', letterSpacing: '0.02em' }}>
                +{fmtFull(row.reimbursed)} back
              </p>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: row.color, transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
      </div>
    </div>
  )
}

function GainRow({ row, pct }: { row: CardRow; pct: number }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '12px 14px',
      borderRadius: 10,
      background: 'rgba(45, 212, 191, 0.05)',
      border: '1px solid rgba(45, 212, 191, 0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <NetworkIcon network={row.network} size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 550, color: '#f7f8f8', letterSpacing: '-0.2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.name}
          </p>
          {row.last4 && (
            <p style={{ fontSize: 11, color: '#62666d', marginTop: 1, letterSpacing: '0.04em' }}>···· {row.last4}</p>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#2dd4bf', letterSpacing: '-0.4px', lineHeight: 1.2, fontFamily: "'Berkeley Mono','SF Mono','Fira Code',monospace" }}>
            +{fmtFull(row.net)}
          </p>
          <p style={{ fontSize: 11, color: '#62666d', marginTop: 1, letterSpacing: '0.02em' }}>
            {row.gross > 0 ? `${fmtFull(row.gross)} spent · ` : ''}{fmtFull(row.reimbursed)} back
          </p>
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(45,212,191,0.12)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: '#2dd4bf', transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
      </div>
    </div>
  )
}

// ── Widget ────────────────────────────────────────────────────────────────────

export function CardSpendingWidget({ transactions, loading, size = 'medium' }: Props) {
  const { user } = useAuth()
  const cardAliases = user?.card_aliases ?? []

  const rows = useMemo(
    () => buildCardData(transactions, cardAliases),
    [transactions, cardAliases],
  )

  const spendingRows = rows.filter(r => r.net > 0)
  const gainRows     = rows.filter(r => r.net <= 0)

  const maxSpendNet  = spendingRows[0]?.net ?? 1
  const maxGainAbs   = Math.abs(gainRows[0]?.net ?? 1)
  const totalNet     = spendingRows.reduce((s, r) => s + r.net, 0)
  const totalReim    = rows.reduce((s, r) => s + r.reimbursed, 0)
  const hasCards     = cardAliases.length > 0

  // ── Small variant ─────────────────────────────────────────────────────────────
  if (size === 'small') {
    const allRows  = rows.slice(0, 4)
    const smallMax = Math.max(...allRows.map(r => Math.abs(r.net)), 1)
    return (
      <div className="bud-widget bud-cat-small">
        <p className="bud-widget-label" style={{ marginBottom: 12 }}>By Card</p>

        {loading && <Skeleton widths={[90, 65, 45, 30]} />}

        {!loading && !hasCards && (
          <p style={{ fontSize: 12, color: '#62666d', padding: '12px 0', textAlign: 'center' }}>
            No cards linked yet.
          </p>
        )}

        {!loading && hasCards && allRows.length === 0 && (
          <p style={{ fontSize: 12, color: '#62666d', padding: '12px 0', textAlign: 'center' }}>
            No spending this month.
          </p>
        )}

        {!loading && allRows.length > 0 && (
          <div className="bud-cat-rows">
            {allRows.map((row) => {
              const isGain = row.net <= 0
              const pct    = (Math.abs(row.net) / smallMax) * 100
              return (
                <div key={row.alias?.id ?? '__none__'} className="bud-cat-row">
                  <div className="bud-cat-row-label" style={{ gap: 6, display: 'flex', alignItems: 'center' }}>
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                      <NetworkIcon network={row.network} size={14} />
                    </span>
                    <span className="bud-cat-row-name">{row.name}</span>
                  </div>
                  <div className="bud-cat-row-bar-track">
                    <div
                      className="bud-cat-row-bar-fill"
                      style={{ width: `${pct}%`, background: isGain ? '#2dd4bf' : row.color }}
                    />
                  </div>
                  <span className="bud-cat-row-amount" style={isGain ? { color: '#2dd4bf' } : undefined}>
                    {isGain ? '+' : ''}{fmtAmount(row.net)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Medium / Large variant ────────────────────────────────────────────────────
  return (
    <div className="bud-widget">

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p className="bud-widget-label" style={{ marginBottom: 4 }}>Spending by Card</p>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#62666d', letterSpacing: '-0.13px' }}>
          this month
        </p>
      </div>

      {/* Total — shown when there's spending data */}
      {!loading && totalNet > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 28, fontWeight: 800, color: '#f7f8f8',
            letterSpacing: '-1px', lineHeight: 1,
            fontFamily: "'Berkeley Mono','SF Mono','Fira Code',monospace",
          }}>
            {fmtFull(totalNet)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 11, color: '#62666d', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 510 }}>
              net spending · {spendingRows.length} {spendingRows.length === 1 ? 'card' : 'cards'}
            </p>
            {totalReim > 0 && (
              <p style={{ fontSize: 11, color: '#2dd4bf', letterSpacing: '0.02em', fontWeight: 510 }}>
                +{fmtFull(totalReim)} reimbursed
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <Skeleton widths={[80, 60, 45, 35]} />}

      {/* No cards */}
      {!loading && !hasCards && (
        <div style={{ padding: '28px 0', textAlign: 'center' }}>
          <CreditCard size={28} color="#3a3d42" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: '#62666d' }}>No cards linked yet.</p>
          <p style={{ fontSize: 12, color: '#3a3d42', marginTop: 4 }}>
            Add cards in your preferences to track spending per card.
          </p>
        </div>
      )}

      {/* No activity */}
      {!loading && hasCards && rows.length === 0 && (
        <p style={{ fontSize: 13, color: '#62666d', padding: '24px 0', textAlign: 'center' }}>
          No card spending this month yet.
        </p>
      )}

      {/* Spending section */}
      {!loading && spendingRows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {spendingRows.map((row) => {
            const pct          = (row.net / maxSpendNet) * 100
            const shareOfTotal = totalNet > 0 ? ((row.net / totalNet) * 100).toFixed(0) : '0'
            return (
              <SpendingRow key={row.alias?.id ?? '__none__'} row={row} pct={pct} shareOfTotal={shareOfTotal} />
            )
          })}
        </div>
      )}

      {/* Gain section — cards where reimbursements exceeded spending */}
      {!loading && gainRows.length > 0 && (
        <>
          {spendingRows.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <p style={{ fontSize: 10, fontWeight: 510, color: '#62666d', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                Net Gains
              </p>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gainRows.map((row) => {
              const pct = (Math.abs(row.net) / maxGainAbs) * 100
              return (
                <GainRow key={row.alias?.id ?? '__none__'} row={row} pct={pct} />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
