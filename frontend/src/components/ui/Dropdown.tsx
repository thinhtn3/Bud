import {
  useState, useRef, useEffect, useCallback, useMemo,
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
  /** Enable fuzzy search input inside the menu. */
  searchable?: boolean
  /** Limit visible items before scrolling. */
  maxVisibleItems?: number
}

// ── Fuzzy match ───────────────────────────────────────────────────────────────

function fuzzyMatch(query: string, label: string): boolean {
  const q = query.toLowerCase().trim()
  const l = label.toLowerCase()
  if (l.includes(q)) return true   // substring match first
  // fallback: all query chars appear in order
  let qi = 0
  for (const ch of l) {
    if (ch === q[qi]) qi++
    if (qi === q.length) return true
  }
  return false
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
  searchable = false,
  maxVisibleItems,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, right: 0, width: 0 })
  const [query, setQuery] = useState('')

  const triggerRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)

  // Selectable options only (excludes dividers and labels)
  const selectableOptions = useMemo(() => options.filter(
    (o): o is Extract<DropdownOption, { type?: 'option' }> =>
      o.type === undefined || o.type === 'option',
  ), [options])

  const selectedLabel = value
    ? selectableOptions.find(o => o.value === value)?.label
    : undefined

  // Filtered options for display when searchable
  const displayOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options
    return options.filter(opt => {
      if (opt.type === 'divider' || opt.type === 'label') return false
      return fuzzyMatch(query, opt.label)
    })
  }, [options, query, searchable])

  const filteredSelectableOptions = useMemo(() => displayOptions.filter(
    (o): o is Extract<DropdownOption, { type?: 'option' }> =>
      o.type === undefined || o.type === 'option',
  ), [displayOptions])

  // Reset highlight when query changes
  useEffect(() => { setHighlightedIndex(-1) }, [query])

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
    setQuery('')
  }, [disabled, updatePosition])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setHighlightedIndex(-1)
    setQuery('')
  }, [])

  useClickOutside([wrapperRef, menuRef], closeMenu, open)

  // Close on scroll outside the menu; reposition on resize
  useEffect(() => {
    if (!open) return
    function onScroll(e: Event) {
      const menu = menuRef.current
      if (!menu) return
      // `e.target` is not always the scrolling node across browsers; composedPath is reliable.
      if (e.composedPath().includes(menu)) return
      closeMenu()
    }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, closeMenu, updatePosition])

  // Focus search input or menu when opened
  useEffect(() => {
    if (!open) return
    if (searchable) {
      // Slight delay so the portal is painted before focus
      requestAnimationFrame(() => searchRef.current?.focus())
    } else {
      menuRef.current?.focus()
    }
  }, [open, searchable])

  // Keyboard navigation on trigger
  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open ? closeMenu() : openMenu()
    }
    if (e.key === 'Escape') closeMenu()
  }

  // Keyboard navigation on search input
  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { closeMenu(); triggerRef.current?.focus(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, filteredSelectableOptions.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const opt = highlightedIndex >= 0
        ? filteredSelectableOptions[highlightedIndex]
        : filteredSelectableOptions[0]  // auto-select top result on Enter
      if (opt) { onChange?.(opt.value); closeMenu(); triggerRef.current?.focus() }
    }
    if (e.key === 'Tab') closeMenu()
  }

  // Keyboard navigation on menu (non-searchable)
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
      setHighlightedIndex(i => i < enabledOptions.length - 1 ? i + 1 : 0)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => i > 0 ? i - 1 : enabledOptions.length - 1)
    }
    if (e.key === 'Enter' && currentIdx >= 0) {
      e.preventDefault()
      const opt = enabledOptions[currentIdx]
      if (opt) { onChange?.(opt.value); closeMenu(); triggerRef.current?.focus() }
    }
    if (e.key === 'Tab') closeMenu()
  }

  function selectOption(optValue: string) {
    onChange?.(optValue)
    closeMenu()
  }

  // Focus menu when opened (non-searchable)
  useEffect(() => {
    if (open && !searchable) menuRef.current?.focus()
  }, [open, searchable])

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

  // Each item is ~32px tall; add 8px for padding
  const listStyle: React.CSSProperties = maxVisibleItems
    ? { maxHeight: `${maxVisibleItems * 32 + 8}px`, overflowY: 'auto' }
    : {}

  // Render options list (against displayOptions when searchable, full options otherwise)
  function renderOptions(opts: DropdownOption[]) {
    if (searchable && query.trim() && opts.length === 0) {
      return <div className="bud-dd-no-results">No results</div>
    }
    return opts.map((opt, idx) => {
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

      const selectableIdx = filteredSelectableOptions.findIndex(
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
          onKeyDown={!searchable ? onMenuKeyDown : undefined}
          onWheel={e => e.stopPropagation()}
          aria-label="Options"
        >
          {searchable && (
            <div className="bud-dd-search-wrap">
              <input
                ref={searchRef}
                type="text"
                className="bud-dd-search"
                placeholder="Search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                autoComplete="off"
              />
            </div>
          )}
          <div className="bud-dd-options-list" style={listStyle}>
            {renderOptions(displayOptions)}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
