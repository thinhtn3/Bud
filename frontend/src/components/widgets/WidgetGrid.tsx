import React from 'react'

// ── WidgetGrid ────────────────────────────────────────────────────────────────
// 12-column snap grid. Snaps to grid cells using the `cols` prop on WidgetCell.
// Responsive: 12-col on desktop, 6-col on tablet, 1-col on mobile.

interface WidgetGridProps {
  children: React.ReactNode
  className?: string
}

export function WidgetGrid({ children, className = '' }: WidgetGridProps) {
  return (
    <div className={`bud-widget-grid ${className}`}>
      {children}
    </div>
  )
}

// ── WidgetCell ────────────────────────────────────────────────────────────────
// Wrap each widget in a WidgetCell to control its column span within the grid.

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

interface WidgetCellProps {
  children: React.ReactNode
  cols?: ColSpan
  className?: string
}

export function WidgetCell({ children, cols = 6, className = '' }: WidgetCellProps) {
  return (
    <div className={`bud-widget-cell cols-${cols} ${className}`}>
      {children}
    </div>
  )
}
