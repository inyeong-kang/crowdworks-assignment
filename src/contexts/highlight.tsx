import { ReactNode, createContext, useContext, useState } from 'react';
import { BoundingBox, BoundingBoxWithType } from '@/types';

interface MousePosition {
    x: number;
    y: number;
}

interface HighlightContextType {
    highlightedRef: string | null;
    setHighlightedRef: (ref: string | null) => void;
    currentHighlight: BoundingBox | null;
    setCurrentHighlight: (highlight: BoundingBox | null) => void;
    mousePosition: MousePosition | null;
    setMousePosition: (position: MousePosition | null) => void;
    boundingBoxes: BoundingBoxWithType[];
    setBoundingBoxes: (boxes: BoundingBoxWithType[]) => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(
    undefined,
);

export const HighlightProvider = ({ children }: { children: ReactNode }) => {
    const [highlightedRef, setHighlightedRef] = useState<string | null>(null);
    const [currentHighlight, setCurrentHighlight] =
        useState<BoundingBox | null>(null);
    const [mousePosition, setMousePosition] = useState<MousePosition | null>(
        null,
    );
    const [boundingBoxes, setBoundingBoxes] = useState<BoundingBoxWithType[]>(
        [],
    );

    return (
        <HighlightContext.Provider
            value={{
                highlightedRef,
                setHighlightedRef,
                currentHighlight,
                setCurrentHighlight,
                mousePosition,
                setMousePosition,
                boundingBoxes,
                setBoundingBoxes,
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
};

export const useHighlight = () => {
    const context = useContext(HighlightContext);
    if (context === undefined) {
        throw new Error('useHighlight must be used within a HighlightProvider');
    }
    return context;
};
