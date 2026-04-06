import {
  useState, useRef, useEffect, useCallback,
  type ReactNode, type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import './Dropdown.css'

// ── Types ─────────────────────────────────────────────────────────────────────

export type DropdownOption =
  | {
      type?: 'option'
      value: string
      label: string
      variant?: 'default' | 'danger'
      disabled?: boolean
      icon?: ReactNode
    }
  | { type: 'divider' }
  | { type: 'label'; label: string }

export interface DropdownProps {
  /** The list of options, dividers, and section labels to render. */
  options: DropdownOption[]
  /** Controlled selected value. */
  value?: string
  /** Called when a new option is selected. */
  onChange?: (value: string) => void
  /** Shown when no value is selected. */
  placeholder?: string
  /** Align the menu to the left or right edge of the trigger. Default: 'left'. */
  align?: 'left' | 'right'
  /** Override the menu min-width (CSS value). Defaults to trigger width. */
  menuWidth?: string | number
  /** Disable the entire dropdown. */
  disabled?: boolean
  /**
   * Custom trigger render function. Receives `{ open, selectedLabel }`.
   * When provided, the default trigger button is not rendered.
   */
  trigger?: (props: { open: boolean; selectedLabel: string | undefined }) => ReactNode
  className?: string
}

// ── Hook: close on outside click / scroll ────────────────────────────────────

function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (refs.some(r => r.current?.contains(target))) return
      handler()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [refs, handler, enabled])
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  align = 'left',
  menuWidth,
  disabled = false,
  trigger,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, right: 0, width: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)

  // Selectable options only (excludes dividers and labels)
  const selectableOptions = options.filter(
    (o): o is Extract<DropdownOption, { type?: 'option' }> =>
      o.type === undefined || o.type === 'option',
  )

  const selectedLabel = value
    ? selectableOptions.find(o => o.value === value)?.label
    : undefined

  // Position menu relative to trigger
  const updatePosition = useCallback(() => {
    const el = triggerRef.current ?? wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuPos({
      top:   rect.bottom + 4,
      left:  rect.left,
      right: window.innerWidth - rect.right,
      width: rect.width,
    })
  }, [])

  const openMenu = useCallback(() => {
    if (disabled) return
    updatePosition()
    setOpen(true)
    setHighlightedIndex(-1)
  }, [disabled, updatePosition])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setHighlightedIndex(-1)
  }, [])

  useClickOutside([wrapperRef, menuRef], closeMenu, open)

  // Keep menu aligned with the trigger on scroll/resize; close only via outside click / Escape
  useEffect(() => {
    if (!open) return
    const syncPosition = () => updatePosition()
    window.addEventListener('scroll', syncPosition, { capture: true, passive: true })
    window.addEventListener('resize', syncPosition, { passive: true })
    return () => {
      window.removeEventListener('scroll', syncPosition, { capture: true })
      window.removeEventListener('resize', syncPosition)
    }
  }, [open, updatePosition])

  // Keyboard navigation on trigger
  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open ? closeMenu() : openMenu()
    }
    if (e.key === 'Escape') closeMenu()
  }

  // Keyboard navigation on menu
  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      closeMenu()
      triggerRef.current?.focus()
      return
    }

    const enabledOptions = selectableOptions.filter(o => !o.disabled)
    const currentIdx = highlightedIndex

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i =>
        i < enabledOptions.length - 1 ? i + 1 : 0
      )
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i =>
        i > 0 ? i - 1 : enabledOptions.length - 1
      )
    }
    if (e.key === 'Enter' && currentIdx >= 0) {
      e.preventDefault()
      const opt = enabledOptions[currentIdx]
      if (opt) {
        onChange?.(opt.value)
        closeMenu()
        triggerRef.current?.focus()
      }
    }
    if (e.key === 'Tab') closeMenu()
  }

  function selectOption(optValue: string) {
    onChange?.(optValue)
    closeMenu()
  }

  // Focus menu when opened
  useEffect(() => {
    if (open) menuRef.current?.focus()
  }, [open])

  const resolvedMenuWidth =
    menuWidth != null
      ? typeof menuWidth === 'number' ? `${menuWidth}px` : menuWidth
      : `${menuPos.width}px`

  const menuStyle: React.CSSProperties = {
    top:      menuPos.top,
    minWidth: resolvedMenuWidth,
    ...(align === 'right'
      ? { right: menuPos.right }
      : { left:  menuPos.left }),
  }

  // Render options list
  function renderOptions() {
    return options.map((opt, idx) => {
      if (opt.type === 'divider') {
        return <div key={`divider-${idx}`} className="bud-dd-divider" />
      }
      if (opt.type === 'label') {
        return (
          <div key={`label-${idx}`} className="bud-dd-section-label">
            {opt.label}
          </div>
        )
      }

      // Find position among selectable options for highlight tracking
      const selectableIdx = selectableOptions.findIndex(
        s => s === opt || s.value === opt.value
      )
      const isHighlighted = highlightedIndex === selectableIdx
      const isSelected    = opt.value === value

      return (
        <button
          key={opt.value}
          type="button"
          role="option"
          aria-selected={isSelected}
          data-highlighted={isHighlighted || undefined}
          data-selected={isSelected || undefined}
          data-variant={opt.variant === 'danger' ? 'danger' : undefined}
          disabled={opt.disabled}
          className="bud-dd-item"
          onPointerEnter={() => setHighlightedIndex(selectableIdx)}
          onPointerLeave={() => setHighlightedIndex(-1)}
          onClick={() => !opt.disabled && selectOption(opt.value)}
        >
          {opt.icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{opt.icon}</span>}
          <span style={{ flex: 1 }}>{opt.label}</span>
          {isSelected && (
            <span className="bud-dd-check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </button>
      )
    })
  }

  return (
    <div ref={wrapperRef} className={`bud-dd-wrapper ${className}`} style={{ position: 'relative', display: 'block' }}>
      {trigger ? (
        // Custom trigger — wrap in a div that handles the click
        <div
          onClick={() => open ? closeMenu() : openMenu()}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {trigger({ open, selectedLabel })}
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          data-open={open || undefined}
          className="bud-dd-trigger"
          onClick={() => open ? closeMenu() : openMenu()}
          onKeyDown={onTriggerKeyDown}
        >
          <span
            className="bud-dd-trigger-value"
            data-placeholder={!selectedLabel || undefined}
          >
            {selectedLabel ?? placeholder}
          </span>
          <span className="bud-dd-chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
      )}

      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          className="bud-dd-menu"
          data-align={align}
          style={menuStyle}
          onKeyDown={onMenuKeyDown}
          aria-label="Options"
        >
          {renderOptions()}
        </div>,
        document.body,
      )}
    </div>
  )
}
