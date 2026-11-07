"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { useMotion } from "./motion"

export interface SideRow {
  /** 1-based range of items fully in view, and how many there are. */
  first: number
  last: number
  total: number
  /** The item nearest the start of the row, from 0. */
  current: number
  atStart: boolean
  atEnd: boolean
  /** Move on about a screenful. */
  page(dir: 1 | -1): void
  /** Bring an item to the start of the row. */
  go(index: number, instant?: boolean): void
}

/** A row that scrolls sideways natively: swipe, trackpad, shift-wheel, or the arrows you wire to `page`. It only watches. Vertical
    scrolling is never touched. Give the element `.avl-row`, with the items as its direct children; a mouse can drag it too.
    `onMove` gets 0 to 1 as the row moves. */
export function useSideRow(ref: RefObject<HTMLElement | null>, onMove?: (p: number) => void): SideRow {
  const { reduced } = useMotion()
  const [state, setState] = useState({ first: 1, last: 1, total: 0, current: 0, atStart: true, atEnd: false })
  const move = useRef(onMove)
  move.current = onMove

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let queued = false
    const read = () => {
      queued = false
      const items = [...el.children] as HTMLElement[]
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0
      const left = el.scrollLeft, right = left + el.clientWidth
      const inView = items.flatMap((c, i) => (c.offsetLeft - el.offsetLeft >= left - 2 && c.offsetLeft - el.offsetLeft + c.offsetWidth <= right + 2 ? [i + 1] : []))
      const max = el.scrollWidth - el.clientWidth
      let current = 0, best = Infinity
      items.forEach((c, i) => {
        const gap = Math.abs(c.offsetLeft - el.offsetLeft - pad - left)
        if (gap < best) {
          best = gap
          current = i
        }
      })
      // the last item can't reach the start of the row, so the end of the row is its place
      if (max > 0 && left >= max - 2) current = items.length - 1
      const next = {
        first: inView[0] ?? current + 1,
        last: inView[inView.length - 1] ?? current + 1,
        total: items.length,
        current,
        atStart: left <= 2,
        atEnd: left >= max - 2,
      }
      el.dataset.edge = next.atStart && next.atEnd ? "both" : next.atStart ? "start" : next.atEnd ? "end" : "mid"
      setState((s) => (Object.keys(next) as (keyof typeof next)[]).every((k) => s[k] === next[k]) ? s : next)
      move.current?.(max > 0 ? Math.min(1, Math.max(0, left / max)) : 0)
    }
    const queue = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(read)
    }
    el.addEventListener("scroll", queue, { passive: true })
    const ro = new ResizeObserver(queue)
    ro.observe(el)
    queue()

    // a mouse has no swipe, so it can drag; a drag that started on a link doesn't also click it
    let drag: { x: number; left: number; moved: number } | null = null
    let swallow = false
    const down = (e: PointerEvent) => {
      swallow = false
      if (e.pointerType === "mouse" && e.button === 0) drag = { x: e.clientX, left: el.scrollLeft, moved: 0 }
    }
    const over = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - drag.x
      drag.moved = Math.max(drag.moved, Math.abs(dx))
      if (drag.moved < 6) return
      swallow = true
      el.dataset.dragging = ""
      el.scrollLeft = drag.left - dx
    }
    const up = () => {
      drag = null
      delete el.dataset.dragging
    }
    const click = (e: MouseEvent) => {
      if (!swallow) return
      e.preventDefault()
      e.stopPropagation()
      swallow = false
    }
    const noDrag = (e: Event) => e.preventDefault()
    el.addEventListener("pointerdown", down)
    addEventListener("pointermove", over)
    addEventListener("pointerup", up)
    addEventListener("pointercancel", up)
    el.addEventListener("click", click, true)
    el.addEventListener("dragstart", noDrag)
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", queue)
      el.removeEventListener("pointerdown", down)
      removeEventListener("pointermove", over)
      removeEventListener("pointerup", up)
      removeEventListener("pointercancel", up)
      el.removeEventListener("click", click, true)
      el.removeEventListener("dragstart", noDrag)
    }
  }, [ref])

  const page = useCallback(
    (dir: 1 | -1) => {
      const el = ref.current
      el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" })
    },
    [ref, reduced],
  )
  const go = useCallback(
    (index: number, instant?: boolean) => {
      const el = ref.current
      const c = el?.children[index] as HTMLElement | undefined
      if (!el || !c) return
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0
      el.scrollTo({ left: c.offsetLeft - el.offsetLeft - pad, behavior: reduced || instant ? "auto" : "smooth" })
    },
    [ref, reduced],
  )
  return { ...state, page, go }
}
