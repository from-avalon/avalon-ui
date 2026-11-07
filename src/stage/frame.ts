/* One rAF per scroll or resize for every scroll-driven layer on the page. Native scrolling only: nothing here
   takes the wheel away from the visitor. */
type Job = () => void

const jobs = new Set<Job>()
let queued = false

function flush() {
  queued = false
  jobs.forEach((job) => job())
}

export function requestStageFrame() {
  if (queued) return
  queued = true
  requestAnimationFrame(flush)
}

/** Runs `job` on the next frame and after every scroll or resize. Returns the unsubscribe. */
export function onStageFrame(job: Job): () => void {
  if (jobs.size === 0) {
    addEventListener("scroll", requestStageFrame, { passive: true })
    addEventListener("resize", requestStageFrame)
  }
  jobs.add(job)
  requestStageFrame()
  return () => {
    jobs.delete(job)
    if (jobs.size === 0) {
      removeEventListener("scroll", requestStageFrame)
      removeEventListener("resize", requestStageFrame)
    }
  }
}

/** How far `el` has travelled through the viewport: 0 as its top enters from below, 1 as its foot leaves above. */
export function viewportProgress(el: Element): number {
  const r = el.getBoundingClientRect()
  const span = innerHeight + r.height
  return span > 0 ? Math.min(1, Math.max(0, (innerHeight - r.top) / span)) : 0
}

/** Goes to a section. Past one screen it cuts under a short fade instead of panning across everything between: a pan makes
    the visitor wait. Nearby, and under reduced motion, it just goes. Returns once the page is there. */
export function jumpTo(el: HTMLElement) {
  const top = el.getBoundingClientRect().top + scrollY
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduced || Math.abs(top - scrollY) <= innerHeight) {
    scrollTo({ top, behavior: reduced ? "auto" : "smooth" })
    return
  }
  const veil = document.createElement("div")
  veil.className = "avl-veil"
  document.body.appendChild(veil)
  const fade = (from: number, to: number) => veil.animate([{ opacity: from }, { opacity: to }], { duration: 150, easing: "ease-out", fill: "forwards" }).finished
  fade(0, 0.85)
    .then(() => {
      scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" })
      return fade(0.85, 0)
    })
    .finally(() => veil.remove())
}

/** Every same-page link on the page goes through jumpTo, and leaves focus where the visitor went. */
export function followAnchors(): () => void {
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]')
    const id = a?.getAttribute("href")?.slice(1)
    const el = id ? document.getElementById(id) : null
    if (!el || e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    history.pushState(null, "", `#${id}`)
    jumpTo(el)
    el.setAttribute("tabindex", "-1")
    el.focus({ preventScroll: true })
  }
  document.addEventListener("click", onClick)
  return () => document.removeEventListener("click", onClick)
}
