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
/** All registered theme presets */
declare const themePresets: Record<string, EventTheme>;

export { Character, EventData, EventTheme, cn, countEventCharacters, getEventCharacters, getEventPreviewImages, launchTheme, pastelNightmaresTheme, themePresets, valentinesTheme };
