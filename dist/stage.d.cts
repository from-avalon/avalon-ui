import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ReactNode, ElementType, CSSProperties, RefObject, Ref } from 'react';
import { C as CardColophon, c as CharacterLink } from './types-BM_6AgIg.cjs';

type Job = () => void;
declare function requestStageFrame(): void;
/** Runs `job` on the next frame and after every scroll or resize. Returns the unsubscribe. */
declare function onStageFrame(job: Job): () => void;
/** How far `el` has travelled through the viewport: 0 as its top enters from below, 1 as its foot leaves above. */
declare function viewportProgress(el: Element): number;
/** Goes to a section. Past one screen it cuts under a short fade instead of panning across everything between: a pan makes
    the visitor wait. Nearby, and under reduced motion, it just goes. `below` lands that many px past the top, for a place inside
    a held section. */
declare function jumpTo(el: HTMLElement, below?: number): void;

/** Fits each element's words to its width, starting each time from the stylesheet's size, so it follows the stylesheet when the
    screen turns and grows back when there's room. */
declare function fitWidth(els: Iterable<HTMLElement>, min?: number): void;
/** Fits everything matching `selector` now, and whenever the window or the fonts change. */
declare function useFitWidth(selector: string, min?: number): void;

/** A phone: narrow, or a touch screen too short for the desktop layout, as a phone on its side. The CSS uses the same query. */
declare const PHONE = "(max-width: 760px), (max-height: 500px) and (pointer: coarse)";
declare function useMedia(query: string): boolean;
interface Motion {
    /** The visitor asked their system for reduced motion. */
    reduced: boolean;
    /** The visitor pressed pause. */
    paused: boolean;
    toggle: () => void;
}
declare function MotionProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useMotion(): Motion;
/** The switch for ambient motion: a round button, or with `labelled` a row with its words showing, as in a menu. */
declare function MotionToggle({ className, labelled }: {
    className?: string;
    labelled?: boolean;
}): react_jsx_runtime.JSX.Element | null;

declare function useInView<T extends Element>(ref: RefObject<T | null>, options?: {
    rootMargin?: string;
    threshold?: number;
    once?: boolean;
}): boolean;
interface RevealProps {
    as?: ElementType;
    className?: string;
    style?: CSSProperties;
    /** Seconds before this one rises. */
    delay?: number;
    children: ReactNode;
    [attr: string]: unknown;
}
/** Rises into place the first time it comes into view. Opacity and transform only, so it stays in the tab order;
    focusing inside finishes it at once (theme/stage.css). */
declare function Reveal({ as: Tag, className, style, delay, children, ...rest }: RevealProps): react_jsx_runtime.JSX.Element;
interface SplitTextProps {
    as?: ElementType;
    text: string;
    className?: string;
    /** Rise on view, or leave it to the parent to set `data-in`. */
    auto?: boolean;
    style?: CSSProperties;
}
/** Letters that rise one after another. Screen readers get the whole text from the label. */
declare function SplitText({ as: Tag, text, className, auto, style }: SplitTextProps): react_jsx_runtime.JSX.Element;

interface ParallaxPlaneProps {
    /** Share of the scroll this layer lags by: .4 is far, negative runs ahead of the page. */
    depth: number;
    /** Wide screens only. */
    desk?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}
/** One layer of a section's backdrop, moved by the scroll. Transform only. The plane overhangs its section by exactly
    its travel, so no edge ever shows. */
declare function ParallaxPlane({ depth, desk, className, style, children }: ParallaxPlaneProps): react_jsx_runtime.JSX.Element;
/** A band of drifting mist for a section's backdrop. The image comes from `--avl-mist` on any ancestor. */
declare function MistBand({ depth, desk, near }: {
    depth: number;
    desk?: boolean;
    near?: boolean;
}): react_jsx_runtime.JSX.Element;

type Rgb = [number, number, number];
interface DepthOptions {
    /** The procedural relief, each 0 to 1: where the horizon sits, and how far the floor, the sides and the canopy come forward. */
    shape?: {
        horizon: number;
        floor: number;
        sides: number;
        canopy: number;
    };
    mist?: {
        color: Rgb;
        amount: number;
    };
    /** Colour of the drifting motes; leave out for none. */
    motes?: Rgb;
    zoom?: number;
    anchor?: [number, number];
    bright?: number;
    /** Render resolution. These sit behind copy, dimmed and misted, so they render under screen size. */
    scale?: number;
}

interface DepthCamera {
    cam(x: number, y: number): void;
}
interface DepthPlaneProps extends DepthOptions {
    src: string;
    alt?: string;
    width: number;
    height: number;
    className?: string;
    style?: CSSProperties;
    loading?: "lazy" | "eager";
    /** Hold the current frame, as when something covers most of this plane. */
    hold?: boolean;
}
/** A painting that moves in depth with a camera the page drives. Phones and reduced motion keep the plain <img>. */
declare const DepthPlane: react.ForwardRefExoticComponent<DepthPlaneProps & react.RefAttributes<DepthCamera>>;

interface SideRow {
    /** 1-based range of items fully in view, and how many there are. */
    first: number;
    last: number;
    total: number;
    /** The item nearest the start of the row, from 0. */
    current: number;
    atStart: boolean;
    atEnd: boolean;
    /** Move on a view at a time, never cutting an item. */
    page(dir: 1 | -1): void;
    /** Bring an item to the start of the row. */
    go(index: number, instant?: boolean): void;
}
/** A row that scrolls sideways natively: swipe, trackpad, shift-wheel, the left and right keys while it's in view, or the arrows you
    wire to `page`. It only watches, and vertical scrolling passes straight through to the page. Give the element `.avl-row`, with the
    items as its direct children; a mouse can drag it too. `onMove` gets 0 to 1 as the row moves. */
