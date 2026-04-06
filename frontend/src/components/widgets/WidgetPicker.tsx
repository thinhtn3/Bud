import { useState, useEffect } from 'react'
import { WIDGET_REGISTRY, type WidgetType, type WidgetSize, type WidgetInstance } from './widgetRegistry'

interface Props {
  open: boolean
  activeWidgets: WidgetInstance[]
  onAdd: (type: WidgetType, size: WidgetSize) => void
  onClose: () => void
}

const SIZE_META: Record<WidgetSize, { label: string; blocks: number }> = {
  small:  { label: 'Small',  blocks: 1 },
  medium: { label: 'Medium', blocks: 2 },
  large:  { label: 'Large',  blocks: 4 },
}

function SizePreview({ size }: { size: WidgetSize }) {
  const { blocks } = SIZE_META[size]
  return (
    <div className="bud-picker-size-preview">
      {Array.from({ length: blocks }, (_, i) => (
        <span key={i} style={{ width: 14 }} />
      ))}
    </div>
  )
}

export function WidgetPicker({ open, activeWidgets, onAdd, onClose }: Props) {
  const [expanded, setExpanded] = useState<WidgetType | null>(null)
  const activeTypes = new Set(activeWidgets.map(w => w.type))

  useEffect(() => {
    if (!open) { setExpanded(null); return }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handleItemClick(type: WidgetType, sizes: WidgetSize[], defaultSize: WidgetSize) {
    if (activeTypes.has(type)) return
    if (sizes.length === 1) {
      onAdd(type, defaultSize)
      onClose()
    } else {
      setExpanded(expanded === type ? null : type)
    }
  }

  function handleSizeClick(type: WidgetType, size: WidgetSize) {
    onAdd(type, size)
    onClose()
  }

  return (
    <>
      <div
        className={`bud-picker-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`bud-picker-panel ${open ? 'open' : ''}`}
        role="dialog"
        aria-label="Add widget"
      >
        <div className="bud-picker-header">
          <p className="bud-picker-title">Add Widget</p>
          <button className="bud-picker-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="bud-picker-hint">Select a widget to add to your dashboard.</p>

        <div className="bud-picker-list">
          {WIDGET_REGISTRY.map(def => {
            const added = activeTypes.has(def.type)
            const isExpanded = expanded === def.type
            return (
              <div key={def.type}>
                <button
                  className={`bud-picker-item ${added ? 'added' : ''}`}
                  onClick={() => handleItemClick(def.type, def.sizes, def.defaultSize)}
                  disabled={added}
                >
                  <div className="bud-picker-item-body">
                    <p className="bud-picker-item-label">{def.label}</p>
                    <p className="bud-picker-item-desc">{def.description}</p>
                  </div>
                  <span className="bud-picker-item-action">
                    {added ? 'Added' : def.sizes.length === 1 ? '+ Add' : isExpanded ? '▾' : 'Choose size'}
                  </span>
                </button>

                {/* Size options — shown when expanded (multi-size widgets) */}
                {isExpanded && !added && (
                  <div className="bud-picker-sizes">
                    {def.sizes.map(size => (
                      <button
                        key={size}
                        className="bud-picker-size-btn"
                        onClick={() => handleSizeClick(def.type, size)}
                      >
                        <SizePreview size={size} />
                        <span className="bud-picker-size-label">{SIZE_META[size].label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
