"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { OWN_KEYS, dragLanding, nextStop, viewStops } from "./landing"
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
  /** Move on a view at a time, never cutting an item. */
  page(dir: 1 | -1): void
  /** Bring an item to the start of the row. */
  go(index: number, instant?: boolean): void
}

/** Where each item starts along the row, past its padding. */
export function itemLefts(row: HTMLElement) {
  const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0
  return ([...row.children] as HTMLElement[]).map((c) => c.offsetLeft - row.offsetLeft - pad)
}

/** Where the row rests going a view at a time. */
export function rowStops(row: HTMLElement) {
  const cs = getComputedStyle(row)
  const lefts = itemLefts(row)
  const items = ([...row.children] as HTMLElement[]).map((c, i) => ({ left: lefts[i], width: c.offsetWidth }))
  return viewStops(items, row.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0), row.scrollWidth - row.clientWidth)
}

/** A row that scrolls sideways natively: swipe, trackpad, shift-wheel, the left and right keys while it's in view, or the arrows you
    wire to `page`. It only watches, and vertical scrolling passes straight through to the page. Give the element `.avl-row`, with the
    items as its direct children; a mouse can drag it too. `onMove` gets 0 to 1 as the row moves. */
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
    let drag: { x: number; left: number; moved: number; snaps: boolean } | null = null
    let swallow = false
    let free: ReturnType<typeof setTimeout> | undefined
    const down = (e: PointerEvent) => {
      swallow = false
      clearTimeout(free)
      if (e.pointerType === "mouse" && e.button === 0) drag = { x: e.clientX, left: el.scrollLeft, moved: 0, snaps: getComputedStyle(el).scrollSnapType !== "none" }
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
      const was = drag
      drag = null
      if (!was || el.dataset.dragging == null) return
      if (!was.snaps) {
        delete el.dataset.dragging
        return
      }
      // the snap is off during a drag, and coming back on it would cut to its place, so the row goes there first. Being a native
      // scroll, anything else that moves the row takes over from it
      const x = el.scrollLeft, max = el.scrollWidth - el.clientWidth
      el.dataset.dragging = "landing"
      el.scrollTo({ left: dragLanding(itemLefts(el).map((l) => Math.min(l, max)), x, Math.sign(x - was.left)), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
      free = setTimeout(() => delete el.dataset.dragging, 800)
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
      clearTimeout(free)
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
      const to = el && nextStop(rowStops(el), el.scrollLeft, dir)
      if (el && to != null) el.scrollTo({ left: to, behavior: reduced ? "auto" : "smooth" })
    },
    [ref, reduced],
  )
  const go = useCallback(
    (index: number, instant?: boolean) => {
      const el = ref.current
      const left = el && itemLefts(el)[index]
      if (el && left != null) el.scrollTo({ left, behavior: reduced || instant ? "auto" : "smooth" })
    },
    [ref, reduced],
  )

  // left and right reach the row that's in view from anywhere on the page, without tabbing through every card first
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const way = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
      if (!way || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || (e.target as Element).closest?.(OWN_KEYS)) return
      const r = ref.current?.getBoundingClientRect()
      if (!r || r.top > innerHeight / 2 || r.bottom < innerHeight / 2) return
      e.preventDefault()
      page(way)
    }
    addEventListener("keydown", onKey)
    return () => removeEventListener("keydown", onKey)
  }, [ref, page])

  // tabbing to a card brings it on. The browser moves a row as little as it can to show what took focus, and the snap can put it
  // straight back, leaving the focus mostly off the edge
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement
      if (!t.matches(":focus-visible")) return
      requestAnimationFrame(() => {
        const a = t.getBoundingClientRect(), b = el.getBoundingClientRect()
        if (a.left < b.left - 1 || a.right > b.right + 1) go([...el.children].findIndex((c) => c.contains(t)))
      })
    }
    el.addEventListener("focusin", onFocus)
    return () => el.removeEventListener("focusin", onFocus)
  }, [ref, go])

  return { ...state, page, go }
}
