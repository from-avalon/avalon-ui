"use client"

import { useEffect } from "react"

/* Display words that can't break, as a split title's, shrink until they fit: a long word in a narrow column, or a phone with its
   text set larger. They never grow past the size the stylesheet gives them. */

/** The size that fits: from the size it starts at, how far its text reaches across and how wide its box is. Never larger than it
    started, never below `min`. */
export function fittedSize(size: number, textWidth: number, boxWidth: number, min: number) {
  if (textWidth <= boxWidth + 0.5 || textWidth <= 0 || boxWidth <= 0) return size
  return Math.max(min, Math.floor(size * (boxWidth / textWidth) * 100) / 100)
}

/** How wide an element's text is drawn, edge to edge, however its letters are wrapped in spans and however it's aligned: a centred
    word too long for its box overruns both sides. */
function textSpan(el: HTMLElement) {
  const range = document.createRange()
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let left = Infinity, right = -Infinity
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) {
      left = Math.min(left, r.left)
      right = Math.max(right, r.right)
    }
  }
  return right > left ? right - left : 0
}

/** Fits each element's words to its width, starting each time from the stylesheet's size, so it follows the stylesheet when the
    screen turns and grows back when there's room. */
export function fitWidth(els: Iterable<HTMLElement>, min = 20) {
  for (const el of els) {
    if (!el.getClientRects().length) continue
    el.style.fontSize = ""
    const cs = getComputedStyle(el)
    const base = parseFloat(cs.fontSize)
    const box = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)
    const next = fittedSize(base, textSpan(el), box, min)
    if (next < base) el.style.fontSize = `${next}px`
  }
}

/** Fits everything matching `selector` now, and whenever the window or the fonts change. */
export function useFitWidth(selector: string, min?: number) {
  useEffect(() => {
    const run = () => fitWidth(document.querySelectorAll<HTMLElement>(selector), min)
    run()
    addEventListener("resize", run)
    document.fonts?.ready.then(run)
    return () => removeEventListener("resize", run)
  }, [selector, min])
}
