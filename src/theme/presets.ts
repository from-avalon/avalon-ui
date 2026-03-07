import type { EventTheme } from "../types"

/** Default Avalon teal theme — used for Launch Day and as the base for new events */
export const launchTheme: EventTheme = {
  primary: "oklch(0.72 0.08 175)",
  accent: "oklch(0.68 0.07 175)",
  ring: "oklch(0.68 0.07 175)",
  card: "oklch(0.12 0.018 150)",
  border: "oklch(0.28 0.025 150)",
  glow: "oklch(0.65 0.1 175)",
  textGlow: "oklch(0.72 0.08 175)",
  particle: "oklch(0.85 0.1 180)",
  particleGlow: "oklch(0.70 0.10 180)",
  mist: "oklch(0.7 0.08 145)",
  fireflyCore: "oklch(0.9 0.15 150)",
  fireflyGlow: "oklch(0.8 0.12 150)",
  bgImage: "/images/launch-bg.webp",
  bgGradient:
    "linear-gradient(to bottom, oklch(0.1 0.015 150 / 0.85) 0%, oklch(0.12 0.02 145 / 0.8) 30%, oklch(0.1 0.015 150 / 0.85) 70%, oklch(0.08 0.015 150 / 0.9) 100%)",
}

/** Valentine's Day theme — rose/red palette */
export const valentinesTheme: EventTheme = {
  primary: "oklch(0.72 0.12 10)",
  accent: "oklch(0.65 0.14 355)",
  ring: "oklch(0.65 0.14 355)",
  card: "oklch(0.12 0.02 350)",
  border: "oklch(0.28 0.03 350)",
  glow: "oklch(0.60 0.15 355)",
  textGlow: "oklch(0.72 0.12 10)",
  particle: "oklch(0.82 0.12 10)",
  particleGlow: "oklch(0.65 0.14 355)",
  mist: "oklch(0.65 0.10 350)",
  fireflyCore: "oklch(0.88 0.14 10)",
  fireflyGlow: "oklch(0.75 0.12 355)",
  bgImage: "/images/valentines-bg.webp",
  bgGradient:
    "linear-gradient(to bottom, oklch(0.1 0.02 350 / 0.85) 0%, oklch(0.12 0.025 355 / 0.8) 30%, oklch(0.1 0.02 350 / 0.85) 70%, oklch(0.08 0.02 350 / 0.9) 100%)",
}

/** All registered theme presets */
export const themePresets: Record<string, EventTheme> = {
  launch: launchTheme,
  valentines: valentinesTheme,
}
