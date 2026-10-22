# @severian-dev/avalon-ui

Shared UI components, types, and theme for Avalon projects.

> Building a new Avalon collab? Read [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) first — it covers the four-tier model (base, theme preset, extensions, content), the override contract, and the recipe for adding a new collab.

## Install

Requires a GitHub token with `read:packages` scope in your `.npmrc`:

```
@severian-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then:

```bash
npm install @severian-dev/avalon-ui
# or
pnpm add @severian-dev/avalon-ui
```

## Setup

In your project's `globals.css`, after your Tailwind import:

```css
@import "tailwindcss";
@import "@severian-dev/avalon-ui/theme";
```

That's it — you get the full Avalon color palette, typography vars, animations, and utilities.

## Usage

### Types

```ts
import type { Character, EventTheme, EventData, EventMeta } from "@severian-dev/avalon-ui"
```

### Components

Components are exported from a separate `/client` entry so they can be safely imported into Next App Router projects without the rest of the package crossing a client boundary. Server-safe values (types, utils, theme presets) come from the root entry.

```tsx
// Components — client entry (marked "use client")
import {
  CharacterCard,
  FeaturedCreator,
  Fireflies,
  FloatingParticles,
  MistLayers,
} from "@severian-dev/avalon-ui/client"

// Server-safe — types, utils, theme presets
import { launchTheme, getEventCharacters, type Character } from "@severian-dev/avalon-ui"

// Character card — use inside a grid, pass isVisible for staggered reveal
<CharacterCard character={char} index={i} isVisible={isVisible} />

// Featured creator profile with platform links
<FeaturedCreator creator={creator} index={i} isVisible={isVisible} />

// Ambient effects — drop anywhere in your layout
<Fireflies coreColor="oklch(0.9 0.15 150)" glowColor="oklch(0.8 0.12 150)" />
<FloatingParticles coreColor="oklch(0.85 0.1 180)" glowColor="oklch(0.70 0.10 180)" />
<MistLayers color="oklch(0.7 0.08 145)" />
```

### Per-event theme injection

Each event overrides colors via CSS variables. Set them on the section wrapper:

```tsx
import { launchTheme, valentinesTheme } from "@severian-dev/avalon-ui"

// Apply event theme as CSS vars on a wrapper
<section style={{
  "--event-glow": theme.glow,
  "--event-primary": theme.primary,
  // etc.
} as React.CSSProperties}>
```

### Utilities

```ts
import { cn, getEventCharacters, countEventCharacters } from "@severian-dev/avalon-ui"

// Merge Tailwind classes safely
cn("text-foreground", isActive && "text-primary")

// Flatten EventData → Character[]
const chars = getEventCharacters(eventData)
```

### Theme presets

```ts
import {
  launchTheme,
  valentinesTheme,
  pastelNightmaresTheme,
  deepwoodTheme,
  themePresets,
} from "@severian-dev/avalon-ui"
```

Presets can be applied two ways: inline `--event-*` CSS vars on a wrapper (see `pastel-nightmares`), or via the CSS palette registry by setting `data-event="<slug>"` on a page root (see `deepwood-rising`). The base also exposes a plain-CSS token vocabulary (`--fg-*`, `--bg-*`, `--ts-*`, `--font-serif-display`, the `.avl-*` type classes) that mirrors the Avalon design tool — see `DESIGN-SYSTEM.md`.

## Adding new event themes

Add to `src/theme/presets.ts` and export from `src/index.ts`. Bump the minor version.

## Publishing

```bash
npm run build
npm publish
```

Publishes to GitHub Packages under `@severian-dev`.
