import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CardColophon } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract flat Character list from nested EventData */
export function getEventCharacters(data: import("./types").EventData): import("./types").Character[] {
  const characters: import("./types").Character[] = []
  for (const author of data.authors) {
    for (const series of author.series) {
      for (const char of series.characters) {
        characters.push({ ...char, maker: author.name })
      }
    }
  }
  return characters
}

/** Count total characters across all authors/series in EventData */
export function countEventCharacters(data: import("./types").EventData): number {
  return data.authors.reduce(
    (total, author) =>
      total + author.series.reduce((s, series) => s + series.characters.length, 0),
    0,
  )
}

/** Pull up to `max` preview images from EventData */
export function getEventPreviewImages(data: import("./types").EventData, max = 4): string[] {
  const images: string[] = []
  for (const author of data.authors) {
    for (const series of author.series) {
      for (const char of series.characters) {
        if (images.length < max) images.push(char.image)
      }
    }
  }
  return images
}

/** Typographic cleanup for maker-written text: curly quotes, ellipses, and an en dash where they typed an em dash. */
export function typo(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/ ?— ?/g, " – ")
    .replace(/(^|[\s(\[])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/(^|\s)'/g, "$1‘")
    .replace(/'/g, "’")
    .replace(/\.\.\.?/g, "…")
}

const NAME_SEPARATOR = /\s*(\|\||\||✦|•|--|—)\s*/

/** Card names carry an epithet after a separator: "Name | The Epithet". Returns [name, epithet]. */
export function splitCharacterName(name: string): [string, string] {
  const m = name.match(NAME_SEPARATOR)
  if (!m || m.index === undefined) return [typo(name), ""]
  const sep = m[1] === "--" || m[1] === "—" ? "–" : m[1]
  return [typo(name.slice(0, m.index)), `${sep} ${typo(name.slice(m.index + m[0].length))}`]
}

/** The rows on the back of a card. Tokens cover the prompt fields and the first message; other greetings and the
    lorebook aren't counted. */
export function colophonRows(c: CardColophon): { label: string; value: string }[] {
  const n = (v: number) => v.toLocaleString("en")
  return [
    { label: "Tokens", value: `${n(c.tokens)}, with the first message` },
    { label: "Description", value: `${n(c.desc)} words` },
    { label: "First message", value: `${n(c.first)} words` },
    { label: "Greetings", value: `${c.alts + 1}` },
    { label: "Lorebook", value: c.book ? `Yes, ${c.book} entries` : "No" },
    ...(c.warn.length ? [{ label: "Warnings", value: c.warn.join(", ") }] : []),
    ...(c.tags.length ? [{ label: "Tags", value: c.tags.join(", ") }] : []),
    { label: "Card", value: `${c.spec} PNG, ${(c.bytes / 1048576).toFixed(1)} MB` },
  ]
}
