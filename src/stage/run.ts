"use client"

import { useCallback, useEffect, useRef } from "react"
import type { RefObject } from "react"
import { onStageFrame, requestStageFrame } from "./frame"
import { holdCurve, holdCurveInverse, landingStop, nextStop } from "./landing"
import { itemLefts, rowStops } from "./row"
import { addRun, handOnPage, snapNative, stopGlide, tuning, useSnapOn } from "./settle"
import type { Run } from "./settle"

export interface RowRun {
  /** Whether the section is held right now. */
  on: boolean
  /** How far below the section's top the page rests with this item in place. 0 while off. */
  placeOf(index: number): number
  /** On to the next stop that way, as an arrow does. Nothing while off. */
  step(dir: 1 | -1): void
}

/** Holds a section in place while the page's own scroll walks its row through, a view at a time. Nothing is intercepted: the wheel,
    the trackpad and the keys scroll the page as ever, and the row is a function of where the page is. A sideways swipe, an arrow or
    a key moves the row natively and the page follows out of sight. When the page comes to rest between stops it settles on one.

    `host` is the tall element and needs `.avl-run`, its child the sticky `.avl-run-stage`; `row` is an `.avl-row` inside it. Without
    `html.avl-snap` nothing here runs, and the row is plain. With `html.avl-snap-native` the browser lands the page on each stop, and
    the page is the row's only way to move. */
