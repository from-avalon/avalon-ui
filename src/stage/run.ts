"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { onStageFrame, requestStageFrame } from "./frame"

/** The feel of every held section, in one place. */
export interface RunTuning {
  /** Scroll spent per card, in px. More and a flick covers fewer cards, but the page gets longer. A flick is the same distance
      on any screen, so this doesn't scale with one. */
  hand: number
  /** How firmly a card holds its place. 1 moves evenly; 2 to 3 lingers on each card and crosses quickly between them. */
  snap: number
  /** How far towards the next card counts as meaning to go there, from 0 to 1. Short of it, the card you left comes back. */
  commit: number
  /** How long after the scroll ends, in ms, the page settles on a card. */
  wait: number
  /** How long a settle takes, in ms, across a whole card. */
  glide: number
  /** In viewport heights: how long the last card stays held, and how far outside a section the page gets drawn in. */
  edge: number
}

const tuning: RunTuning = { hand: 500, snap: 2, commit: 0.14, wait: 120, glide: 420, edge: 0.22 }

export const getRunTuning = (): RunTuning => ({ ...tuning })

/** Changes the feel live, and re-measures every run. */
export function setRunTuning(next: Partial<RunTuning>) {
  Object.assign(tuning, next)
  runs.forEach((r) => r.measure())
}

/** Row position within a move, for scroll position within it. Both run 0 to 1 and it never stops rising, so it always answers
    the hand. Being a plain function of the scroll, it adds no delay, and a card lands as you reach it, with no timer. */
export function holdCurve(f: number, snap = tuning.snap) {
  if (f <= 0) return 0
  if (f >= 1) return 1
  const a = Math.pow(f, snap)
  return a / (a + Math.pow(1 - f, snap))
}

/** The inverse of holdCurve: scroll position for a row position. */
export function holdCurveInverse(k: number, snap = tuning.snap) {
  if (k <= 0) return 0
  if (k >= 1) return 1
  const r = Math.pow(k / (1 - k), 1 / snap)
  return r / (1 + r)
}

/** Where a page at rest should land, in stops from the run's start, or null to leave it be. `t` is the position in stops, and
    `need` the share of a move that counts as moving on. */
export function landingStop(t: number, moves: number, dir: number, need: number): number | null {
  if (t < 0 || t > moves) return null
  const i = Math.floor(t), f = t - i
  if (dir > 0) return f > need ? i + 1 : i
  if (dir < 0) return f < 1 - need ? i : i + 1
  return Math.round(t)
}

interface Run {
  measure(): void
  /** The page position this run wants a resting page at, or null. */
  landing(y: number): number | null
  /** The next resting place from `from` in `dir`, or null when that's outside this run. */
  next(from: number, dir: 1 | -1): number | null
  /** One move's worth of scroll, in px. */
  move(): number
}

const runs = new Set<Run>()
const KEY_DIR: Record<string, 1 | -1> = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 }
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)

// the settle is the only thing here that moves the page, and only once it has come to rest. Any input takes over at once
let lastY = 0, dir = 0, keyed = false, notched = false
let idle: ReturnType<typeof setTimeout> | undefined
let glide = 0, glideY = 0, glideTarget = 0

const stopGlide = () => {
  cancelAnimationFrame(glide)
  glide = 0
}

function glideTo(to: number, move: number) {
  stopGlide()
  glideTarget = to
  const from = scrollY
  const ms = Math.min(tuning.glide, Math.max(160, tuning.glide * Math.sqrt(Math.abs(to - from) / Math.max(1, move))))
  let start = 0
  const tick = (now: number) => {
    // the first frame's stamp can predate this call, so it starts the clock
    start ||= now
    const k = Math.min(1, (now - start) / ms)
    glideY = from + (to - from) * easeOut(k)
    scrollTo({ top: glideY, behavior: "instant" })
    glide = k < 1 ? requestAnimationFrame(tick) : 0
  }
  glide = requestAnimationFrame(tick)
}

function settle() {
  const y = scrollY
  for (const run of runs) {
    const to = run.landing(y)
    if (to == null) continue
    if (Math.abs(to - y) >= 1) glideTo(to, run.move())
    break
  }
}

const arm = () => {
  clearTimeout(idle)
  idle = setTimeout(settle, tuning.wait)
}

// a pause isn't the end of a trackpad scroll: the fingers may still be down, and only scrollend knows. Without it, or on a
// notched wheel, whose scrollend comes late, stillness is the best sign there is
const onScrollEnd = () => {
  if (!glide) arm()
}

