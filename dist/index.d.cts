import { E as EventData, C as Character, a as EventTheme } from './types-BiT-CgPE.cjs';
export { b as CharacterLink, c as EventAuthor, d as EventCharacter, e as EventMeta, f as EventSeries } from './types-BiT-CgPE.cjs';
import { ClassValue } from 'clsx';

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

export { Character, EventData, EventTheme, cn, countEventCharacters, deepwoodTheme, getEventCharacters, getEventPreviewImages, launchTheme, pastelNightmaresTheme, themePresets, valentinesTheme };
