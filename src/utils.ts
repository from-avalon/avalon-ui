import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
