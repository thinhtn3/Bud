import type { WidgetType, WidgetSize } from './widgetRegistry'

interface Props {
  type: WidgetType
  size: WidgetSize
}

function Skel({ w, h, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div
      className="bud-skel"
      style={{ width: w ?? '100%', height: h ?? 14, borderRadius: r, flexShrink: 0 }}
    />
  )
}

function SkelCircle({ size }: { size: number }) {
  return <div className="bud-skel-circle" style={{ width: size, height: size }} />
}

function SkelHeader({ short = false }: { short?: boolean }) {
  return (
    <div className="bud-widget-skel-header">
      <Skel w={short ? 90 : 120} h={11} r={6} />
    </div>
  )
}

function SpendingSummarySkeleton() {
  return (
    <div className="bud-stat-card bud-stat-skeleton" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Two toggle rows stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Skel w={56} h={26} r={20} />
          <Skel w={68} h={26} r={20} />
          <Skel w={64} h={26} r={20} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Skel w={46} h={26} r={20} />
          <Skel w={52} h={26} r={20} />
        </div>
      </div>
      {/* Spending (left) + Income/Reimbursed (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, flex: 1 }}>
        <div style={{ paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w={90} h={10} r={5} />
          <Skel w="70%" h={28} r={6} />
          <Skel w={120} h={9} r={5} />
        </div>
        <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skel w={60} h={10} r={5} />
              <Skel w="75%" h={20} r={5} />
              <Skel w={70} h={9} r={5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


function RecentTransactionsSkeleton() {
  return (
    <div className="bud-widget-skel">
      <SkelHeader />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Date label row */}
        <Skel w={60} h={10} r={5} />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}
          >
            <SkelCircle size={32} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skel w={`${55 + (i % 3) * 15}%`} h={12} />
              <Skel w={`${30 + (i % 2) * 20}%`} h={10} />
            </div>
            <Skel w={52} h={14} r={6} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AddTransactionSkeleton({ size }: { size: WidgetSize }) {
  const isSmall = size === 'small'
  return (
    <div className="bud-widget-skel">
      <SkelHeader />
      {/* Toggle */}
      <Skel w="100%" h={36} r={10} />
      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skel w="100%" h={38} r={8} />
        {isSmall ? (
          <>
            <Skel w="100%" h={38} r={8} />
            <Skel w="100%" h={38} r={8} />
          </>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Skel w="50%" h={38} r={8} />
            <Skel w="50%" h={38} r={8} />
          </div>
        )}
        <Skel w="100%" h={38} r={8} />
      </div>
      {/* Submit button */}
      <Skel w="100%" h={38} r={8} />
    </div>
  )
}

function QuickAddSkeleton({ size }: { size: WidgetSize }) {
  const isSmall = size === 'small'
  if (isSmall) {
    return (
      <div className="bud-widget-skel">
        <SkelHeader short />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <Skel key={i} w="100%" h={28} r={8} />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="bud-widget-skel">
      <SkelHeader short />
      {/* Recurring section */}
      <Skel w={70} h={10} r={5} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SkelCircle size={28} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Skel w={`${50 + i * 10}%`} h={11} />
              <Skel w={`${30 + i * 8}%`} h={9} />
            </div>
            <Skel w={44} h={12} r={6} />
          </div>
        ))}
      </div>
      {/* Recent section */}
      <Skel w={50} h={10} r={5} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SkelCircle size={28} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Skel w={`${45 + i * 12}%`} h={11} />
              <Skel w={`${25 + i * 10}%`} h={9} />
            </div>
            <Skel w={44} h={12} r={6} />
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryBreakdownSkeleton({ size }: { size: WidgetSize }) {
  const isSmall = size === 'small'
  const bars = isSmall
    ? [90, 65, 45, 30]
    : [80, 60, 45, 35, 25]

  if (isSmall) {
    return (
      <div className="bud-widget-skel">
        <SkelHeader />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bars.map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skel w={`${40 + i * 8}%`} h={10} r={5} />
                <Skel w={44} h={10} r={5} />
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  className="bud-skel"
                  style={{ width: `${w}%`, height: '100%', borderRadius: 4 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bud-widget-skel">
      <SkelHeader />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
        {bars.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skel w={`${20 + i * 5}%`} h={11} r={5} />
            <div style={{ flex: 1, height: 18, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
              <div
                className="bud-skel"
                style={{ width: `${w}%`, height: '100%', borderRadius: 6 }}
              />
            </div>
            <Skel w={50} h={11} r={5} />
          </div>
        ))}
      </div>
    </div>
  )
}

function CardSpendingSkeleton({ size }: { size: WidgetSize }) {
  const isSmall = size === 'small'

  if (isSmall) {
    return (
      <div className="bud-widget-skel">
        <SkelHeader />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[90, 65, 45, 30].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SkelCircle size={20} />
              <Skel w={`${30 + i * 6}%`} h={10} r={5} />
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                <div className="bud-skel" style={{ width: `${w}%`, height: '100%', borderRadius: 4 }} />
              </div>
              <Skel w={48} h={10} r={5} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bud-widget-skel">
      {/* Header with total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Skel w={100} h={11} r={5} />
        <Skel w={70} h={22} r={8} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[80, 60, 45, 35].map((barW, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SkelCircle size={28} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skel w={`${40 + i * 8}%`} h={12} />
                <Skel w={`${25 + i * 5}%`} h={10} />
              </div>
              <Skel w={58} h={16} r={6} />
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
              <div className="bud-skel" style={{ width: `${barW}%`, height: '100%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetSkeleton({ type, size }: Props) {
  switch (type) {
    case 'spending_summary':
      return <SpendingSummarySkeleton />
    case 'recent_transactions':
      return <RecentTransactionsSkeleton />
    case 'add_transaction':
      return <AddTransactionSkeleton size={size} />
    case 'quick_add':
      return <QuickAddSkeleton size={size} />
    case 'category_breakdown':
      return <CategoryBreakdownSkeleton size={size} />
    case 'card_spending':
      return <CardSpendingSkeleton size={size} />
    default:
      return <div className="bud-widget-skel"><SkelHeader /></div>
  }
}
