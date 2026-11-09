"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import type { CSSProperties } from "react"
import { createDepthPlane } from "./depth-gl"
import type { DepthHandle, DepthOptions } from "./depth-gl"
import { PHONE, useMotion } from "./motion"

export interface DepthCamera {
  cam(x: number, y: number): void
}

interface DepthPlaneProps extends DepthOptions {
  src: string
  alt?: string
  width: number
  height: number
  className?: string
  style?: CSSProperties
  loading?: "lazy" | "eager"
  /** Hold the current frame, as when something covers most of this plane. */
  hold?: boolean
}

/** A painting that moves in depth with a camera the page drives. Phones and reduced motion keep the plain <img>. */
export const DepthPlane = forwardRef<DepthCamera, DepthPlaneProps>(function DepthPlane(
  { src, alt = "", width, height, className, style, loading = "lazy", hold = false, ...options },
  ref,
) {
  const host = useRef<HTMLDivElement>(null)
  const plane = useRef<DepthHandle | null>(null)
  const { reduced, paused } = useMotion()
  const opts = useRef(options)
  const stopped = paused || hold
  const pausedNow = useRef(stopped)
  pausedNow.current = stopped

  useImperativeHandle(ref, () => ({ cam: (x, y) => plane.current?.cam(x, y) }), [])

  useEffect(() => {
    const el = host.current
    if (!el || reduced || matchMedia(PHONE).matches) return
    let dead = false
    const watch = el.closest("[data-depth-watch], section") ?? el
    // WebGL contexts are scarce and start-up is the costly part, so a plane only comes up when it's nearly on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        createDepthPlane(el, src, watch, opts.current)
          .then((p) => {
            if (dead) p?.destroy()
            else {
              plane.current = p
              p?.setPaused(pausedNow.current)
            }
          })
          .catch((e) => console.warn("depth plane off:", e?.message ?? e))
      },
      { rootMargin: "60% 0px" },
    )
    io.observe(watch)
    return () => {
      dead = true
      io.disconnect()
      plane.current?.destroy()
      plane.current = null
    }
  }, [src, reduced])

  useEffect(() => {
    plane.current?.setPaused(stopped)
  }, [stopped])

  return (
    <div ref={host} className={`avl-depth ${className ?? ""}`} style={style}>
      <img src={src} alt={alt} width={width} height={height} loading={loading} fetchPriority="low" />
    </div>
  )
})
