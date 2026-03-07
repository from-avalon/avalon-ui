export interface CharacterLink {
  platform: string
  url: string
}

export interface Character {
  id: string
  name: string
  maker: string
  description: string
  subtitle: string
  image: string
  cardFile: string
  visible: boolean
  links: CharacterLink[]
}

export interface EventCharacter {
  id: string
  name: string
  image: string
  cardFile: string
  subtitle: string
  description: string
  visible: boolean
  links: CharacterLink[]
}

export interface EventSeries {
  seriesName: string | null
  characters: EventCharacter[]
}

export interface EventAuthor {
  name: string
  series: EventSeries[]
}

export interface EventData {
  authors: EventAuthor[]
}

export interface EventTheme {
  primary: string
  accent: string
  ring: string
  card: string
  border: string
  glow: string
  textGlow: string
  particle: string
  particleGlow: string
  mist: string
  fireflyCore: string
  fireflyGlow: string
  bgImage: string
  bgGradient: string
}

export interface EventMeta {
  slug: string
  title: string
  tagline: string
  characterCount: number
  authorCount: number
  href: string
  previewImages: string[]
  theme: EventTheme
}
