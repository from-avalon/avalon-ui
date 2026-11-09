"use client"

import type { ReactNode, Ref } from "react"
import type { CardColophon, CharacterLink } from "../types"
import { colophonRows } from "../utils"

/** Platform pills for a character or a maker. */
export function PlatformLinks({ links }: { links: CharacterLink[] }) {
  return (
    <>
      {links.map((l) => (
        <a key={l.url} className="avl-plat" href={l.url} target="_blank" rel="noopener">
          {l.platform}
        </a>
      ))}
    </>
  )
}

export function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  )
}

export function TurnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" />
    </svg>
  )
}

interface CardBackProps {
  id?: string
  name: string
  maker: ReactNode
  colophon?: CardColophon
  /** The card PNG. */
  href: string | null
  turned: boolean
  color?: string
  headingRef?: Ref<HTMLHeadingElement>
  /** Extra actions beside the download. */
  children?: ReactNode
}

/** The back of a character card: what its PNG carries, counted at build time. Lives inside `.avl-turn`, opposite the
    portrait. Hidden from everyone until it's turned. */
export function CardBack({ id, name, maker, colophon, href, turned, color, headingRef, children }: CardBackProps) {
  const rows = colophon ? colophonRows(colophon) : [{ label: "Card", value: "A character card PNG" }]
  return (
    <div
      id={id}
      className="avl-card-back"
      aria-hidden={!turned}
      inert={!turned}
      style={color ? ({ "--avl-card": color } as React.CSSProperties) : undefined}
    >
      <h4 className="avl-card-name" ref={headingRef} tabIndex={-1}>
        {name}
      </h4>
      <p className="avl-card-by">Made by {maker}</p>
      <dl className="avl-card-rows">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      {(href || children) && (
        <div className="avl-card-actions">
          {href && (
            <a className="avl-solid" href={href} download>
              <DownloadIcon />
              <span>Download card</span>
            </a>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
