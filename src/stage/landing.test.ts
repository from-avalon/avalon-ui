import assert from "node:assert/strict"
import { test } from "node:test"
import { dragLanding, holdCurve, holdCurveInverse, landingStop, nextStop, notchedWheel, sectionLanding, sectionStep, viewStops } from "./landing.ts"

// the hero at 0, a held section 900 to 2100 whose last stop is 1900, a plain one at 3000, and a tall free one 4000 to 4500
const P = [
  { in: 0, out: 0, back: 0, free: false },
  { in: 900, out: 2100, back: 1900, free: false },
  { in: 3000, out: 3000, back: 3000, free: false },
  { in: 4000, out: 4500, back: 4500, free: true },
]
const N = 80
const land = (y: number, dir: number, from = y, need = N, pull = 1, back = 0.5) => sectionLanding(y, P, { dir, from, need, pull, back })

test("a page inside a section stays put", () => {
  for (const y of [0, 900, 1500, 2100, 4200]) assert.equal(land(y, 1), null)
  assert.equal(land(4500, -1), null)
})

test("forward: past the nudge goes on, short of it comes back", () => {
  assert.deepEqual(land(2300, 1, 2100), { to: 3000, rest: 3000 })
  assert.deepEqual(land(2180, 1, 2100), { to: 3000, rest: 3000 })
  assert.deepEqual(land(2150, 1, 2100), { to: 2100, rest: 2100 })
})

test("backward: past the nudge goes back onto the last stop, short of it returns", () => {
  assert.deepEqual(land(2800, -1, 3000), { to: 2100, rest: 1900 })
  assert.deepEqual(land(2950, -1, 3000), { to: 3000, rest: 3000 })
})

test("no direction takes the nearer", () => {
  assert.deepEqual(land(2300, 0), { to: 2100, rest: 2100 })
  assert.deepEqual(land(2800, 0), { to: 3000, rest: 3000 })
})

test("a trip that flew past a section doesn't carry on and skip it", () => {
  // from the held section, past the plain one, a little short of half way on: back to the one it hasn't shown yet
  assert.deepEqual(land(3300, 1, 2100), { to: 3000, rest: 3000 })
  // from inside that section, the same place means moving on
  assert.deepEqual(land(3300, 1, 3000), { to: 4000, rest: 4000 })
  // nearer the next, it goes on
  assert.deepEqual(land(3700, 1, 2100), { to: 4000, rest: 4000 })
  // and the same going up
  assert.deepEqual(land(2800, -1, 3500), { to: 3000, rest: 3000 })
  assert.deepEqual(land(2800, -1, 3000), { to: 2100, rest: 1900 })
  assert.deepEqual(land(2300, -1, 3500), { to: 2100, rest: 1900 })
})

test("how far an overshoot comes back from can be set", () => {
  // 1000 between the plain section and the tall one, and this trip is 700 past it
  assert.deepEqual(land(3700, 1, 2100, N, 1, 0.5), { to: 4000, rest: 4000 })
  assert.deepEqual(land(3700, 1, 2100, N, 1, 0.8), { to: 3000, rest: 3000 })
  // going up, this trip is 700 past the plain section
  assert.deepEqual(land(2300, -1, 3500, N, 1, 0.5), { to: 2100, rest: 1900 })
  assert.deepEqual(land(2300, -1, 3500, N, 1, 0.8), { to: 3000, rest: 3000 })
})

test("the pull limits the trip, and 0 is off", () => {
  assert.equal(land(2300, 1, 2100, N, 0), null)
  assert.equal(land(2300, 1, 2100, N, 0.5), null)
  assert.deepEqual(land(2700, 1, 2100, N, 0.5), { to: 3000, rest: 3000 })
  assert.deepEqual(land(2150, 1, 2100, N, 0.1), { to: 2100, rest: 2100 })
})

test("a nudge of 1, as for a wheel notch, always moves on", () => {
  assert.deepEqual(land(2110, 1, 2100, 1), { to: 3000, rest: 3000 })
})

