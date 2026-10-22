import { ClassValue } from 'clsx';
import * as react_jsx_runtime from 'react/jsx-runtime';

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

declare function cn(...inputs: ClassValue[]): string;
/** Extract flat Character list from nested EventData */
declare function getEventCharacters(data: EventData): Character[];
/** Count total characters across all authors/series in EventData */
declare function countEventCharacters(data: EventData): number;
/** Pull up to `max` preview images from EventData */
declare function getEventPreviewImages(data: EventData, max?: number): string[];

/** Default Avalon teal theme — used for Launch Day and as the base for new events */
declare const launchTheme: EventTheme;
/** Valentine's Day theme — rose/red palette */
declare const valentinesTheme: EventTheme;
/** All registered theme presets */
declare const themePresets: Record<string, EventTheme>;

interface CharacterCardProps {
    character: Character;
    index: number;
    isVisible: boolean;
}
declare function CharacterCard({ character, index, isVisible }: CharacterCardProps): react_jsx_runtime.JSX.Element;

interface CreatorLink {
    label: string;
    url: string;
}
interface Creator {
    name: string;
    image: string;
    links: CreatorLink[];
}
interface FeaturedCreatorProps {
    creator: Creator;
    index: number;
    isVisible: boolean;
}
declare function FeaturedCreator({ creator, index, isVisible }: FeaturedCreatorProps): react_jsx_runtime.JSX.Element;

interface FirefliesProps {
    coreColor?: string;
    glowColor?: string;
    count?: number;
}
declare function Fireflies({ coreColor, glowColor, count, }: FirefliesProps): react_jsx_runtime.JSX.Element;

interface FloatingParticlesProps {
    coreColor?: string;
    glowColor?: string;
    count?: number;
}
declare function FloatingParticles({ coreColor, glowColor, count, }: FloatingParticlesProps): react_jsx_runtime.JSX.Element;

interface MistLayersProps {
    color?: string;
    count?: number;
}
declare function MistLayers({ color, count }: MistLayersProps): react_jsx_runtime.JSX.Element;

export { type Character, CharacterCard, type CharacterLink, type EventAuthor, type EventCharacter, type EventData, type EventMeta, type EventSeries, type EventTheme, FeaturedCreator, Fireflies, FloatingParticles, MistLayers, cn, countEventCharacters, getEventCharacters, getEventPreviewImages, launchTheme, themePresets, valentinesTheme };
