import { useEffect } from 'react'
import { WIDGET_REGISTRY, type WidgetType, type WidgetInstance } from './widgetRegistry'

interface Props {
  open: boolean
  activeWidgets: WidgetInstance[]
  onAdd: (type: WidgetType) => void
  onClose: () => void
}

export function WidgetPicker({ open, activeWidgets, onAdd, onClose }: Props) {
  const activeTypes = new Set(activeWidgets.map(w => w.type))

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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

        <p className="bud-picker-hint">Select a widget to add it to your dashboard.</p>

        <div className="bud-picker-list">
          {WIDGET_REGISTRY.map(def => {
            const added = activeTypes.has(def.type)
            return (
              <button
                key={def.type}
                className={`bud-picker-item ${added ? 'added' : ''}`}
                onClick={() => { if (!added) { onAdd(def.type); onClose() } }}
                disabled={added}
              >
                <div className="bud-picker-item-body">
                  <p className="bud-picker-item-label">{def.label}</p>
                  <p className="bud-picker-item-desc">{def.description}</p>
                </div>
                <span className="bud-picker-item-action">
                  {added ? 'Added' : '+ Add'}
                </span>
              </button>
            )
          })}
        </div>
      </aside>
    </>
  )
}
