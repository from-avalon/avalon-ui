"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties, ElementType, ReactNode, RefObject } from "react"

export function useInView<T extends Element>(ref: RefObject<T | null>, options?: { rootMargin?: string; threshold?: number; once?: boolean }): boolean {
  const [inView, setInView] = useState(false)
  const { rootMargin = "0px", threshold = 0, once = false } = options ?? {}
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, threshold, once])
  return inView
}

interface RevealProps {
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** Seconds before this one rises. */
  delay?: number
  children: ReactNode
  [attr: string]: unknown
}

/** Rises into place the first time it comes into view. Opacity and transform only, so it stays in the tab order;
    focusing inside finishes it at once (theme/stage.css). */
export function Reveal({ as: Tag = "div", className, style, delay = 0, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { rootMargin: "0px 0px -8% 0px", once: true })
  return (
    <Tag
      ref={ref}
      className={`avl-reveal ${className ?? ""}`}
      data-in={seen || undefined}
      style={{ ...style, "--avl-delay": `${delay}s` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface SplitTextProps {
  as?: ElementType
  text: string
  className?: string
  /** Rise on view, or leave it to the parent to set `data-in`. */
  auto?: boolean
  style?: CSSProperties
}

/** Letters that rise one after another. Screen readers get the whole text from the label. */
export function SplitText({ as: Tag = "h2", text, className, auto = true, style }: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { rootMargin: "0px 0px -12% 0px", once: true })
  let i = 0
  return (
    <Tag ref={ref} className={`avl-split ${className ?? ""}`} aria-label={text} data-in={(auto && seen) || undefined} style={style}>
      {text.split(" ").map((word, w) => (
        <span key={w}>
          {w > 0 && " "}
          <span className="avl-wd" aria-hidden="true">
            {[...word].map((c, k) => (
              <span key={k} className="avl-ch" style={{ "--avl-i": i++ } as CSSProperties}>
                {c}
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  )
}