declare function useSideRow(ref: RefObject<HTMLElement | null>, onMove?: (p: number) => void): SideRow;

interface RowRun {
    /** Whether the section is held right now. */
    on: boolean;
    /** How far below the section's top the page rests with this item in place. 0 while off. */
    placeOf(index: number): number;
    /** On to the next stop that way, as an arrow does: the row moves and the page follows. Nothing while off. */
    step(dir: 1 | -1): void;
}
/** Holds a section in place while the page's own scroll walks its row through, a view at a time. Nothing is intercepted: the wheel,
    the trackpad and the keys scroll the page as ever, and the row is a function of where the page is. A sideways swipe, an arrow or
    a key moves the row natively and the page follows out of sight. When the page comes to rest between stops it settles on one.

    `host` is the tall element and needs `.avl-run`, its child the sticky `.avl-run-stage`; `row` is an `.avl-row` inside it. Without
    `html.avl-snap` nothing here runs, and the row is plain. */
declare function useRowRun(host: RefObject<HTMLElement | null>, row: RefObject<HTMLElement | null>): RowRun;

/** The feel of the page's landings and of a held section, in one place. */
interface RunTuning {
    /** How strongly the page lands between sections: the longest trip it will make, as a share of the space between them. 1 always
        lands, lower lands only when close, 0 turns it off. */
    sectionPull: number;
    /** Scroll past a section, in px, that counts as leaving it. Short of it, the section comes back. */
    sectionNudge: number;
    /** How long landing takes, in ms, across a whole screen. */
    sectionGlide: number;
    /** How far past a section a long trip can overshoot and still come back to it, in screens. Past that it lands on the next one,
        and the section it flew past is skipped. */
    sectionBack: number;
    /** How long after the scroll ends, in ms, the page lands. */
    wait: number;
    /** A held section: scroll spent per stop, in px. More and a flick covers fewer stops, but the page gets longer. A flick is the same
        distance on any screen, so this doesn't scale with one. */
    hand: number;
    /** A held section: how firmly a stop holds its place. 1 moves evenly; 2 to 3 lingers on each and crosses quickly between them. */
    snap: number;
    /** A held section: how far towards the next stop counts as meaning to go there, from 0 to 1. Short of it, the page comes back. */
    commit: number;
    /** A held section: how long a settle takes, in ms, across a whole stop. */
    glide: number;
    /** A held section: in viewport heights, how long the last stop stays held before the section lets go. */
    edge: number;
}
declare const getRunTuning: () => RunTuning;
/** Changes the feel live, and re-measures every held section. */
declare function setRunTuning(next: Partial<RunTuning>): void;
/** The page's sections, top to bottom: a page at rest between two of them lands on one. */
declare function useSectionSnap(ids: string[]): void;

interface SectionLink {
    id: string;
    label: string;
    /** The section's number, shown in the menu. */
    no?: string;
}
/** Which of the page's sections holds the upper middle of the screen. */
declare function useActiveSection(ids: string[]): number;
interface SiteBarProps {
    brand: ReactNode;
    links: SectionLink[];
    /** The bar stays away until this element's foot has left the screen. Leave it out for a bar that's always there. */
    pastId?: string;
    /** Section ids the links point at, in page order, starting with the hero. */
    active: string | undefined;
    action?: ReactNode;
    /** Last in the menu, after the links, as a switch that leaves the bar on a phone. */
    menuEnd?: ReactNode;
}
/** The top bar. It only exists past the hero; a keyboard user who tabs into it brings it along. Below 1100px the links
    fold into a modal menu. */
declare function SiteBar({ brand, links, pastId, active, action, menuEnd }: SiteBarProps): react_jsx_runtime.JSX.Element;
/** The side rail: a tick per section, each a link, so any section is one click away, even over the hero where there is
    no bar. */
declare function SectionRail({ sections, current }: {
    sections: SectionLink[];
    current: number;
}): react_jsx_runtime.JSX.Element;

/** Platform pills for a character or a maker. */
declare function PlatformLinks({ links }: {
    links: CharacterLink[];
}): react_jsx_runtime.JSX.Element;
declare function DownloadIcon(): react_jsx_runtime.JSX.Element;
declare function TurnIcon(): react_jsx_runtime.JSX.Element;
interface CardBackProps {
    id?: string;
    name: string;
    maker: ReactNode;
    colophon?: CardColophon;
    /** The card PNG. */
    href: string | null;
    turned: boolean;
    color?: string;
    headingRef?: Ref<HTMLHeadingElement>;
    /** Extra actions beside the download. */
    children?: ReactNode;
}
/** The back of a character card: what its PNG carries, counted at build time. Lives inside `.avl-turn`, opposite the
    portrait. Hidden from everyone until it's turned. */
declare function CardBack({ id, name, maker, colophon, href, turned, color, headingRef, children }: CardBackProps): react_jsx_runtime.JSX.Element;

export { CardBack, type DepthCamera, type DepthOptions, DepthPlane, DownloadIcon, MistBand, type Motion, MotionProvider, MotionToggle, PHONE, ParallaxPlane, PlatformLinks, Reveal, type RowRun, type RunTuning, type SectionLink, SectionRail, type SideRow, SiteBar, SplitText, TurnIcon, fitWidth, getRunTuning, jumpTo, onStageFrame, requestStageFrame, setRunTuning, useActiveSection, useFitWidth, useInView, useMedia, useMotion, useRowRun, useSectionSnap, useSideRow, viewportProgress };
