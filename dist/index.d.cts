import { C as CardColophon, E as EventData, a as Character, b as EventTheme } from './types-BM_6AgIg.cjs';
export { c as CharacterLink, d as EventAuthor, e as EventCharacter, f as EventMeta, g as EventSeries } from './types-BM_6AgIg.cjs';
import { ClassValue } from 'clsx';

declare function cn(...inputs: ClassValue[]): string;
/** Extract flat Character list from nested EventData */
declare function getEventCharacters(data: EventData): Character[];
/** Count total characters across all authors/series in EventData */
declare function countEventCharacters(data: EventData): number;
/** Pull up to `max` preview images from EventData */
declare function getEventPreviewImages(data: EventData, max?: number): string[];
/** Typographic cleanup for maker-written text: curly quotes, ellipses, and an en dash where they typed an em dash. */
declare function typo(s: string | null | undefined): string;
/** Card names carry an epithet after a separator: "Name | The Epithet". Returns [name, epithet]. */
declare function splitCharacterName(name: string): [string, string];
/** The rows on the back of a card. Tokens cover the prompt fields and the first message; other greetings and the
    lorebook aren't counted. */
declare function colophonRows(c: CardColophon): {
    label: string;
    value: string;
}[];

/** Default Avalon teal theme — used for Launch Day and as the base for new events */
declare const launchTheme: EventTheme;
/** Valentine's Day theme — rose/red palette */
declare const valentinesTheme: EventTheme;
/**
 * Pastel Nightmares — light/cream pastel theme for the "aesthetic lies" collab.
 *
 * INVERSE-MODE: this is the first preset designed to override the base dark
 * tokens. Collabs using this preset must also override --color-background,
 * --color-foreground, etc. on a root wrapper. See DESIGN-SYSTEM.md.
 *
 * Off-key/dissonance signal color: TBD. Current values are safe-pastel-only;
 * once the visual baseline is locked, we revisit ring/textGlow/fireflyCore
 * with a "wrong" hue (sickly yellow / bruise purple / mold green candidates).
 */
declare const pastelNightmaresTheme: EventTheme;
/**
 * Deepwood Rising — rusted iron + torn parchment over the forest-dark base.
 *
 * A gold-rush refugee camp at the edge of an encroaching Deep Woods, run out of
 * the Briarmark guild tent. Unlike the gallery collabs, this site hosts ONE
 * scenario card whose lorebook is built from community-submitted NPCs; the
 * CharacterCard reads these tokens for the single featured scenario card.
 *
 * Keeps the forest background/card; shifts accents, glow and fireflies warm
 * (iron/amber). Apply alongside data-event="deepwood".
 */
declare const deepwoodTheme: EventTheme;
/** All registered theme presets */
declare const themePresets: Record<string, EventTheme>;

export { CardColophon, Character, EventData, EventTheme, cn, colophonRows, countEventCharacters, deepwoodTheme, getEventCharacters, getEventPreviewImages, launchTheme, pastelNightmaresTheme, splitCharacterName, themePresets, typo, valentinesTheme };
