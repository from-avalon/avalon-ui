/* Reading a wheel gesture. A Mac trackpad keeps sending wheel events for a second or more after the fingers lift, so one
   flick looks like a long scroll. What tells them apart is the shape: momentum decays, a hand doesn't. */

const NEW_GESTURE_GAP_MS = 130
/** Past this, any input is a new gesture, however gentle: a flick's momentum never pauses this long. */
const SURE_GAP_MS = 400
const WINDOW = 8

/** True when recent magnitudes are falling: the tail of a flick. Equal values aren't falling, so a mouse wheel never is. */
export function isDecaying(recent: number[]): boolean {
  const n = recent.length
  if (n < 6) return false
  const newer = (recent[n - 1] + recent[n - 2] + recent[n - 3]) / 3
  const older = (recent[n - 4] + recent[n - 5] + recent[n - 6]) / 3
  return newer < older * 0.98
}

export class WheelReader {
  /** This gesture has already moved something, so what's left of it is absorbed. */
  spent = false
  /** Signed input gathered since the last step. */
  gathered = 0
  /** This gesture is on its way out of a run, so it's left alone. */
  leaving = false
  private recent: number[] = []
  private peak = 0
  private last = -Infinity

  /** `held` while a step is playing: a dropped frame then says nothing, so only a long silence can start a new gesture. */
  read(delta: number, now: number, held = false): void {
    const size = Math.abs(delta)
    const gap = now - this.last
    this.last = now
    const r = this.recent
    // a short gap with small input is a busy main thread dropping frames from a tail, not a new hand. And a new flick can land on
    // the tail of the old one: there's no gap, but the input jumps up
    const fresh = gap > SURE_GAP_MS || (!held && ((gap > NEW_GESTURE_GAP_MS && size >= this.peak * 0.35) || (isDecaying(r) && size > r[r.length - 1] * 1.6 + 2)))
    if (fresh) {
      this.spent = false
      this.leaving = false
      this.gathered = 0
      this.peak = 0
      r.length = 0
    }
    this.peak = Math.max(this.peak, size)
    r.push(size)
    if (r.length > WINDOW) r.shift()
    if (Math.sign(delta) !== Math.sign(this.gathered)) this.gathered = 0
    this.gathered += delta
  }

  /** A hand still pushing: steady input, close to the gesture's peak. The end of a flick can look steady for a moment, since
      its deltas are small whole numbers, but it's nowhere near the peak. */
  get sustained(): boolean {
    const r = this.recent
    const mean = r.reduce((a, b) => a + b, 0) / Math.max(1, r.length)
    return r.length >= 4 && !isDecaying(r) && mean >= 3 && mean >= this.peak * 0.45
  }

  spend(): void {
    this.spent = true
    this.gathered = 0
  }
}
