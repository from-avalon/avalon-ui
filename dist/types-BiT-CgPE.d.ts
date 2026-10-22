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

export type { Character as C, EventData as E, EventTheme as a, CharacterLink as b, EventAuthor as c, EventCharacter as d, EventMeta as e, EventSeries as f };