test("keys go a section at a time, and leave a free section to the browser", () => {
  assert.deepEqual(sectionStep(0, P, 1), { to: 900, rest: 900 })
  assert.equal(sectionStep(0, P, -1), null)
  assert.deepEqual(sectionStep(900, P, -1), { to: 0, rest: 0 })
  assert.deepEqual(sectionStep(1900, P, 1), { to: 3000, rest: 3000 })
  assert.deepEqual(sectionStep(3000, P, -1), { to: 2100, rest: 1900 })
  assert.deepEqual(sectionStep(3000, P, 1), { to: 4000, rest: 4000 })
  for (const y of [4000, 4200, 4500]) assert.equal(sectionStep(y, P, 1), null)
  assert.equal(sectionStep(4200, P, -1), null)
  assert.deepEqual(sectionStep(4000, P, -1), { to: 3000, rest: 3000 })
})

test("a landing inside a held section goes by direction, past the commit", () => {
  assert.equal(landingStop(1.2, 4, 1, 0.14), 2)
  assert.equal(landingStop(1.1, 4, 1, 0.14), 1)
  assert.equal(landingStop(1.8, 4, -1, 0.14), 1)
  assert.equal(landingStop(1.9, 4, -1, 0.14), 2)
  assert.equal(landingStop(1.4, 4, 0, 0.14), 1)
  assert.equal(landingStop(-0.1, 4, 1, 0.14), null)
  assert.equal(landingStop(4.1, 4, 1, 0.14), null)
})

test("the hold curve rises all the way, and inverts", () => {
  let last = 0
  for (let f = 0.05; f < 1; f += 0.05) {
    const k = holdCurve(f, 2)
    assert.ok(k > last, `rises at ${f}`)
    last = k
    assert.ok(Math.abs(holdCurveInverse(k, 2) - f) < 1e-9, `inverts at ${f}`)
  }
  assert.equal(holdCurve(0, 2), 0)
  assert.equal(holdCurve(1, 2), 1)
  assert.equal(holdCurve(0.3, 1), 0.3)
})

test("view stops take as many whole items as fit, and end at the end", () => {
  const items = Array.from({ length: 6 }, (_, i) => ({ left: i * 300, width: 280 }))
  // three fit in 900, and the last stop is wherever the row ends
  assert.deepEqual(viewStops(items, 900, 860), [0, 860])
  assert.deepEqual(viewStops(items, 600, 1200), [0, 600, 1200])
  // one per view: every item is a stop
  assert.deepEqual(viewStops(items, 300, 1500), [0, 300, 600, 900, 1200, 1500])
  // nothing to scroll
  assert.deepEqual(viewStops(items, 2000, 0), [0])
})

test("the next stop goes each way, and stops at the ends", () => {
  const stops = [0, 600, 1200]
  assert.equal(nextStop(stops, 0, 1), 600)
  assert.equal(nextStop(stops, 300, 1), 600)
  assert.equal(nextStop(stops, 600, 1), 1200)
  assert.equal(nextStop(stops, 1200, 1), null)
  assert.equal(nextStop(stops, 300, -1), 0)
  assert.equal(nextStop(stops, 0, -1), null)
})

test("a drag lands the way it was going", () => {
  const places = [0, 500, 1000]
  assert.equal(dragLanding(places, 120, 1), 500)
  assert.equal(dragLanding(places, 480, -1), 0)
  assert.equal(dragLanding(places, 500, 1), 500)
  assert.equal(dragLanding(places, 500, -1), 500)
  assert.equal(dragLanding(places, 500, 0), 500)
  assert.equal(dragLanding(places, 1400, 1), 1000)
})

test("a notched wheel is told from a trackpad", () => {
  assert.equal(notchedWheel(0, -120, 100), true)
  assert.equal(notchedWheel(1, -3, 3), true)
  // a trackpad's wheelDelta is three times its delta, even on a multiple of 120
  assert.equal(notchedWheel(0, -120, 40), false)
  assert.equal(notchedWheel(0, -30, 10), false)
  assert.equal(notchedWheel(0, 0, 0.5), false)
})