export function useRowRun(host: RefObject<HTMLElement | null>, row: RefObject<HTMLElement | null>): RowRun {
  const on = useSnapOn()
  const live = useRef({ stops: [0], per: 0 })
  /** The stop at which this item is in place. */
  const stopOf = useCallback(
    (index: number) => {
      const r = row.current, stops = live.current.stops
      const left = r ? itemLefts(r)[index] : undefined
      if (left == null) return 0
      let k = 0
      while (k < stops.length - 1 && stops[k + 1] <= left + 1) k++
      return k
    },
    [row],
  )

  useEffect(() => {
    const h = host.current, r = row.current
    if (!on || !h || !r) return
    const at = live.current
    let tail = 0, painted = NaN, wrote = -1, rowLeads = 0
    // where the browser's own snap can land in the hold: one per stop, the section's top the first
    const points: HTMLElement[] = []
    const placePoints = () => {
      while (points.length < moves() + 1) {
        const p = document.createElement("i")
        p.className = "avl-snap-point"
        p.setAttribute("aria-hidden", "true")
        h.appendChild(p)
        points.push(p)
      }
      while (points.length > moves() + 1) points.pop()?.remove()
      points.forEach((p, k) => (p.style.top = `${k * at.per}px`))
    }
    const top = () => Math.round(h.getBoundingClientRect().top + scrollY)
    const moves = () => at.stops.length - 1
    const xAt = (t: number) => {
      const i = Math.min(Math.floor(t), Math.max(0, moves() - 1))
      const a = at.stops[i], b = at.stops[i + 1] ?? a
      return a + (b - a) * holdCurve(t - i, tuning.snap)
    }
    const stopsAt = (x: number) => {
      let i = 0
      while (i < moves() - 1 && x > at.stops[i + 1]) i++
      const a = at.stops[i], b = at.stops[i + 1] ?? a
      return i + (b > a ? holdCurveInverse((x - a) / (b - a), tuning.snap) : 0)
    }

    // the row and the page are one position, so whatever else moved the row (a swipe, a drag, a key, an arrow, focus) moves the page
    // to match, from wherever the deck can be seen. Were the page left alone outside the hold, the two would disagree, and the page
    // would jump to the row on the way in. A hand on the page takes over instead: the row goes back to where the page has it, which
    // also stops an arrow's move still playing
    const follow = () => {
      const x = r.scrollLeft
      // with the browser landing the page, the page alone moves the row
      if (!at.per || snapNative() || Math.abs(x - wrote) < 2) return false
      if (handOnPage()) {
        r.scrollLeft = wrote
        return false
      }
      rowLeads = performance.now() + 120
      wrote = x
      painted = NaN
      stopGlide()
      scrollTo({ top: top() + stopsAt(x) * at.per, behavior: "instant" })
      return true
    }

    const paint = () => {
      if (!at.per) return
      // a swipe can land between frames, before its scroll event: writing the row now would erase it. So the row waits a frame at a time
      // until it has been still a moment. Waiting, not skipping: a page moved once in that moment would otherwise leave the row behind
      if (performance.now() < rowLeads && !handOnPage()) {
        requestStageFrame()
        return
      }
      if (follow()) return
      const t = Math.min(moves(), Math.max(0, (scrollY - top()) / at.per))
      if (t === painted) return
      painted = t
      wrote = xAt(t)
      r.scrollLeft = wrote
    }

    const self: Run = {
      host: h,
      measure() {
        at.stops = rowStops(r)
        at.per = Math.round(tuning.hand)
        tail = Math.round(innerHeight * tuning.edge)
        h.style.setProperty("--avl-run", `${moves() ? moves() * at.per + tail : 0}px`)
        placePoints()
        // the stops moved, so the row's place is no longer news: the next paint sets it from the page
        wrote = r.scrollLeft
        painted = NaN
        requestStageFrame()
      },
      landing(y, dir, notched) {
        if (!moves()) return null
        const a = top()
        if (y < a || y >= a + moves() * at.per) return null
        const k = landingStop((y - a) / at.per, moves(), dir, notched ? 0.001 : tuning.commit)
        return k == null ? null : a + k * at.per
      },
      next(from, way) {
        if (!moves()) return null
        const a = top()
        if (from < a - 1 || from > a + moves() * at.per + tail) return null
        const t = (from - a) / at.per
        const k = way > 0 ? Math.floor(t + 0.01) + 1 : Math.ceil(t - 0.01) - 1
        return k < 0 || k > moves() ? null : a + k * at.per
      },
      move: () => at.per,
      lastStop: () => top() + moves() * at.per,
    }

    // a card that takes focus brings the page to its stop, when the page alone moves the row
    const onFocus = (e: FocusEvent) => {
      if (!snapNative()) return
      const i = [...r.children].findIndex((c) => c.contains(e.target as Node))
      if (i >= 0) scrollTo({ top: top() + stopOf(i) * at.per, behavior: "instant" })
    }
    r.addEventListener("focusin", onFocus)

    const leave = addRun(self)
    const stopPainting = onStageFrame(paint)
    r.addEventListener("scroll", follow, { passive: true })
    const ro = new ResizeObserver(() => self.measure())
    ro.observe(r)
    addEventListener("resize", self.measure)
    let gone = false
    document.fonts?.ready.then(() => gone || self.measure())
    self.measure()
    return () => {
      gone = true
      leave()
      stopPainting()
      r.removeEventListener("scroll", follow)
      r.removeEventListener("focusin", onFocus)
      ro.disconnect()
      removeEventListener("resize", self.measure)
      h.style.removeProperty("--avl-run")
      points.forEach((p) => p.remove())
      at.per = 0
      at.stops = [0]
    }
  }, [on, host, row])

  const placeOf = useCallback((index: number) => (live.current.per ? stopOf(index) * live.current.per : 0), [stopOf])
  const step = useCallback(
    (dir: 1 | -1) => {
      const h = host.current, r = row.current, at = live.current
      if (!on || !h || !r || !at.per) return
      if (snapNative()) {
        const a = Math.round(h.getBoundingClientRect().top + scrollY)
        const k = Math.round((scrollY - a) / at.per) + dir
        if (k >= 0 && k < at.stops.length) scrollTo({ top: a + k * at.per, behavior: "smooth" })
        return
      }
      const to = nextStop(at.stops, r.scrollLeft, dir)
      if (to != null) r.scrollTo({ left: to, behavior: "smooth" })
    },
    [on, host, row],
  )
  return { on, placeOf, step }
}
