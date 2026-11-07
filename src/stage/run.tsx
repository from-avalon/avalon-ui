"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { onStageFrame } from "./frame"
import { useMotion } from "./motion"

export interface RunHandle {
  /** Go to a point in the run, 0 to 1. With `ms` it eases there; any wheel or touch takes over at once. */
  to(p: number, ms?: number): void
}

interface ScrollRunProps {
  /** Extra page height the run takes, in px: how much scrolling it costs to pass the section. */
  length: number
  /** Sideways input, in px, that covers the whole run. Equal to `length` means a sideways swipe moves it as fast as a
      vertical one. */
  sideways?: number
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

/** A section you scroll through sideways. The stage sticks while the page's own scroll drives `onProgress`, so wheel,
    trackpad, keyboard and touch all work with nothing intercepted, and nothing in the row can be skipped. Sideways wheel and
    swipes move the same scroll. Reduced motion gets no run: the section sits in the page, and the consumer lays out its row
    as a native scroller. */
export const ScrollRun = forwardRef<RunHandle, ScrollRunProps>(function ScrollRun({ length, sideways = length, onProgress, dragMouse, className, style, children }, ref) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()
  const live = useRef({ length, sideways, onProgress, reduced, p: -1 })
  live.current = { ...live.current, length, sideways, onProgress, reduced }
  const glide = useRef(0)

  const edges = () => {
    const top = host.current!.getBoundingClientRect().top + scrollY
    return [top, top + live.current.length]
  }
  // sideways input lands here: a px of it moves the page by length / sideways, kept inside the run
  const nudge = (dx: number) => {
    const { length: L, sideways: S } = live.current
    const [a, b] = edges()
    scrollTo({ top: Math.min(b, Math.max(a, scrollY + (dx * L) / Math.max(1, S))), behavior: "instant" })
  }

  useImperativeHandle(ref, () => ({
    to(p, ms) {
      cancelAnimationFrame(glide.current)
      const [a, b] = edges()
      const target = a + clamp01(p) * (b - a)
      if (!ms || live.current.reduced) return scrollTo({ top: target, behavior: "instant" })
      const from = scrollY, start = performance.now()
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / ms)
        scrollTo({ top: from + (target - from) * easeInOut(k), behavior: "instant" })
        if (k < 1) glide.current = requestAnimationFrame(tick)
      }
      glide.current = requestAnimationFrame(tick)
    },
  }))

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

  useEffect(() => {
    const el = stage.current
    if (!el || reduced) return
    const stop = () => cancelAnimationFrame(glide.current)
    const wheel = (e: WheelEvent) => {
      stop()
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      nudge(e.deltaX)
    }
    let drag: { x0: number; y0: number; last: number; t: number; v: number; axis: "x" | "y" | null; moved: number; id: number } | null = null
    let coast = 0, swallow = false
    const down = (e: PointerEvent) => {
      stop()
      cancelAnimationFrame(coast)
      swallow = false
      if (e.button !== 0 || (e.pointerType === "mouse" && !dragMouse)) return
      drag = { x0: e.clientX, y0: e.clientY, last: e.clientX, t: performance.now(), v: 0, axis: e.pointerType === "mouse" ? "x" : null, moved: 0, id: e.pointerId }
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
      const now = performance.now(), dt = Math.max(1, now - drag.t), step = e.clientX - drag.last
      drag.v = drag.v * 0.6 + (step / dt) * 0.4
      drag.last = e.clientX
      drag.t = now
      drag.moved = Math.max(drag.moved, Math.abs(dx))
      if (drag.moved > 6) swallow = true
      nudge(-step)
    }
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      delete el.dataset.dragging
      let v = drag.axis === "x" ? drag.v : 0
      drag = null
      // the flick carries on a little, as a native scroller's would
      let last = performance.now()
      const glideOn = (now: number) => {
        const dt = now - last
        last = now
        nudge(-v * dt)
        v *= Math.pow(0.994, dt)
        if (Math.abs(v) > 0.02) coast = requestAnimationFrame(glideOn)
      }
      if (Math.abs(v) > 0.05) coast = requestAnimationFrame(glideOn)
    }
    // a drag that started on a link must not also click it
    const click = (e: MouseEvent) => {
      if (!swallow) return
      e.preventDefault()
      e.stopPropagation()
      swallow = false
    }
    const noDrag = (e: Event) => e.preventDefault()
    el.addEventListener("wheel", wheel, { passive: false })
    el.addEventListener("pointerdown", down)
    addEventListener("pointermove", move)
    addEventListener("pointerup", up)
    addEventListener("pointercancel", up)
    el.addEventListener("click", click, true)
    el.addEventListener("dragstart", noDrag)
    return () => {
      cancelAnimationFrame(coast)
      el.removeEventListener("wheel", wheel)
      el.removeEventListener("pointerdown", down)
      removeEventListener("pointermove", move)
      removeEventListener("pointerup", up)
      removeEventListener("pointercancel", up)
      el.removeEventListener("click", click, true)
      el.removeEventListener("dragstart", noDrag)
    }
    // nudge reads its inputs from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, dragMouse])

  return (
    <div ref={host} className="avl-run" style={{ "--avl-run": `${length}px` } as CSSProperties}>
      <div ref={stage} className={`avl-run-stage ${className ?? ""}`} style={style}>
        {children}
      </div>
    </div>
  )
})