const onScroll = () => {
  const y = scrollY
  if (glide) {
    // the glide's own move, which still counts as where the page was: the next scroll's direction is read from here
    if (Math.abs(y - glideY) <= 3) {
      lastY = y
      return
    }
    // something else moved the page, so it yields
    stopGlide()
  }
  if (y !== lastY) dir = Math.sign(y - lastY)
  lastY = y
  clearTimeout(idle)
  if (notched || !("onscrollend" in window)) arm()
}
const onWheel = (e: WheelEvent) => {
  notched = e.deltaMode !== 0 || (e.deltaY !== 0 && Math.abs((e as WheelEvent & { wheelDeltaY: number }).wheelDeltaY) % 120 === 0)
  keyed = false
  if (Math.abs(e.deltaX) + Math.abs(e.deltaY) >= 2) stopGlide()
}
const onPress = () => {
  keyed = false
  stopGlide()
}
// in a held section a key means a card, so it goes there itself: the browser's own key scroll covers a fraction of a card, and
// sometimes never starts. At a section's ends, and on anything a key operates, keys stay native
const onKey = (e: KeyboardEvent) => {
  notched = false
  keyed = true
  const way = e.shiftKey && e.key === " " ? -1 : KEY_DIR[e.key]
  if (!way || e.altKey || e.ctrlKey || e.metaKey || (e.target as Element).closest?.("a, button, input, select, textarea, [role=listbox]")) return
  const from = glide ? glideTarget : scrollY
  for (const run of runs) {
    const to = run.next(from, way)
    if (to == null) continue
    e.preventDefault()
    glideTo(to, run.move())
    return
  }
}
const listen = (on: boolean) => {
  const set = on ? addEventListener : removeEventListener
  set("scroll", onScroll, { passive: true })
  set("scrollend", onScrollEnd, { passive: true })
  set("wheel", onWheel, { passive: true })
  set("touchstart", onPress, { passive: true })
  set("pointerdown", onPress, { passive: true })
  set("pointerup", onScrollEnd, { passive: true })
  set("keydown", onKey)
  if (on) lastY = scrollY
  else {
    clearTimeout(idle)
    stopGlide()
  }
}

/** Where a row rests: every item, or as many as fit a view. */
function rowStops(row: HTMLElement, by: "item" | "view") {
  const cs = getComputedStyle(row)
  const pad = parseFloat(cs.paddingLeft) || 0
  const max = row.scrollWidth - row.clientWidth
  if (max <= 0) return [0]
  const items = [...row.children] as HTMLElement[]
  const left = (c: HTMLElement) => c.offsetLeft - row.offsetLeft - pad
  const stops = [0]
  if (by === "item") items.forEach((c) => stops.push(left(c)))
  else {
    const view = row.clientWidth - pad - (parseFloat(cs.paddingRight) || 0)
    items.forEach((c) => {
      if (left(c) + c.offsetWidth > stops[stops.length - 1] + view + 2) stops.push(left(c))
    })
  }
  const inside = stops.filter((s) => s > 1 && s < max - 1)
  return [0, ...new Set(inside), max]
}

export interface RowRun {
  /** Whether this section is held right now. Off, the row is a plain sideways row. */
  on: boolean
  /** How far below the section's top the page rests with this item in place. 0 while off. */
  offset(index: number): number
  /** On to the next resting place. Does nothing while off. */
  step(dir: 1 | -1): void
}

/** Holds a section in place while the page's own scroll walks its row through, stop by stop. Nothing is intercepted: the wheel,
    the trackpad and the keys scroll the page as ever, and the row is a function of where the page is. A sideways swipe, an arrow
    or a key moves the row natively and the page follows out of sight. When the page comes to rest between cards it settles on one.

    `host` is the tall element and needs `.avl-run`, its child the sticky `.avl-run-stage`; `row` is an `.avl-row` inside it. The
    app decides when sections are held by setting `html.avl-runs`. Without it nothing here runs, and the row is plain. */
