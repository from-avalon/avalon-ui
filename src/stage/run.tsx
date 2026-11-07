"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { onStageFrame } from "./frame"
import { WheelReader } from "./gesture"
import { useMotion } from "./motion"

export interface RunHandle {
  /** Go to a point in the run, 0 to 1. With `ms` it eases there. */
  to(p: number, ms?: number): void
}

interface ScrollRunProps {
  /** Extra page height the run takes, in px. Scrollbars, keyboards and touch pay this; a wheel steps through `stops`. */
  length: number
  /** How many resting places the run has, the first at its start and the last at its end. */
  stops: number
  /** How long one step takes to ease, in ms. */
  glide?: number
  /** How long a step holds before a sustained scroll may take the next, in ms. */
  hold?: number
  /** Called with 0 to 1 whenever the run moves. */
  onProgress: (p: number) => void
  /** Let a mouse drag the stage too, as a finger can. */
  dragMouse?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const instant = (top: number) => scrollTo({ top, behavior: "instant" })
/** Input a wheel must gather before anything moves, so a brush of the trackpad doesn't. */
const STEP_THRESHOLD = 24

interface Run {
  host: HTMLElement
  stops(): number
  length(): number
  glide(): number
  hold(): number
  go(p: number, ms: number): void
}

const runs = new Set<Run>()
const reader = new WheelReader()
let lockedUntil = 0

function placed() {
  return [...runs]
    .map((run) => {
      const top = run.host.getBoundingClientRect().top + scrollY
      return { run, top, end: top + run.length() }
    })
    .sort((a, b) => a.top - b.top)
}

/** The stop nearest a scroll position. */
function stopAt(y: number, top: number, end: number, stops: number) {
  return Math.round(clamp01((y - top) / Math.max(1, end - top)) * (stops - 1))
}

function step(run: Run, from: number, dir: number, now: number) {
  const n = run.stops()
  run.go((from + dir) / (n - 1), run.glide())
  lockedUntil = now + run.hold()
  reader.spend()
}

/** One listener for the page. Native scrolling between runs is left alone, except that a flick can't cross a run's edge: it
    lands on it. Inside a run, a flick is one step and its momentum is absorbed; a hand that keeps pushing keeps stepping at a
    readable pace; and leaving takes a fresh gesture. So nothing can be skipped by accident. */
function onWheel(e: WheelEvent) {
  if (e.ctrlKey) return
  const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1
  const dx = e.deltaX * unit, dy = e.deltaY * unit
  const sideways = Math.abs(dx) > Math.abs(dy)
  const d = sideways ? dx : dy
  if (!d) return
  const now = performance.now()
  reader.read(d, now)
  const y = scrollY
  const all = placed()
  const here = all.find((p) => y >= p.top - 1 && y <= p.end + 1)

  if (!here) {
    if (sideways) return
    const next = d > 0 ? all.find((p) => p.top > y) : [...all].reverse().find((p) => p.end < y)
    const edge = next && (d > 0 ? next.top : next.end)
    if (edge !== undefined && (d > 0 ? y + d >= edge : y + d <= edge)) {
      e.preventDefault()
      instant(edge)
      reader.spend()
    }
    return
  }

  if (reader.leaving && !sideways) return
  const { run, top, end } = here
  const n = run.stops()
  const from = stopAt(y, top, end, n)
  const dir = Math.sign(d)
  const atEnd = dir > 0 ? from >= n - 1 : from <= 0
  const ready = Math.abs(reader.gathered) >= STEP_THRESHOLD
  if (atEnd && !sideways && ready && !reader.spent && now >= lockedUntil) {
    // a fresh push at the end of the run: let the page carry on
    reader.leaving = true
    return
  }
  e.preventDefault()
  if (atEnd || now < lockedUntil || !ready) return
  if (reader.spent && !reader.sustained) return
  step(run, from, dir, now)
}

function onKey(e: KeyboardEvent) {
  const down = e.key === "PageDown" || (e.key === " " && !e.shiftKey)
  const up = e.key === "PageUp" || (e.key === " " && e.shiftKey)
  if ((!down && !up) || e.altKey || e.ctrlKey || e.metaKey) return
  if ((e.target as Element | null)?.closest?.("a, button, input, textarea, select, [contenteditable]")) return
  const y = scrollY
  const here = placed().find((p) => y >= p.top - 1 && y <= p.end + 1)
  if (!here) return
  const n = here.run.stops(), from = stopAt(y, here.top, here.end, n), dir = down ? 1 : -1
  if (dir > 0 ? from >= n - 1 : from <= 0) return
  e.preventDefault()
  step(here.run, from, dir, performance.now())
}

function join(run: Run) {
  if (runs.size === 0) {
    addEventListener("wheel", onWheel, { passive: false })
    addEventListener("keydown", onKey)
  }
  runs.add(run)
  return () => {
    runs.delete(run)
    if (runs.size === 0) {
      removeEventListener("wheel", onWheel)
      removeEventListener("keydown", onKey)
    }
  }
}

/** A section you move through sideways. The stage sticks while the page's scroll drives `onProgress`, so scrollbars, keyboards
    and touch work as they always do. A wheel or trackpad steps from stop to stop, so a flick can't pass anything by; touch gets
    the same from CSS snap points. Reduced motion gets no run: the section sits in the page, and the consumer lays out its row as
    a native scroller. */
export const ScrollRun = forwardRef<RunHandle, ScrollRunProps>(function ScrollRun({ length, stops, glide = 460, hold = 620, onProgress, dragMouse, className, style, children }, ref) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()
  const live = useRef({ length, stops, glide, hold, onProgress, reduced, p: -1 })
  live.current = { ...live.current, length, stops, glide, hold, onProgress, reduced }
  const easing = useRef(0)

  const edges = () => {
    const top = host.current!.getBoundingClientRect().top + scrollY
    return [top, top + live.current.length]
  }

  const go = (p: number, ms = 0) => {
    cancelAnimationFrame(easing.current)
    const [a, b] = edges()
    const target = a + clamp01(p) * (b - a)
    if (!ms || live.current.reduced) return instant(target)
    const root = document.documentElement
    // a snapping page would fight the ease
    root.style.scrollSnapType = "none"
    const from = scrollY, start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms)
      instant(from + (target - from) * easeInOut(k))
      if (k < 1) easing.current = requestAnimationFrame(tick)
      else root.style.scrollSnapType = ""
    }
    easing.current = requestAnimationFrame(tick)
  }

  useImperativeHandle(ref, () => ({ to: go }))

  useEffect(() => {
    if (reduced || !host.current) return
    return join({
      host: host.current,
      stops: () => live.current.stops,
      length: () => live.current.length,
      glide: () => live.current.glide,
      hold: () => live.current.hold,
      go,
    })
    // go reads its inputs from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(
    () =>
      onStageFrame(() => {
        const el = host.current, l = live.current
        if (!el || l.reduced || !l.length) return
        const p = clamp01(-el.getBoundingClientRect().top / l.length)
        if (p !== l.p) {
          l.p = p
          l.onProgress(p)
        }
      }),
    [],
  )

  // a swipe or drag sideways: a finger takes one step on release, a mouse drags the row and settles on a stop
  useEffect(() => {
    const el = stage.current
    if (!el || reduced) return
    let drag: { x0: number; y0: number; last: number; axis: "x" | "y" | null; moved: number; id: number; mouse: boolean } | null = null
    let swallow = false
    const down = (e: PointerEvent) => {
      cancelAnimationFrame(easing.current)
      swallow = false
      const mouse = e.pointerType === "mouse"
      if (e.button !== 0 || (mouse && !dragMouse)) return
      drag = { x0: e.clientX, y0: e.clientY, last: e.clientX, axis: mouse ? "x" : null, moved: 0, id: e.pointerId, mouse }
    }
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0
      if (!drag.axis) {
        if (Math.abs(dx) + Math.abs(dy) < 8) return
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
        if (drag.axis === "y") {
          drag = null
          return
        }
      }
      el.dataset.dragging = ""
      drag.moved = Math.max(drag.moved, Math.abs(dx))
      if (drag.moved > 6) swallow = true
      if (drag.mouse) {
        // the row travels about a screen per stop, so the page moves by that share of the run
        const { length: L, stops: n } = live.current
        const [a, b] = edges()
        instant(Math.min(b, Math.max(a, scrollY - ((e.clientX - drag.last) / innerWidth) * (L / Math.max(1, n - 1)))))
      }
      drag.last = e.clientX
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      delete el.dataset.dragging
      const dx = e.clientX - drag.x0, wasSwipe = drag.axis === "x" && drag.moved > 30, mouse = drag.mouse
      drag = null
      if (!wasSwipe) return
      const { stops: n, glide: ms } = live.current
      const [a, b] = edges()
      const from = stopAt(scrollY, a, b, n)
      go((mouse ? from : from - Math.sign(dx)) / Math.max(1, n - 1), ms)
    }
    // a drag that started on a link must not also click it
    const click = (e: MouseEvent) => {
      if (!swallow) return
      e.preventDefault()
      e.stopPropagation()
      swallow = false
    }
    const noDrag = (e: Event) => e.preventDefault()
    el.addEventListener("pointerdown", down)
    addEventListener("pointermove", move)
    addEventListener("pointerup", up)
    addEventListener("pointercancel", up)
    el.addEventListener("click", click, true)
    el.addEventListener("dragstart", noDrag)
    return () => {
      el.removeEventListener("pointerdown", down)
      removeEventListener("pointermove", move)
      removeEventListener("pointerup", up)
      removeEventListener("pointercancel", up)
      el.removeEventListener("click", click, true)
      el.removeEventListener("dragstart", noDrag)
    }
    // go reads its inputs from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, dragMouse])

  return (
    <div ref={host} className="avl-run" style={{ "--avl-run": `${length}px` } as CSSProperties}>
      {stops > 1 && Array.from({ length: stops }, (_, k) => <i key={k} className="avl-run-stop" style={{ "--avl-stop": k / (stops - 1) } as CSSProperties} />)}
      <div ref={stage} className={`avl-run-stage ${className ?? ""}`} style={style}>
        {children}
      </div>
    </div>
  )
})
