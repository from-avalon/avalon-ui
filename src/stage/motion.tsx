"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import type { ReactNode } from "react"
import { followAnchors } from "./frame"

/* One switch for all ambient motion. Sets `html.rm` under prefers-reduced-motion and `html.motion-off` while paused,
   so CSS loops stop with the canvases. */

export function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false)
}

export interface Motion {
  /** The visitor asked their system for reduced motion. */
  reduced: boolean
  /** The visitor pressed pause. */
  paused: boolean
  toggle: () => void
}

const MotionContext = createContext<Motion>({ reduced: false, paused: false, toggle: () => {} })

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)")
  const [paused, setPaused] = useState(false)
  const toggle = useCallback(() => setPaused((p) => !p), [])
  useEffect(() => {
    document.documentElement.classList.toggle("rm", reduced)
    document.documentElement.classList.toggle("motion-off", paused)
  }, [reduced, paused])
  useEffect(followAnchors, [])
  const value = useMemo(() => ({ reduced, paused, toggle }), [reduced, paused, toggle])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotion(): Motion {
  return useContext(MotionContext)
}

export function MotionToggle({ className }: { className?: string }) {
  const { reduced, paused, toggle } = useMotion()
  if (reduced) return null
  const label = paused ? "Play the motion" : "Pause the motion"
  return (
    <button type="button" className={`avl-motion ${className ?? ""}`} aria-pressed={paused} title={label} onClick={toggle}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {paused ? <path className="avl-motion-play" d="M8 5l11 7-11 7z" /> : <path d="M8 5v14M16 5v14" />}
      </svg>
      <span className="avl-sr">{label}</span>
    </button>
  )
}
