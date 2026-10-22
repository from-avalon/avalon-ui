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

/**
 * Pastel Nightmares — light/cream pastel theme for the "aesthetic lies" collab.
 *
 * INVERSE-MODE: this is the first preset designed to override the base dark
 * tokens. Collabs using this preset must also override --color-background,
 * --color-foreground, etc. on a root wrapper. See DESIGN-SYSTEM.md.
 *
 * Off-key/dissonance signal color: TBD. Current values are safe-pastel-only;
 * once the visual baseline is locked, we revisit ring/textGlow/fireflyCore
 * with a "wrong" hue (sickly yellow / bruise purple / mold green candidates).
 */
export const pastelNightmaresTheme: EventTheme = {
  primary: "oklch(0.78 0.06 310)",        // dusty lavender
  accent: "oklch(0.86 0.05 165)",         // soft mint
  ring: "oklch(0.78 0.06 310)",           // lavender (TBD: off-key candidate)
  card: "oklch(0.97 0.012 75)",           // brighter paper (polaroids)
  border: "oklch(0.85 0.025 75)",         // tea-stained edge
  glow: "oklch(0.78 0.10 350)",           // rose halo (raised chroma to read on cream)
  textGlow: "oklch(0.78 0.10 350)",       // rose (TBD: off-key candidate)
  particle: "oklch(0.78 0.12 350)",       // dusty rose — visible on cream + taupe
  particleGlow: "oklch(0.82 0.08 340)",
  mist: "oklch(0.72 0.10 310)",           // saturated lavender mist
  fireflyCore: "oklch(0.82 0.13 350)",    // bright dusty rose firefly (TBD: off-key)
  fireflyGlow: "oklch(0.78 0.10 340)",
  bgImage: "/images/pastel-nightmares-bg.webp",
  bgGradient:
    "linear-gradient(to bottom, oklch(0.94 0.018 75) 0%, oklch(0.92 0.025 350 / 0.6) 30%, oklch(0.94 0.018 75) 70%, oklch(0.94 0.018 75) 100%)",
}

/**
 * Deepwood Rising — rusted iron + torn parchment over the forest-dark base.
 *
 * A gold-rush refugee camp at the edge of an encroaching Deep Woods, run out of
 * the Briarmark guild tent. Unlike the gallery collabs, this site hosts ONE
 * scenario card whose lorebook is built from community-submitted NPCs; the
 * CharacterCard reads these tokens for the single featured scenario card.
 *
 * Keeps the forest background/card; shifts accents, glow and fireflies warm
 * (iron/amber). Apply alongside data-event="deepwood".
 */
export const deepwoodTheme: EventTheme = {
  primary: "oklch(0.62 0.11 50)",         // rusted iron
  accent: "oklch(0.75 0.08 55)",          // iron-soft
  ring: "oklch(0.62 0.11 50)",
  card: "oklch(0.12 0.018 150)",          // forest card (base)
  border: "oklch(0.42 0.09 45)",          // iron-deep
  glow: "oklch(0.65 0.13 50)",            // iron glow
  textGlow: "oklch(0.75 0.08 55)",
  particle: "oklch(0.85 0.10 60)",        // warm dust mote
  particleGlow: "oklch(0.65 0.13 50)",
  mist: "oklch(0.70 0.08 145)",           // forest mist (greenish, cool)
  fireflyCore: "oklch(0.92 0.14 80)",     // warm firefly, hotter than house teal
  fireflyGlow: "oklch(0.75 0.12 65)",
  bgImage: "/images/deep-woods.webp",
  bgGradient:
    "linear-gradient(180deg, oklch(0.10 0.018 150 / 0.85) 0%, oklch(0.08 0.015 150 / 0.92) 100%)",
}

/** All registered theme presets */
export const themePresets: Record<string, EventTheme> = {
  launch: launchTheme,
  valentines: valentinesTheme,
  pastelNightmares: pastelNightmaresTheme,
  deepwood: deepwoodTheme,
}
