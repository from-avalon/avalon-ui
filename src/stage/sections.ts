/* Where a page at rest lands between two sections, and where a key goes. Plain functions of page positions. */

/** One section's resting places, as page positions. */
export interface SectionPlace {
  /** The first position where it fills the screen. */
  in: number
  /** The last position where it fills the screen. */
  out: number
  /** Where the page stays after coming back to it from below. A held section rests on its last card: it looks the same as `out`,
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

/** The landing for a page at rest between two sections, or null to leave it be. `dir` is the way it was last going, and `need` the
    px past a section that count as leaving it. `pull` is the longest trip the page will make to land, as a share of the space
    between the two sections: 1 always lands, 0 never does. */
export function sectionLanding(y: number, places: SectionPlace[], dir: number, need: number, pull: number): SectionMove | null {
  if (pull <= 0) return null
  for (let i = 0; i < places.length - 1; i++) {
    const a = places[i], b = places[i + 1]
    if (y <= a.out || y >= b.in) continue
    const past = y - a.out, short = b.in - y
    const onward = dir > 0 ? past >= need : dir < 0 ? short < need : short < past
    if ((onward ? short : past) > pull * (b.in - a.out)) return null
    if (onward) return { to: b.in, rest: b.in }
    return { to: a.out, rest: dir < 0 ? a.back : a.out }
  }
  return null
}

/** Where a key goes from `y` when it's not walking a row: the next section along, or null inside a free section, where the
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
