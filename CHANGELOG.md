# Changelog

Each release is a tag cut from `main`, installed straight from git: `github:from-avalon/avalon-ui#v<version>`.

## 0.4.0 (unreleased)

The stage: the moving parts of a launch-site page, as `@severian-dev/avalon-ui/stage` with `@severian-dev/avalon-ui/stage.css`. Client only.

- Motion: `MotionProvider`, `MotionToggle`, `useMotion`. One switch for ambient motion, and reduced motion is respected.
- Scroll-driven layers: `onStageFrame`, `viewportProgress`, `ParallaxPlane`, `MistBand`, and `DepthPlane`, a painting that moves in depth (WebGL, keeping its image on phones and under reduced motion).
- Reveals: `Reveal`, `SplitText`, `useInView`.
- Chrome: `SiteBar`, shown only past the hero, `SectionRail` and `useActiveSection`. `jumpTo` cuts a long jump under a short fade instead of panning.
- Rows: `useSideRow`, a native sideways row. It lands on an item, answers the left and right keys while in view, brings a card into view when it takes focus, and never catches the page's vertical scroll. A row laid out whole leaves the keys alone.
- Landing: `useSectionSnap` lands a page at rest on a section, and the up and down keys go a section at a time. Nothing intercepts the scroll, and any input takes over at once. The feel is `RunTuning`, set with `setRunTuning`; `sectionPull: 0` turns it off.
- Held rows: `useRowRun` holds a section while the page's own scroll walks its row, for a row worth stopping for.
- The browser's own snap: with `html.avl-snap-native`, the browser lands the page on the sections the app aligns, with the gesture's momentum, and nothing of the stage moves the page.
- Phones: `PHONE`, the media query for a phone upright or on its side. `MotionToggle labelled` is the pause as a menu row. `fitWidth` and `useFitWidth` shrink display words that can't break until they fit.
- Cards: `CardBack`, `PlatformLinks`, `TurnIcon`, `DownloadIcon`.
- `npm test` runs the tests for where things land.

## 0.3.0 (2026-10-22)

- The shared theme stylesheet, `@severian-dev/avalon-ui/theme`: tokens, fonts and the forest base.
- `deepwoodTheme` preset.
- The design-system doc, and the repository under `from-avalon`.

## 0.2.0 (2026-10-22)

- React components move to `@severian-dev/avalon-ui/client`, and the root entry is server-safe: the bundled components had lost their `"use client"` directives and broke in Server Components.
- `pastelNightmaresTheme` preset.
- `DESIGN-SYSTEM.md`.

## 0.1.0 (2026-10-22)

- One entry for everything: types, utilities, theme presets and components.
