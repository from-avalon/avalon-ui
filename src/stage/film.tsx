"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** The next clock reading. Wall time, never capped per frame: a slow machine drops frames and still lands on time. */
export function stepClock(t: number, last: number, now: number): number {
  return t + Math.max(0, now - last) / 1000
}

interface FilmClockOptions {
  /** Seconds. */
  duration: number
  autoplay?: boolean
  onFrame?: (t: number) => void
  onEnd?: () => void
}

export interface FilmClock {
  playing: boolean
  toggle: () => void
  skip: () => void
}

/** A clock for an intro that plays by itself. A hidden tab holds it; returning picks up where it was. */
export function useFilmClock({ duration, autoplay = true, onFrame, onEnd }: FilmClockOptions): FilmClock {
  const [playing, setPlaying] = useState(autoplay)
  const cb = useRef({ onFrame, onEnd })
  cb.current = { onFrame, onEnd }
  const t = useRef(0)
  const done = useRef(false)

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    t.current = duration
    setPlaying(false)
    cb.current.onFrame?.(duration)
    cb.current.onEnd?.()
  }, [duration])

  useEffect(() => {
    if (!playing || done.current) return
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      if (!document.hidden) t.current = stepClock(t.current, last, now)
      last = now
      if (t.current >= duration) return finish()
      cb.current.onFrame?.(t.current)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [playing, duration, finish])

  return { playing, toggle: useCallback(() => setPlaying((p) => !p), []), skip: finish }
}

/** Pause and Skip for an intro, on screen from its first frame. */
export function FilmBar({ clock, skipLabel = "Skip" }: { clock: FilmClock; skipLabel?: string }) {
  return (
    <div className="avl-film-bar" role="group" aria-label="Intro">
      <button type="button" onClick={clock.toggle}>
        {clock.playing ? "Pause" : "Play"}
      </button>
      <button type="button" className="avl-film-skip" onClick={clock.skip}>
        {skipLabel}
      </button>
    </div>
  )
}
