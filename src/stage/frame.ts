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
