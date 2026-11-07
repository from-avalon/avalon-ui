/* Reading a wheel gesture. A Mac trackpad keeps sending wheel events for a second or more after the fingers lift, so one
   flick looks like a long scroll. What tells them apart is the shape: momentum decays, a hand doesn't. */

const NEW_GESTURE_GAP_MS = 130
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
  private last = -Infinity

  read(delta: number, now: number): void {
    const size = Math.abs(delta)
    const gap = now - this.last
    this.last = now
    const r = this.recent
    // a new flick can land on the tail of the old one: there's no gap, but the input jumps up
    const fresh = gap > NEW_GESTURE_GAP_MS || (isDecaying(r) && size > r[r.length - 1] * 1.6 + 2)
    if (fresh) {
      this.spent = false
      this.leaving = false
      this.gathered = 0
      r.length = 0
    }
    r.push(size)
    if (r.length > WINDOW) r.shift()
    if (Math.sign(delta) !== Math.sign(this.gathered)) this.gathered = 0
    this.gathered += delta
  }

  /** A hand still pushing: steady input, strong enough not to be the last of a flick. */
  get sustained(): boolean {
    const r = this.recent
    return r.length >= 4 && !isDecaying(r) && r.reduce((a, b) => a + b, 0) / r.length >= 3
  }

  spend(): void {
    this.spent = true
    this.gathered = 0
  }
}
