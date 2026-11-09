"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { onStageFrame } from "./frame"

export interface SectionLink {
  id: string
  label: string
  /** The section's number, shown in the menu. */
  no?: string
}

/** Which of the page's sections holds the upper middle of the screen. */
export function useActiveSection(ids: string[]): number {
  const [current, setCurrent] = useState(0)
  const key = ids.join(" ")
  useEffect(() => {
    const list = key.split(" ")
    return onStageFrame(() => {
      const mid = innerHeight * 0.45
      let cur = 0
      list.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < mid) cur = i
      })
      setCurrent(cur)
    })
  }, [key])
  return current
}

interface SiteBarProps {
  brand: ReactNode
  links: SectionLink[]
  /** The bar stays away until this element's foot has left the screen. Leave it out for a bar that's always there. */
  pastId?: string
  /** Section ids the links point at, in page order, starting with the hero. */
  active: string | undefined
  action?: ReactNode
  /** Last in the menu, after the links, as a switch that leaves the bar on a phone. */
  menuEnd?: ReactNode
}

/** The top bar. It only exists past the hero; a keyboard user who tabs into it brings it along. Below 1100px the links
    fold into a modal menu. */
export function SiteBar({ brand, links, pastId, active, action, menuEnd }: SiteBarProps) {
  const bar = useRef<HTMLElement>(null)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [past, setPast] = useState(false)
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(
    () =>
      onStageFrame(() => {
        const hero = pastId ? document.getElementById(pastId) : null
        setPast(!hero || hero.getBoundingClientRect().bottom <= 0)
      }),
    [pastId],
  )

  const close = useCallback((refocus?: boolean) => {
    setOpen(false)
    if (refocus) menuBtn.current?.focus()
  }, [])

  // the menu is modal: focus moves in, Tab stays between its links and the button, Escape returns to the button
  useEffect(() => {
    if (!open) return
    const outside = [...document.querySelectorAll<HTMLElement>("main, .avl-rail, .avl-motion, .avl-bar-brand, .avl-bar-action")].filter((el) => !menu.current?.contains(el))
    outside.forEach((el) => (el.inert = true))
    menu.current?.querySelector<HTMLElement>("a, button")?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true)
      if (e.key !== "Tab" || !menu.current || !menuBtn.current) return
      const loop = [...menu.current.querySelectorAll<HTMLElement>("a, button"), menuBtn.current]
      const i = loop.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        menuBtn.current.focus()
      } else if (!e.shiftKey && i === loop.length - 1) {
        e.preventDefault()
        loop[0].focus()
      }
    }
    const onResize = () => {
      if (!matchMedia("(max-width: 1100px)").matches) close()
    }
    addEventListener("keydown", onKey)
    addEventListener("resize", onResize)
    return () => {
      outside.forEach((el) => (el.inert = false))
      removeEventListener("keydown", onKey)
      removeEventListener("resize", onResize)
    }
  }, [open, close])

  const shown = past || focused || open
  return (
    <>
      <header
        ref={bar}
        className="avl-bar"
        data-shown={shown || undefined}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!bar.current?.contains(e.relatedTarget as Node)) setFocused(false)
        }}
      >
        <div className="avl-bar-brand">{brand}</div>
        <nav className="avl-bar-links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? "true" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="avl-bar-end">
          <div className="avl-bar-action">{action}</div>
          <span className="avl-bar-slot avl-bar-slot-menu" aria-hidden="true" />
          <span className="avl-bar-slot" aria-hidden="true" />
        </div>
      </header>
      {/* outside the bar, so narrow screens can reach every section from the hero, where there is no bar */}
      <button
        ref={menuBtn}
        type="button"
        className="avl-bar-menu"
        aria-expanded={open}
        aria-controls="avl-menu"
        aria-label={open ? "Close the menu" : "Open the menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <i />
        <i />
      </button>
      <div ref={menu} id="avl-menu" className="avl-menu" role="dialog" aria-modal="true" aria-label="Sections" hidden={!open}>
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={() => close()}>
            {l.no && <b>{l.no}</b>}
            {l.label}
          </a>
        ))}
        {menuEnd}
      </div>
    </>
  )
}

/** The side rail: a tick per section, each a link, so any section is one click away, even over the hero where there is
    no bar. */
export function SectionRail({ sections, current }: { sections: SectionLink[]; current: number }) {
  return (
    <nav className="avl-rail" aria-label="Jump to a section">
      <ol>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={i === current ? "true" : undefined}>
              <i />
              <span>{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <span className="avl-rail-label" aria-hidden="true">
        {sections[current]?.label}
      </span>
    </nav>
  )
}
