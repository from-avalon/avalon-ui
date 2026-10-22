import * as react_jsx_runtime from 'react/jsx-runtime';
import { C as Character } from './types-BiT-CgPE.cjs';

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

export { CharacterCard, FeaturedCreator, Fireflies, FloatingParticles, MistLayers };
