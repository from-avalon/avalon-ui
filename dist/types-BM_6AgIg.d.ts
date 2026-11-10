interface CharacterLink {
    platform: string;
    url: string;
}
interface Character {
    id: string;
    name: string;
    maker: string;
    description: string;
    subtitle: string;
    image: string;
    cardFile: string;
    visible: boolean;
    links: CharacterLink[];
}
interface EventCharacter {
    id: string;
    name: string;
    image: string;
    cardFile: string;
    subtitle: string;
    description: string;
    visible: boolean;
    links: CharacterLink[];
}
interface EventSeries {
    seriesName: string | null;
    characters: EventCharacter[];
}
interface EventAuthor {
    name: string;
    series: EventSeries[];
}
interface EventData {
    authors: EventAuthor[];
}
interface EventTheme {
    primary: string;
    accent: string;
    ring: string;
    card: string;
    border: string;
    glow: string;
    textGlow: string;
    particle: string;
    particleGlow: string;
    mist: string;
    fireflyCore: string;
    fireflyGlow: string;
    bgImage: string;
    bgGradient: string;
}
interface EventMeta {
    slug: string;
    title: string;
    tagline: string;
    characterCount: number;
    authorCount: number;
    href: string;
    previewImages: string[];
    theme: EventTheme;
}
/** What a character card PNG carries, counted at build time. Never its text. */
interface CardColophon {
    bytes: number;
    spec: string;
    tokens: number;
    desc: number;
    first: number;
    alts: number;
    book: number;
    warn: string[];
    tags: string[];
}

export type { CardColophon as C, EventData as E, Character as a, EventTheme as b, CharacterLink as c, EventAuthor as d, EventCharacter as e, EventMeta as f, EventSeries as g };
