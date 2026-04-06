import React from 'react'
import type { WidgetSize } from './widgetRegistry'

interface WidgetGridProps {
  children: React.ReactNode
  className?: string
}

export const WidgetGrid = React.forwardRef<HTMLDivElement, WidgetGridProps>(
  ({ children, className = '' }, ref) => (
    <div ref={ref} className={`bud-widget-grid ${className}`}>
      {children}
    </div>
  ),
)

interface WidgetCellProps {
  children: React.ReactNode
  size?: WidgetSize
  className?: string
  cellRef?: (el: HTMLDivElement | null) => void
}

export function WidgetCell({ children, size = 'medium', className = '', cellRef }: WidgetCellProps) {
  return (
    <div ref={cellRef} className={`bud-widget-cell size-${size} ${className}`}>
      {children}
    </div>
  )
}
