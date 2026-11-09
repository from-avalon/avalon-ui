"use client"

import { useEffect, useState } from "react"
import { OWN_KEYS, notchedWheel, sectionLanding, sectionStep } from "./landing"
import type { SectionMove, SectionPlace } from "./landing"

/* A page at rest lands: between sections, and inside a held section. Nothing is intercepted: the page moves with the hand until it
   stops, and this is the only thing here that moves it, once it has come to rest. Any input takes over at once. */

/** The feel of the page's landings and of a held section, in one place. */
export interface RunTuning {
  /** How strongly the page lands between sections: the longest trip it will make, as a share of the space between them. 1 always
      lands, lower lands only when close, 0 turns it off. */
  sectionPull: number
  /** Scroll past a section, in px, that counts as leaving it. Short of it, the section comes back. */
  sectionNudge: number
  /** How long landing takes, in ms, across a whole screen. */
  sectionGlide: number
  /** How far past a section a long trip can overshoot and still come back to it, in screens. Past that it lands on the next one,
      and the section it flew past is skipped. */
  sectionBack: number
  /** How long after the scroll ends, in ms, the page lands. */
  wait: number
  /** A held section: scroll spent per stop, in px. More and a flick covers fewer stops, but the page gets longer. A flick is the same
      distance on any screen, so this doesn't scale with one. */
  hand: number
  /** A held section: how firmly a stop holds its place. 1 moves evenly; 2 to 3 lingers on each and crosses quickly between them. */
  snap: number
  /** A held section: how far towards the next stop counts as meaning to go there, from 0 to 1. Short of it, the page comes back. */
  commit: number
  /** A held section: how long a settle takes, in ms, across a whole stop. */
  glide: number
  /** A held section: in viewport heights, how long the last stop stays held before the section lets go. */
  edge: number
}

export const tuning: RunTuning = { sectionPull: 1, sectionNudge: 80, sectionGlide: 620, sectionBack: 0.5, wait: 120, hand: 500, snap: 2, commit: 0.14, glide: 420, edge: 0.22 }

export const getRunTuning = (): RunTuning => ({ ...tuning })

/** Changes the feel live, and re-measures every held section. */
export function setRunTuning(next: Partial<RunTuning>) {
  Object.assign(tuning, next)
  runs.forEach((r) => r.measure())
}

/** A held section, as useRowRun registers it. */
export interface Run {
  host: HTMLElement
  measure(): void
  /** The page position it wants a resting page at, or null. */
  landing(y: number, dir: number, notched: boolean): number | null
  /** The next resting place from `from` that way, or null when that's outside it. */
  next(from: number, way: 1 | -1): number | null
  /** One move's worth of scroll, in px. */
  move(): number
  /** Where the page rests on the last stop. */
  lastStop(): number
}

const runs = new Set<Run>()
const KEY_DIR: Record<string, 1 | -1> = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 }
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
// from a page already at rest, so it starts with no jolt, and it lands softly
const soft = (x: number) => x * x * (6 - 8 * x + 3 * x * x)

let lastY = 0, dir = 0, keyed = false, notched = false, held = false
// where the page last rested, while it's on its way somewhere
let tripFrom: number | null = null
let idle: ReturnType<typeof setTimeout> | undefined
let glide = 0, glideY = 0, glideTarget = 0
let handAt = -Infinity
let sections: string[] = []

export const stopGlide = () => {
  cancelAnimationFrame(glide)
  glide = 0
}

/** Whether a hand is scrolling the page just now, and not sideways. */
export const handOnPage = () => performance.now() - handAt < 150

function glideTo(to: number, ms: number, ease: (x: number) => number, rest = to) {
  stopGlide()
  // a landing still waiting to start knows less than this one
  clearTimeout(idle)
  glideTarget = rest
  const from = scrollY
  // a scroll event may still be on its way from before this started, and it must read as this glide's own
  glideY = from
  let start = 0
  const tick = (now: number) => {
    // the first frame's stamp can predate this call, so it starts the clock
    start ||= now
    const k = Math.min(1, (now - start) / ms)
    glideY = k < 1 ? from + (to - from) * ease(k) : rest
    scrollTo({ top: glideY, behavior: "instant" })
    glide = k < 1 ? requestAnimationFrame(tick) : 0
  }
  glide = requestAnimationFrame(tick)
}

const glideStop = (to: number, move: number) => glideTo(to, Math.min(tuning.glide, Math.max(160, tuning.glide * Math.sqrt(Math.abs(to - scrollY) / Math.max(1, move)))), easeOut)
const glideSection = ({ to, rest }: SectionMove) => glideTo(to, Math.max(200, tuning.sectionGlide * Math.sqrt(Math.abs(to - scrollY) / innerHeight)), soft, rest)

function readPlaces(): SectionPlace[] {
  const max = document.documentElement.scrollHeight - innerHeight
  return sections.flatMap((id) => {
    const el = document.getElementById(id)
    if (!el) return []
    const top = Math.round(el.getBoundingClientRect().top + scrollY)
    const out = Math.min(max, top + Math.max(0, el.offsetHeight - innerHeight))
    const run = [...runs].find((r) => r.host === el)
    return [{ in: Math.min(max, top), out, back: run ? run.lastStop() : out, free: !run && out > top + 1 }]
  })
}

