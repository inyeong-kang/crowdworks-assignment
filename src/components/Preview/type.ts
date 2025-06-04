import { RefObject } from 'react';
import { DoclingDocument } from '@/types';

export interface StyledProps {
    $highlighted?: boolean;
    $isCaption?: boolean;
}

export interface BaseProps {
    data: DoclingDocument;
    isHighlighted: boolean;
    highlightedRef: string | null;
    highlightedElementRef: RefObject<HTMLElement | null>;
    onHighlightChange: (ref: string | null) => void;
}
