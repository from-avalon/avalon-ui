// Server-safe entry — types, utilities, theme presets.
// React components live in `./client` (marked "use client"); split so that
// Server Components can import types/utils/presets without crossing a
// client boundary, and Client Components import the JSX from `./client`.

// Types
export type {
  Character,
  CharacterLink,
  EventAuthor,
  EventCharacter,
  EventData,
  EventMeta,
  EventSeries,
  EventTheme,
} from "./types"

// Utilities
export { cn, countEventCharacters, getEventCharacters, getEventPreviewImages } from "./utils"

// Theme presets
export { deepwoodTheme, launchTheme, pastelNightmaresTheme, themePresets, valentinesTheme } from "./theme/presets"
