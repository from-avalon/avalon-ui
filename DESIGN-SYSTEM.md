# Avalon Design System

This document is the contract for any Avalon property — the parent site (`from-avalon.com`) or a collab/event microsite (e.g. `into-bloom`, `pastel-nightmares`). Read it before scaffolding a new collab.

## The model

Avalon is a parent brand plus a growing set of collab microsites. Each collab gets visual freedom, but they all share enough that they read as kin. To make that work, the design system is layered into four tiers:

| Tier | What it is | Where it lives | Per collab? |
|------|------------|----------------|-------------|
| **1. Base** | Color *system*, type stack, motion vocabulary, atmospheric primitives, domain primitives | `@severian-dev/avalon-ui` | Locked — never reimplement |
| **2. Theme preset** | Concrete OKLCH values for the base tokens | `src/theme/presets.ts` (one preset per collab) | Yes — required |
| **3. Extensions** | Extra components, libraries, motifs, page structures | The collab's own repo | Yes — optional |
| **4. Content & IA** | Pages, copy, data, domain types | The collab's own repo | Yes — fully owned |

Tier 1 is what makes the family visible. Tier 2 is the safe, structured way each collab differentiates. Tier 3 is the escape hatch for collabs that need to do something the base doesn't ship. Tier 4 is just product.

---

## Tier 1 — Locked base

Every Avalon property imports `@severian-dev/avalon-ui/theme` and gets the following. None of this should be redeclared, overridden, or shadowed downstream.

### Color system

Semantic OKLCH tokens defined in `src/theme/index.css`. The *names* are part of the contract — collabs override the *values* via theme presets and CSS-var injection.

| Role | Token | Default value |
|------|-------|--------------:|
| Page surface | `--color-background` | `oklch(0.08 0.015 150)` |
| Body text | `--color-foreground` | `oklch(0.92 0.01 150)` |
| Card surface | `--color-card` | `oklch(0.12 0.018 150)` |
| Popover surface | `--color-popover` | `oklch(0.1 0.018 150)` |
| Primary action | `--color-primary` | `oklch(0.72 0.08 175)` |
| Accent | `--color-accent` | `oklch(0.68 0.07 175)` |
| Secondary | `--color-secondary` | `oklch(0.14 0.025 150)` |
| Muted | `--color-muted` | `oklch(0.18 0.02 150)` |
| Destructive | `--color-destructive` | `oklch(0.577 0.245 27.325)` |
| Border | `--color-border` | `oklch(0.28 0.025 150)` |
| Input | `--color-input` | `oklch(0.2 0.02 150)` |
| Focus ring | `--color-ring` | `oklch(0.68 0.07 175)` |

Each role-color also has a `-foreground` pair where text contrast matters.

### Base vocabulary & per-collab palette registry

