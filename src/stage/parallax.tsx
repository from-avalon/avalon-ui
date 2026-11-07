"use client"

import { useEffect, useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { onStageFrame } from "./frame"
import { useMotion } from "./motion"

interface ParallaxPlaneProps {
  /** Share of the scroll this layer lags by: .4 is far, negative runs ahead of the page. */
  depth: number
  /** Wide screens only. */
  desk?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** One layer of a section's backdrop, moved by the scroll. Transform only. The plane overhangs its section by exactly
    its travel, so no edge ever shows. */
export function ParallaxPlane({ depth, desk, className, style, children }: ParallaxPlaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()
  useEffect(() => {
    const el = ref.current
    const host = el?.closest("section")
    if (!el || !host || reduced) return
    const narrow = matchMedia("(max-width: 760px)")
    if (desk && narrow.matches) return
    return onStageFrame(() => {
      const r = host.getBoundingClientRect()
      // inside a run the stage holds still, so the plane's travel is sized to the stage, spread over the whole run
      const stage = el.closest<HTMLElement>(".avl-run-stage")
      const span = ((innerHeight + (stage ? stage.offsetHeight : r.height)) / 2) * depth
      const over = `${-(Math.abs(span) + 2)}px`
      if (el.style.top !== over) el.style.top = el.style.bottom = over
      if (r.bottom < -200 || r.top > innerHeight + 200) return
      const p = (innerHeight - r.top) / (innerHeight + r.height)
      el.style.transform = `translate3d(0, ${(p * 2 - 1) * span}px, 0)`
    })
  }, [depth, desk, reduced])
  return (
    <div ref={ref} className={`avl-plane ${className ?? ""}`} data-desk={desk || undefined} style={style}>
      {children}
    </div>
  )
}

/** A band of drifting mist for a section's backdrop. The image comes from `--avl-mist` on any ancestor. */
export function MistBand({ depth, desk, near }: { depth: number; desk?: boolean; near?: boolean }) {
  return (
    <ParallaxPlane depth={depth} desk={desk} className={`avl-mist${near ? " avl-mist-near" : ""}`}>
      <i />
    </ParallaxPlane>
  )
}