/** The browser lands the page itself, with html.avl-snap-native, and does the keys too: nothing here moves it then. */
export const snapNative = () => document.documentElement.classList.contains("avl-snap-native")

function settle() {
  if (held || snapNative()) return
  const y = scrollY, from = tripFrom ?? y
  tripFrom = null
  // the browser just brought something focused into view, so it stays in view
  if (keyed && document.activeElement && document.activeElement !== document.body) return
  for (const run of runs) {
    const to = run.landing(y, dir, notched)
    if (to == null) continue
    if (Math.abs(to - y) >= 1) glideStop(to, run.move())
    return
  }
  // a notched wheel can't say less than a notch, and a notch means moving on
  const land = sectionLanding(y, readPlaces(), { dir, from, need: notched ? 1 : tuning.sectionNudge, pull: tuning.sectionPull, back: tuning.sectionBack })
  if (land && Math.abs(land.to - y) >= 1) glideSection(land)
}

const arm = (ms = tuning.wait) => {
  clearTimeout(idle)
  idle = setTimeout(settle, ms)
}

// a pause isn't the end of a trackpad scroll: the fingers may still be down, and scrollend knows. So stillness only counts on a
// notched wheel, whose scrollend comes late, or after a longer wait where scrollend is missing or doesn't come (Firefox had it,
// and didn't fire it for a wheel when driven headless)
const stillness = () => (notched ? tuning.wait : "onscrollend" in window ? tuning.wait * 6 : tuning.wait * 2.5)
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
  tripFrom ??= lastY
  if (y !== lastY) dir = Math.sign(y - lastY)
  lastY = y
  arm(stillness())
}
const onWheel = (e: WheelEvent) => {
  notched = notchedWheel(e.deltaMode, (e as WheelEvent & { wheelDeltaY: number }).wheelDeltaY, e.deltaY)
  keyed = false
  // a sideways scroll moves a row and not the page, so a landing carries on under it
  if (e.shiftKey || Math.abs(e.deltaY) < 2 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
  handAt = performance.now()
  if (!glide) return
  stopGlide()
  // should this one move nothing after all, the landing is only put off
  arm(stillness())
}
const onPress = () => {
  keyed = false
  stopGlide()
}
// a press holds the page where it is until it's let go
const onDown = () => {
  held = true
  onPress()
}
const onUp = () => {
  held = false
  onScrollEnd()
}
// a release can go unseen, as on a scrollbar. No button down on the next move means it happened
const onMove = (e: PointerEvent) => {
  if (held && !e.buttons) onUp()
}
// up and down mean a stop, or at a section's ends the next section, so the key goes there itself: the browser's own key scroll
// covers a fraction of one, and sometimes never starts. On anything a key operates, and with the section snap off, keys stay native
const onKey = (e: KeyboardEvent) => {
  if (snapNative()) return
  notched = false
  keyed = true
  const way = e.shiftKey && e.key === " " ? -1 : KEY_DIR[e.key]
  if (!way || e.altKey || e.ctrlKey || e.metaKey || (e.target as Element).closest?.(OWN_KEYS)) return
  const from = glide ? glideTarget : scrollY
  for (const run of runs) {
    const to = run.next(from, way)
    if (to == null) continue
    e.preventDefault()
    glideStop(to, run.move())
    return
  }
  const step = tuning.sectionPull > 0 ? sectionStep(from, readPlaces(), way) : null
  if (!step) return
  e.preventDefault()
  glideSection(step)
}
// the sections moved under the page, and it wasn't going anywhere
const onResize = () => {
  dir = 0
  arm(stillness())
}
const listen = (on: boolean) => {
  const set = on ? addEventListener : removeEventListener
  set("scroll", onScroll, { passive: true })
  set("scrollend", onScrollEnd, { passive: true })
  set("wheel", onWheel, { passive: true })
  set("touchstart", onPress, { passive: true })
  set("pointerdown", onDown, { passive: true })
  set("pointerup", onUp, { passive: true })
  set("pointercancel", onUp, { passive: true })
  set("pointermove", onMove, { passive: true })
  set("keydown", onKey)
  set("resize", onResize)
  if (on) {
    lastY = scrollY
    onResize()
  } else {
    clearTimeout(idle)
    stopGlide()
    held = false
    tripFrom = null
  }
}

let users = 0
const join = () => {
  if (users++ === 0) listen(true)
  return () => {
    if (--users === 0) listen(false)
  }
}

/** Puts a held section in the settle. Returns the way out. */
export function addRun(run: Run) {
  runs.add(run)
  const leave = join()
  return () => {
    runs.delete(run)
    leave()
  }
}

/** Whether the page lands right now: the app decides, by setting `html.avl-snap`. */
export function useSnapOn() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const html = document.documentElement
    const read = () => setOn(html.classList.contains("avl-snap"))
    read()
    const watch = new MutationObserver(read)
    watch.observe(html, { attributes: true, attributeFilter: ["class"] })
    return () => watch.disconnect()
  }, [])
  return on
}

/** The page's sections, top to bottom: a page at rest between two of them lands on one. */
export function useSectionSnap(ids: string[]) {
  const on = useSnapOn()
  useEffect(() => {
    if (!on) return
    sections = ids
    const leave = join()
    return () => {
      leave()
      sections = []
    }
  }, [on, ids])
}
