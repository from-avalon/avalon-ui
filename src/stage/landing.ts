/* The arithmetic of where things land, with no page in sight: plain functions of positions, tested in landing.test.ts. */

/** One section's resting places, as page positions. */
export interface SectionPlace {
  /** The first position where it fills the screen. */
  in: number
  /** The last position where it fills the screen. */
  out: number
  /** Where the page stays after coming back to it from below. A held section rests on its last stop: it looks the same as `out`,
      but answers the next scroll at once. */
  back: number
  /** Taller than the screen and not held, so the page moves freely inside it. */
  free: boolean
}

/** The visible movement ends at `to`, and the page then stays at `rest`. */
export interface SectionMove {
  to: number
  rest: number
}

/** Keys pressed on these are theirs. */
export const OWN_KEYS = "a, button, input, select, textarea, [role=listbox]"

/** How a page at rest came to be there, and how strongly it lands. */
export interface LandingFeel {
  /** The way it was last going. */
  dir: number
  /** Where that trip began. */
  from: number
  /** Px past a section that count as leaving it. */
  need: number
  /** The longest trip it will make to land, as a share of the space between the two sections. 1 always lands, 0 never does. */
  pull: number
  /** How far past a section a trip that flew past it can have gone and still come back, as a share of that space. */
  back: number
}

/** The landing for a page at rest between two sections, or null to leave it be. */
export function sectionLanding(y: number, places: SectionPlace[], { dir, from, need, pull, back }: LandingFeel): SectionMove | null {
  if (pull <= 0) return null
  for (let i = 0; i < places.length - 1; i++) {
    const a = places[i], b = places[i + 1]
    if (y <= a.out || y >= b.in) continue
    const past = y - a.out, short = b.in - y, gap = b.in - a.out
    let onward: boolean
    // a trip that flew past a section hasn't shown it yet, so it goes back there rather than carry on and skip it
    if (dir > 0 && from < a.in - 1) onward = past > back * gap
    else if (dir < 0 && from > b.out + 1) onward = short <= back * gap
    else onward = dir > 0 ? past >= need : dir < 0 ? short < need : short < past
    if ((onward ? short : past) > pull * gap) return null
    if (onward) return { to: b.in, rest: b.in }
    return { to: a.out, rest: dir < 0 ? a.back : a.out }
  }
  return null
}

/** Where a key goes from `y` when it's not walking a held row: the next section along, or null inside a free section, where the
    browser's own key scroll is right. */
export function sectionStep(y: number, places: SectionPlace[], way: 1 | -1): SectionMove | null {
  if (way > 0) {
    if (places.some((p) => p.free && y >= p.in - 1 && y < p.out - 1)) return null
    const next = places.find((p) => p.in > y + 1)
    return next ? { to: next.in, rest: next.in } : null
  }
  if (places.some((p) => p.free && y > p.in + 1 && y <= p.out + 1)) return null
  for (let i = places.length - 1; i >= 0; i--) if (places[i].back < y - 1) return { to: places[i].out, rest: places[i].back }
  return null
}

/** Where a page at rest should land inside a held section, in stops from its start, or null to leave it be. `t` is the position in
    stops, and `need` the share of a move that counts as moving on. */
export function landingStop(t: number, moves: number, dir: number, need: number): number | null {
  if (t < 0 || t > moves) return null
  const i = Math.floor(t), f = t - i
  if (dir > 0) return f > need ? i + 1 : i
  if (dir < 0) return f < 1 - need ? i : i + 1
  return Math.round(t)
}

/** A held row's position within a move, for the page's position within it. Both run 0 to 1 and it never stops rising, so it always
    answers the hand. Being a plain function of the scroll, it adds no delay. `snap` 1 moves evenly; 2 to 3 lingers on each stop and
    crosses quickly between them. */
export function holdCurve(f: number, snap: number) {
  if (f <= 0) return 0
  if (f >= 1) return 1
  const a = Math.pow(f, snap)
  return a / (a + Math.pow(1 - f, snap))
}

/** The inverse of holdCurve: the page's position for a row position. */
export function holdCurveInverse(k: number, snap: number) {
  if (k <= 0) return 0
  if (k >= 1) return 1
  const r = Math.pow(k / (1 - k), 1 / snap)
  return r / (1 + r)
}

/** Where a row rests going a view at a time: as many whole items as fit, then on. `view` is the room for items and `max` how far
    the row scrolls. It always starts at 0 and ends at `max`. */
export function viewStops(items: { left: number; width: number }[], view: number, max: number) {
  if (max <= 0) return [0]
  const stops = [0]
  for (const { left, width } of items) if (left + width > stops[stops.length - 1] + view + 2) stops.push(left)
  return [0, ...new Set(stops.filter((s) => s > 1 && s < max - 1)), max]
}

/** The next stop from `x` that way, or null at the end. */
export function nextStop(stops: number[], x: number, way: 1 | -1): number | null {
  const to = way > 0 ? stops.find((s) => s > x + 2) : [...stops].reverse().find((s) => s < x - 2)
  return to ?? null
}

/** Where a row lands when a drag lets go: the next place the way it was dragged, or where it is if that's a place already. */
export function dragLanding(places: number[], x: number, way: number) {
  if (way < 0) return [...places].reverse().find((s) => s <= x + 2) ?? places[0]
  return places.find((s) => s >= x - 2) ?? places[places.length - 1]
}

/** Whether a wheel event came from a notched mouse wheel, which can't say less than a notch. A notch reports a wheelDelta in
    multiples of 120. So can a trackpad, whose wheelDelta is three times its delta, which is how they're told apart. */
export function notchedWheel(deltaMode: number, wheelDelta: number, deltaY: number) {
  const notch = Math.abs(wheelDelta)
  return deltaMode !== 0 || (notch >= 120 && notch % 120 === 0 && Math.abs(notch - 3 * Math.abs(deltaY)) >= 1)
}