export function useRowRun(host: RefObject<HTMLElement | null>, row: RefObject<HTMLElement | null>, by: "item" | "view" = "item"): RowRun {
  const [on, setOn] = useState(false)
  const live = useRef({ stops: [0], per: 0 })

  useEffect(() => {
    const html = document.documentElement
    const read = () => setOn(html.classList.contains("avl-runs"))
    read()
    const watch = new MutationObserver(read)
    watch.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => watch.disconnect()
  }, [])

  useEffect(() => {
    const h = host.current, r = row.current
    if (!on || !h || !r) return
    const at = live.current
    let tail = 0, painted = NaN, wrote = -1, rowLeads = 0
    const top = () => Math.round(h.getBoundingClientRect().top + scrollY)
    const moves = () => at.stops.length - 1
    const xAt = (t: number) => {
      const i = Math.min(Math.floor(t), Math.max(0, moves() - 1))
      const a = at.stops[i], b = at.stops[i + 1] ?? a
      return a + (b - a) * holdCurve(t - i)
    }
    const stopsAt = (x: number) => {
      let i = 0
      while (i < moves() - 1 && x > at.stops[i + 1]) i++
      const a = at.stops[i], b = at.stops[i + 1] ?? a
      return i + (b > a ? holdCurveInverse((x - a) / (b - a)) : 0)
    }

    // anything else that moved the row (a swipe, a drag, a key, an arrow): the page follows while the section is held
    const follow = () => {
      const x = r.scrollLeft
      if (!at.per || Math.abs(x - wrote) < 2) return false
      const a = top(), pin = a + moves() * at.per + tail
      if (scrollY < a || scrollY > pin) return false
      rowLeads = performance.now() + 120
      wrote = x
      painted = NaN
      stopGlide()
      scrollTo({ top: a + stopsAt(x) * at.per, behavior: "instant" })
      return true
    }

    const paint = () => {
      // a swipe can land between frames, before its scroll event: writing the row now would erase it
      if (!at.per || performance.now() < rowLeads || follow()) return
      const t = Math.min(moves(), Math.max(0, (scrollY - top()) / at.per))
      if (t === painted) return
      painted = t
      wrote = xAt(t)
      r.scrollLeft = wrote
    }

    const self: Run = {
      measure() {
        at.stops = rowStops(r, by)
        at.per = Math.round(tuning.hand)
        tail = Math.round(innerHeight * tuning.edge)
        h.style.setProperty("--avl-run", `${moves() ? moves() * at.per + tail : 0}px`)
        // the stops moved, so the row's place is no longer news: the next paint sets it from the page
        wrote = r.scrollLeft
        painted = NaN
        requestStageFrame()
      },
      landing(y) {
        if (!moves()) return null
        const a = top(), end = a + moves() * at.per, pin = end + tail, reach = innerHeight * tuning.edge
        // the page drawn in as it arrives. Leaving is always free
        if (y < a) return dir > 0 && a - y <= reach ? a : null
        if (y > pin) return dir < 0 && y - pin <= reach ? pin : null
        if (y >= end) return null
        // the keys are walking the row itself, so it stays where they put it
        if (r.dataset.dragging != null || (keyed && r.contains(document.activeElement))) return null
        const k = landingStop((y - a) / at.per, moves(), dir, tuning.commit)
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
    }

    if (runs.size === 0) listen(true)
    runs.add(self)
    const stopPainting = onStageFrame(paint)
    r.addEventListener("scroll", follow, { passive: true })
    const ro = new ResizeObserver(() => self.measure())
    ro.observe(r)
    addEventListener("resize", self.measure)
    document.fonts?.ready.then(() => runs.has(self) && self.measure())
    self.measure()
    return () => {
      runs.delete(self)
      if (runs.size === 0) listen(false)
      stopPainting()
      r.removeEventListener("scroll", follow)
      ro.disconnect()
      removeEventListener("resize", self.measure)
      h.style.removeProperty("--avl-run")
      at.per = 0
      at.stops = [0]
    }
  }, [on, by, host, row])

  const offset = useCallback(
    (index: number) => {
      const r = row.current, at = live.current
      const c = r?.children[index] as HTMLElement | undefined
      if (!r || !c || !at.per) return 0
      const left = c.offsetLeft - r.offsetLeft - (parseFloat(getComputedStyle(r).paddingLeft) || 0)
      let k = 0
      while (k < at.stops.length - 1 && at.stops[k + 1] <= left + 1) k++
      return k * at.per
    },
    [row],
  )
  const step = useCallback(
    (dir: 1 | -1) => {
      const r = row.current
      if (!r) return
      const x = r.scrollLeft, stops = live.current.stops
      const to = dir > 0 ? stops.find((s) => s > x + 2) : [...stops].reverse().find((s) => s < x - 2)
      if (to != null) r.scrollTo({ left: to, behavior: "smooth" })
    },
    [row],
  )
  return { on, offset, step }
}
