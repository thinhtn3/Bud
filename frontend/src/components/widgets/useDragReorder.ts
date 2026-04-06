import { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react'
import type { WidgetInstance } from './widgetRegistry'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DragState {
  activeId: string
  offsetX: number
  offsetY: number
  originalRect: DOMRect
}

interface UseDragReorderOpts {
  widgets: WidgetInstance[]
  editMode: boolean
  onReorder: (newOrder: WidgetInstance[]) => void
}

interface UseDragReorderResult {
  dragState: DragState | null
  displayWidgets: WidgetInstance[]
  cellRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  floatingRef: React.RefObject<HTMLDivElement | null>
  onPointerDown: (e: React.PointerEvent, widgetId: string) => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEAD_ZONE = 5

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDragReorder({
  widgets,
  editMode,
  onReorder,
}: UseDragReorderOpts): UseDragReorderResult {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [orderedWidgets, setOrderedWidgets] = useState(widgets)

  // Keep orderedWidgets in sync when widgets change externally (add/remove)
  useEffect(() => {
    if (!dragState) setOrderedWidgets(widgets)
  }, [widgets, dragState])

  // Refs
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const floatingRef = useRef<HTMLDivElement | null>(null)
  const pendingRef = useRef<{
    id: string
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    rect: DOMRect
  } | null>(null)
  const lastDropIndexRef = useRef<number>(-1)
  const flipSnapshotsRef = useRef<Map<string, DOMRect>>(new Map())
  const droppingRef = useRef(false)
  const rafRef = useRef<number>(0)

  // ── Reorder with FLIP ──────────────────────────────────────────────────

  const reorderTo = useCallback(
    (newIndex: number, activeId: string) => {
      // Snapshot "First" positions
      const snapshots = new Map<string, DOMRect>()
      cellRefs.current.forEach((el, id) => {
        snapshots.set(id, el.getBoundingClientRect())
      })
      flipSnapshotsRef.current = snapshots

      setOrderedWidgets(prev => {
        const next = [...prev]
        const currIdx = next.findIndex(w => w.id === activeId)
        if (currIdx === -1 || currIdx === newIndex) return prev
        const [moved] = next.splice(currIdx, 1)
        next.splice(newIndex, 0, moved)
        return next
      })
    },
    [],
  )

  // FLIP animation after reorder re-render
  useLayoutEffect(() => {
    const snapshots = flipSnapshotsRef.current
    if (snapshots.size === 0) return
    flipSnapshotsRef.current = new Map()

    cellRefs.current.forEach((el, id) => {
      if (dragState && id === dragState.activeId) return
      const first = snapshots.get(id)
      if (!first) return
      const last = el.getBoundingClientRect()
      const dx = first.left - last.left
      const dy = first.top - last.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return

      el.style.transition = 'none'
      el.style.transform = `translate(${dx}px, ${dy}px)`

      // Force reflow
      el.getBoundingClientRect()

      el.classList.add('bud-flip-animating')
      el.style.transform = ''
      el.style.transition = ''

      const onEnd = () => {
        el.classList.remove('bud-flip-animating')
        el.removeEventListener('transitionend', onEnd)
      }
      el.addEventListener('transitionend', onEnd)
    })
  }, [orderedWidgets, dragState])

  // ── Hit-testing ────────────────────────────────────────────────────────

  const findDropIndex = useCallback(
    (pointerX: number, pointerY: number, activeId: string, rect: DOMRect, offX: number, offY: number) => {
      const dragCX = pointerX - offX + rect.width / 2
      const dragCY = pointerY - offY + rect.height / 2

      const items: { index: number; cx: number; cy: number }[] = []
      orderedWidgets.forEach((w, i) => {
        if (w.id === activeId) return
        const el = cellRefs.current.get(w.id)
        if (!el) return
        const r = el.getBoundingClientRect()
        items.push({ index: i, cx: r.left + r.width / 2, cy: r.top + r.height / 2 })
      })

      // Sort row-major
      items.sort((a, b) => {
        const rowDiff = Math.abs(a.cy - b.cy) < 40 ? 0 : a.cy - b.cy
        return rowDiff !== 0 ? rowDiff : a.cx - b.cx
      })

      for (const item of items) {
        if (dragCY < item.cy || (Math.abs(dragCY - item.cy) < 40 && dragCX < item.cx)) {
          return item.index
        }
      }
      return orderedWidgets.length - 1
    },
    [orderedWidgets],
  )

  // ── Pointer handlers ───────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent, widgetId: string) => {
      if (!editMode || droppingRef.current) return
      // Don't start drag from the remove button
      if ((e.target as HTMLElement).closest('.bud-widget-remove')) return

      const cell = cellRefs.current.get(widgetId)
      if (!cell) return
      const rect = cell.getBoundingClientRect()

      pendingRef.current = {
        id: widgetId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        rect,
      }
    },
    [editMode],
  )

  // Global pointermove / pointerup
  useEffect(() => {
    if (!editMode) return

    function onMove(e: PointerEvent) {
      const pending = pendingRef.current

      // Pending → check dead zone
      if (pending && !dragState) {
        const dx = e.clientX - pending.startX
        const dy = e.clientY - pending.startY
        if (Math.sqrt(dx * dx + dy * dy) < DEAD_ZONE) return

        // Transition to Dragging
        lastDropIndexRef.current = -1
        setDragState({
          activeId: pending.id,
          offsetX: pending.offsetX,
          offsetY: pending.offsetY,
          originalRect: pending.rect,
        })
        // Set initial floating position
        requestAnimationFrame(() => {
          if (floatingRef.current) {
            floatingRef.current.style.transform =
              `translate(${e.clientX - pending.offsetX}px, ${e.clientY - pending.offsetY}px)`
          }
        })
        return
      }

      // Dragging — update position (via ref, no React re-render)
      if (dragState && floatingRef.current) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          if (!floatingRef.current || !dragState) return
          const x = e.clientX - dragState.offsetX
          const y = e.clientY - dragState.offsetY
          floatingRef.current.style.transform = `translate(${x}px, ${y}px)`

          // Hit-test for reorder
          const newIdx = findDropIndex(
            e.clientX, e.clientY,
            dragState.activeId, dragState.originalRect,
            dragState.offsetX, dragState.offsetY,
          )
          if (newIdx !== lastDropIndexRef.current) {
            lastDropIndexRef.current = newIdx
            reorderTo(newIdx, dragState.activeId)
          }
        })
      }
    }

    function onUp() {
      pendingRef.current = null

      if (!dragState) return

      // Animate drop — spring the floating widget to the target cell position
      const targetCell = cellRefs.current.get(dragState.activeId)
      if (targetCell && floatingRef.current) {
        droppingRef.current = true
        const targetRect = targetCell.getBoundingClientRect()
        floatingRef.current.classList.add('bud-dropping')
        floatingRef.current.style.transform =
          `translate(${targetRect.left}px, ${targetRect.top}px)`

        const onEnd = () => {
          droppingRef.current = false
          floatingRef.current?.removeEventListener('transitionend', onEnd)
          // Commit order
          setDragState(null)
          setOrderedWidgets(prev => {
            onReorder(prev)
            return prev
          })
        }
        floatingRef.current.addEventListener('transitionend', onEnd)

        // Safety timeout in case transitionend doesn't fire
        setTimeout(() => {
          if (droppingRef.current) {
            droppingRef.current = false
            setDragState(null)
            setOrderedWidgets(prev => {
              onReorder(prev)
              return prev
            })
          }
        }, 500)
      } else {
        // No target cell — just commit
        setDragState(null)
        onReorder(orderedWidgets)
      }
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [editMode, dragState, findDropIndex, reorderTo, onReorder, orderedWidgets])

  // Cancel drag on window resize
  useEffect(() => {
    if (!dragState) return
    function onResize() {
      pendingRef.current = null
      droppingRef.current = false
      setDragState(null)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [dragState])

  return {
    dragState,
    displayWidgets: dragState ? orderedWidgets : widgets,
    cellRefs,
    floatingRef,
    onPointerDown,
  }
}