Alongside the Tailwind `--color-*` tokens, the base exposes a **plain-CSS token vocabulary** in `src/theme/index.css`: `--fg-1..4`, `--bg-void/base/popover/card/secondary/muted` (+ `--bg-sect-*`), the `--primary*` ramp, `--mist` / `--firefly-*`, `--border*` / `--input` / `--ring`, the `--ts-*` text-shadow scale, `--shadow-*`, `--space-section-*`, and the `--font-serif-display` / `--font-serif-decorative` / `--font-ui` families. These mirror the token names the Avalon **design tool** (claude.ai/design) emits in its `avalon.css`, so an HTML/CSS prototype hands off onto the package without a rename pass. Hand-written CSS (the `.avl-*` classes, a collab's `dw-*` / `pn-*` layer) consumes these via `var()`; Tailwind utilities keep using `--color-*`. The two sets are kept numerically in sync.

The named type scale is also available as opt-in classes: `.avl-display`, `.avl-h2`, `.avl-h3`, `.avl-subtitle`, `.avl-tagline`, `.avl-body`, `.avl-label`, `.avl-mono`.

**Palette registry.** Per-collab palettes also live in the base as inert `[data-event="…"]` / `[data-site="…"]` blocks (`launch`, `valentines`, `deepwood`, `into-bloom`, `dispatch`, `pastel-nightmares`). Setting the attribute on a page root activates that palette and wires `--event-*` onto the plain vocabulary (`--primary`, `--bg-card`, `--mist`, `--firefly-*`); each block is inert until its selector matches, so adding one never affects another surface. This is the CSS twin of the `themePresets` registry in `presets.ts` and mirrors the design tool's `avalon.css`. (Deepwood Rising applies its palette this way — `data-event="deepwood"` on `<html>` — instead of inline `--event-*` style.)

### Type stack

```
--font-sans:          "Cormorant Garamond", Georgia, serif    (body)
--font-serif:         Cinzel, "Times New Roman", serif        (display, Tailwind font-serif)
--font-serif-display: "Cinzel", "Times New Roman", serif      (display, plain-CSS var())
--font-ui:            "Inter", system-ui, sans-serif           (small UI labels)
--font-mono:          "Geist Mono", monospace                  (code/UI)
```

> next/font note: the family vars default to literal names (so `<link>`/`@import` loaders and the design tool resolve them). A Next.js collab using `next/font` should re-point the families at its font variables in its own `globals.css` — e.g. `@theme inline { --font-serif: var(--font-cinzel), … }` and `:root { --font-serif-display: var(--font-cinzel), … }`. See `deepwood-rising` for the pattern.

Cormorant + Cinzel is the Avalon voice — high-contrast, gothic-elegant. Collabs should keep this stack unless there is a strong reason to swap. If a collab swaps fonts, do it by overriding the three `--font-*` vars on a wrapper, not by editing the base.

There is intentionally **no parallel `--text-*` semantic scale** — Tailwind v4's defaults are the type scale. See [Type guidance](#type-guidance) for which sizes to use where.

### Spacing & radii

Tailwind v4 defaults for spacing, plus four radius tokens:

```
--radius-sm: 0.25rem   --radius-md: 0.375rem
--radius-lg: 0.5rem    --radius-xl: 0.75rem
```

### Motion vocabulary

17 keyframes + 17 utility classes, all defined in `src/theme/index.css`:

| Use | Utility | Notes |
|-----|---------|-------|
| Ambient drift | `animate-float`, `animate-float-slow`, `animate-breathe` | infinite |
| Glow / pulse | `animate-glow`, `animate-glow-pulse`, `animate-twinkle`, `animate-shimmer` | infinite |
| Mist / atmosphere | `animate-mist`, `animate-mist-reverse` | infinite, slow (30–35s) |
| Reveal | `animate-fade-in-up`, `animate-scale-in`, `animate-magical-reveal`, `animate-letter-reveal` | one-shot, `forwards` |
| Slide-in | `animate-slide-left`, `animate-slide-right` | one-shot, `forwards` |
| Orbit / firefly | `animate-orbit`, `animate-firefly` | infinite, complex paths |

Plus six utilities: `.glass`, `.text-glow`, `.text-glow-subtle`, `.text-readable`, `.text-shadow-sm`, `.btn-glow`, `.perspective-1000`, `.preserve-3d`.

These are the **shared motion language** — reach for these before authoring new keyframes locally.

### Atmospheric primitives

```ts
import { Fireflies, FloatingParticles, MistLayers } from "@severian-dev/avalon-ui"
```

All three accept theme color props (`coreColor` / `glowColor` / `color`) and a `count`. They are the canonical way to add ambient atmosphere — collabs should use these and pass theme colors, not hand-roll equivalents.

### Domain primitives

```ts
import { CharacterCard, FeaturedCreator } from "@severian-dev/avalon-ui/client"
```

Used for character grids and creator showcases. Both consume `var(--event-glow, …)` so theme injection (Tier 2) flows through automatically.

### Import boundaries (server vs. client)

The package has two entry points. Use the right one in App Router projects:

| Entry | Path | Contents |
|---|---|---|
| **Server-safe (root)** | `@severian-dev/avalon-ui` | Types, utils (`cn`, `getEventCharacters`, …), theme presets |
| **Client (components)** | `@severian-dev/avalon-ui/client` | All React components — `Fireflies`, `MistLayers`, `FloatingParticles`, `CharacterCard`, `FeaturedCreator` |

Server Components must import types/utils/presets from the root entry (calling client-marked functions from server code is rejected by Next). Components imported from `/client` automatically establish a client boundary.

---

## Tier 2 — Theme preset (the override contract)

Each collab ships a single `EventTheme` object in `src/theme/presets.ts`. The 14 slots:

```ts
interface EventTheme {
  primary: string         // role: --color-primary
  accent: string          // role: --color-accent
  ring: string            // role: --color-ring (focus rings)
  card: string            // role: --color-card surface
  border: string          // role: --color-border
  glow: string            // ambient glow color (cards, hovers)
  textGlow: string        // .text-glow base color
  particle: string        // FloatingParticles core
  particleGlow: string    // FloatingParticles halo
  mist: string            // MistLayers tint
  fireflyCore: string     // Fireflies core
  fireflyGlow: string     // Fireflies halo
  bgImage: string         // hero/section background image path
  bgGradient: string      // CSS linear-gradient for body overlay
}
```

### How a preset gets applied

Components consume `var(--event-*, fallback)`. Collabs apply the preset as inline CSS vars on a wrapper:

```tsx
import { launchTheme } from "@severian-dev/avalon-ui"

const t = launchTheme

<section
  style={{
    "--event-primary": t.primary,
    "--event-accent": t.accent,
    "--event-glow": t.glow,
    // …rest of the slots
  } as React.CSSProperties}
>
  <CharacterCard {...} />
  <Fireflies coreColor={t.fireflyCore} glowColor={t.fireflyGlow} />
</section>
```

The base CSS vars (`--color-primary` etc.) are *not* overridden by `--event-*`. The dual-naming is intentional — base tokens stay stable globally; `--event-*` is the per-section override channel.

### Adding a new preset

1. Add a `MyEventTheme: EventTheme` constant to `src/theme/presets.ts`.
2. Register it in the `themePresets` record at the bottom.
3. Re-export from `src/index.ts`.
4. Bump the package version, build, publish.

Every existing preset (`launchTheme`, `valentinesTheme`, `pastelNightmaresTheme`, `deepwoodTheme`) is a worked example. If the collab applies its palette via the CSS registry (`data-event="…"`) rather than inline `--event-*`, also add a matching `[data-event="…"]` block to `src/theme/index.css`.

---

## Tier 3 — Collab extensions (optional, additive)

A collab is allowed to do any of the following in its own repo:

- **Add libraries** — e.g. `into-bloom` adds `framer-motion` for state-driven motion. Choose libraries whose visual output complements the base; don't replace the base utilities with library equivalents.
- **Add atmospheric components** — `into-bloom` ships `ForestWisps`, `FlyingBirds`, `FallingLeaves`, `WaterRipples`, `FlowingWater`. None exist in the base. If a new motif is generalizable to other collabs, **promote it back** into `avalon-ui` (with themable color props) before publishing the next preset.
- **Add interaction systems** — shadcn/ui, modal stacks, sound managers, custom hooks. `into-bloom` uses 55+ shadcn primitives; `from-avalon.com` uses zero. Both are valid.
- **Override page structure** — `from-avalon.com` is multi-section content (hero → creators → characters → events → contact). `into-bloom` is single-page interactive map. Pick the architecture the experience needs.

What you **may not** do in Tier 3:

- Redeclare base tokens (`--color-*`, `--font-*`, `--radius-*`) at the package level. **Exception:** inverse-mode collabs (light-base properties on this dark-base system) may override `--color-background`, `--color-foreground`, `--color-card`, `--color-popover`, `--color-muted`, `--color-border`, `--color-input` on a root wrapper. See [Inverse mode](#inverse-mode) below.
- Reimplement base components (`CharacterCard`, `FeaturedCreator`, `Fireflies`, `FloatingParticles`, `MistLayers`). Import from `avalon-ui`.
- Author new keyframes that duplicate the base motion vocabulary. Use the existing `animate-*` utilities first; only add new keyframes for genuinely new motion.

### Inverse mode

The base ships with a dark page surface. Some collabs (e.g. `pastel-nightmares` — paper-scrapbook metaphor) are inherently light-base and should not be forced to darken. To inverse-mode a collab cleanly:

```tsx
// app/layout.tsx
<body
  style={{
    "--color-background": "oklch(0.94 0.018 75)",
    "--color-foreground": "oklch(0.28 0.04 305)",
    "--color-card": "oklch(0.97 0.012 75)",
    "--color-card-foreground": "oklch(0.28 0.04 305)",
    "--color-popover": "oklch(0.97 0.012 75)",
    "--color-popover-foreground": "oklch(0.28 0.04 305)",
    "--color-muted": "oklch(0.92 0.012 75)",
    "--color-muted-foreground": "oklch(0.55 0.04 305)",
    "--color-border": "oklch(0.85 0.025 75)",
    "--color-input": "oklch(0.95 0.015 75)",
  } as React.CSSProperties}
>
  {children}
</body>
```

Caveats when going inverse:

- The base text-shadow on `h1–h6` and `body` is tuned for light text on dark; in inverse mode it can muddy light text on a light surface. Override locally with `text-shadow: none` or a paper-appropriate shadow on those elements.
- `.text-readable` (multi-layer black text-shadow) flips meaning — use `.text-shadow-sm` or author a paper-tinted alternative.
- The `Fireflies` / `FloatingParticles` / `MistLayers` primitives use additive-light coloring that reads weaker on light backgrounds. Pass higher-chroma `coreColor` / `glowColor` and accept they will be subtler.
- `.glass` is tuned for dark; on a light surface, raise its `background` lightness and pick a darker border tint locally if you need the effect.

Inverse mode is a real Tier-3 freedom but not a free lunch — these touch-ups are the price.

---

## Tier 4 — Collab content & IA

Pages, routes, copy, data shapes beyond `Character` / `EventData` / `EventMeta`, business logic — fully owned by the collab. Out of scope for this document.

---

## Type guidance

Tailwind v4 default sizes, applied semantically. Use these as the convention:

| Role | Class | Notes |
|------|-------|-------|
| Hero display | `text-7xl` / `text-8xl` font-serif | Cinzel, tight tracking, often paired with `.text-glow` or `.animate-letter-reveal` |
| Section title | `text-5xl` / `text-6xl` font-serif | Cinzel |
| Sub-section | `text-3xl` / `text-4xl` font-serif | Cinzel or Cormorant |
| Card title | `text-xl` / `text-2xl` font-sans | Cormorant |
| Body | `text-base` / `text-lg` font-sans | Cormorant; `leading-relaxed` for long-form |
| Meta / caption | `text-sm` font-sans | Cormorant; `text-muted-foreground` |
| UI / code | `text-xs` / `text-sm` font-mono | Geist Mono |

For long-form serif body, prefer `leading-relaxed` (1.625) over Tailwind's default to give Cormorant breathing room. For display headings, `leading-tight` or `leading-none` works better than the default at `text-5xl+`.

---

## Worked examples

### `from-avalon.com` — canonical default

The parent site. Uses `launchTheme` (teal). Multi-section homepage. CSS-only animations. No shadcn. Shows what the system looks like with **Tier 2 only**, no Tier 3 additions.

### `into-bloom` — maximal divergence

A collab event microsite. Uses a forest/golden palette (currently inlined; should be promoted to a preset). Single-page interactive map. Adds framer-motion + shadcn/ui + five custom atmospheric components. Shows what the system supports when **Tier 3 is fully exercised** while still consuming the Tier 1 base.

The two together bracket the design space: from-avalon is the floor, into-bloom is the ceiling.

### `deepwood-rising` — non-gallery collab

A collab event microsite with a rusted-iron + torn-parchment palette (`deepwoodTheme`, applied via `data-event="deepwood"`). Notable because it is **not** a character gallery: it hosts one scenario card (rendered with the base `CharacterCard`) whose lorebook is built from community NPC submissions. Submissions render as in-world dossier postings on a quest board — a Tier-4 content model that is entirely the collab's own, distinct from `EventData`/`Character`. Reconciles the hand-rolled handoff atmosphere onto the base `MistLayers`/`Fireflies`/`FloatingParticles` primitives, and keeps only its iron/parchment/briar decoration as a local `dw-*` layer. A worked example of Tier 2 (preset) + Tier 3 (motif layer) + a bespoke Tier 4.

---

## Recipe: adding a new collab

1. **Scaffold** a Next.js 15 / React 19 / Tailwind 4 app. Match the structure of `from-avalon.com` if content-driven, `into-bloom` if experience-driven.
2. **Install** `@severian-dev/avalon-ui` per the README.
3. **Import the theme** in `app/globals.css`:
   ```css
   @import "tailwindcss";
   @import "@severian-dev/avalon-ui/theme";
   ```
4. **Author a preset** in `avalon-ui/src/theme/presets.ts`. Pick OKLCH values for all 14 `EventTheme` slots. Reference an existing preset as a template.
5. **Register** the preset in `themePresets` and re-export from `src/index.ts`. Bump and publish.
6. **Wire** the preset into the collab's root layout via `--event-*` CSS vars.
7. **Build** the collab. Use `Fireflies`, `FloatingParticles`, `MistLayers`, `CharacterCard`, `FeaturedCreator` first. Reach for Tier 3 only when the experience actually demands it.
8. **Promote** any new motifs that turn out to be reusable back to `avalon-ui`.

---

## Known debt

These are real but separate from any active design-system work — flagged here so they don't get forgotten.

- **`from-avalon.com` duplicates base components.** Local copies of `Fireflies`, `FloatingParticles`, `MistLayers`, `CharacterCard`, `FeaturedCreator` exist under `from-avalon.com/components/` instead of being imported from `@severian-dev/avalon-ui`. They drift independently. Migrate to imports.
- **`into-bloom` has no theme preset.** Its forest/golden palette is inlined in components rather than expressed as an `EventTheme`. Extracting it would (a) prove the preset model handles a non-teal collab and (b) make its palette reusable.
- **Atmospheric extensions in `into-bloom` are not reusable.** `ForestWisps`, `FlyingBirds`, `FallingLeaves`, `WaterRipples`, `FlowingWater` are framer-motion-based and live only in `into-bloom`. The generalizable ones should be promoted to `avalon-ui` with themable props.
