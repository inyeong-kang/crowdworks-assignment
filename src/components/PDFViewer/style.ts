import styled from 'styled-components';
import { BoundingBox } from '@/types';

export const ViewerContainer = styled.div`
    width: 100%;
    min-width: 50%
    height: 100%;
    overflow: auto;
    position: relative;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
`;

export const CanvasContainer = styled.div<{ width: number; height: number }>`
    position: relative;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    flex: 1;
`;

export const Canvas = styled.canvas<{ width: number; height: number }>`
    display: block;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    flex: 1;
`;

export const HighlightOverlay = styled.div<{
    bbox: BoundingBox;
    pageHeight: number;
}>`
    position: absolute;
    left: ${(props) => props.bbox.l}px;
    top: ${(props) => props.pageHeight - props.bbox.t}px;
    width: ${(props) => props.bbox.r - props.bbox.l}px;
    height: ${(props) => props.bbox.t - props.bbox.b}px;
    background-color: rgba(0, 123, 255, 0.1);
    border: 2px solid rgba(0, 123, 255, 0.5);
    pointer-events: none;
`;
