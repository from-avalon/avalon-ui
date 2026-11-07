"use client"

// Stage entry: the moving parts of a launch-site page, shared by the main site and the collabs. Imported as
// `@severian-dev/avalon-ui/stage`, with `@severian-dev/avalon-ui/stage.css` for their styles.

export { jumpTo, onStageFrame, requestStageFrame, viewportProgress } from "./stage/frame"
export { MotionProvider, MotionToggle, useMedia, useMotion } from "./stage/motion"
export type { Motion } from "./stage/motion"
export { Reveal, SplitText, useInView } from "./stage/reveal"
export { MistBand, ParallaxPlane } from "./stage/parallax"
export { DepthPlane } from "./stage/depth-plane"
export type { DepthCamera } from "./stage/depth-plane"
export type { DepthOptions } from "./stage/depth-gl"
export { useSideRow } from "./stage/row"
export type { SideRow } from "./stage/row"
export { useRowRun, getRunTuning, setRunTuning } from "./stage/run"
export type { RowRun, RunTuning } from "./stage/run"
export { SectionRail, SiteBar, useActiveSection } from "./stage/chrome"
export type { SectionLink } from "./stage/chrome"
export { CardBack, DownloadIcon, PlatformLinks, TurnIcon } from "./stage/card"
