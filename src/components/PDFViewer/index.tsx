import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Pagination } from '@/components';
import { useHighlight, usePagination } from '@/contexts';
import { usePDFRendering } from '@/hooks';
import { BoundingBox, BoundingBoxWithType, DoclingDocument } from '@/types';
import {
    Canvas,
    CanvasContainer,
    HighlightOverlay,
    ViewerContainer,
} from './style';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

// PDF 페이지 크기 상수
const DEFAULT_PAGE_HEIGHT = 842;
const DEFAULT_PAGE_WIDTH = 595;

interface PDFViewerProps {
    url: string;
    onPageLoad?: (page: pdfjsLib.PDFPageProxy) => void;
    jsonData: DoclingDocument;
    pageWidth?: number;
    pageHeight?: number;
}

export const PDFViewer = ({
    url,
    onPageLoad,
    jsonData,
    pageWidth = DEFAULT_PAGE_WIDTH,
    pageHeight = DEFAULT_PAGE_HEIGHT,
}: PDFViewerProps) => {
    const viewerContainerRef = useRef<HTMLDivElement | null>(null);
    const { currentPage, setTotalPages } = usePagination();
    const {
        mousePosition,
        setMousePosition,
        boundingBoxes,
        setBoundingBoxes,
        currentHighlight,
        setCurrentHighlight,
        highlightedRef,
        setHighlightedRef,
    } = useHighlight();

    const { canvasRef } = usePDFRendering({
        url,
        currentPage,
        onPageLoad,
        onTotalPagesChange: setTotalPages,
    });

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // 캔버스 내에서의 상대 좌표 계산
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setMousePosition({ x, y: pageHeight - y });
    };

    const handleMouseLeave = () => {
        setMousePosition(null);
    };

    useEffect(() => {
        if (!jsonData) {
            return;
        }

        const extractBoundingBoxes = () => {
            const boxes: BoundingBoxWithType[] = [];

            const extractFromItems = <
                T extends {
                    self_ref: string;
                    prov?: Array<{ page_no: number; bbox: BoundingBox }>;
                },
            >(
                items: T[],
                type: string,
            ) => {
                items.forEach((item) => {
                    item.prov?.forEach((p) => {
                        if (p.page_no === currentPage) {
                            boxes.push({
                                ...p.bbox,
                                type,
                                ref: item.self_ref,
                            });
                        }
                    });
                });
            };

            extractFromItems(jsonData.texts, 'text');
            extractFromItems(jsonData.pictures, 'picture');
            extractFromItems(jsonData.tables, 'table');

            setBoundingBoxes(boxes);
        };

        extractBoundingBoxes();
    }, [jsonData, currentPage, setBoundingBoxes]);

    // Preview에서 클릭된 요소와 매칭되는 영역 하이라이트
    useEffect(() => {
        if (highlightedRef && boundingBoxes.length > 0) {
            const box = boundingBoxes.find((b) => b.ref === highlightedRef);

            if (box) {
                setCurrentHighlight({ ...box });

                // Preview에서 클릭했을 때만 스크롤 동작
                if (viewerContainerRef.current && !mousePosition) {
                    const container = viewerContainerRef.current;
                    const highlightTop = pageHeight - box.t;
                    const containerHeight = container.clientHeight;
                    const scrollTop = highlightTop - containerHeight / 2;

                    container.scrollTo({
                        top: scrollTop,
                        behavior: 'smooth',
                    });
                }
            }
        } else {
            setCurrentHighlight(null);
        }
    }, [
        highlightedRef,
        boundingBoxes,
        pageHeight,
        mousePosition,
        setCurrentHighlight,
    ]);

    // 페이지가 변경될 때 하이라이트 초기화
    useEffect(() => {
        setCurrentHighlight(null);
        setHighlightedRef(null);
    }, [currentPage, setCurrentHighlight, setHighlightedRef]);

    // 마우스 이벤트로 인한 하이라이트 처리
    useEffect(() => {
        if (mousePosition && boundingBoxes.length > 0) {
            const currentBox = boundingBoxes.find((box) => {
                return (
                    mousePosition.x >= box.l &&
                    mousePosition.x <= box.r &&
                    mousePosition.y >= box.b &&
                    mousePosition.y <= box.t
                );
            });

            if (currentBox) {
                setCurrentHighlight({ ...currentBox });
                setHighlightedRef(currentBox.ref);
            } else {
                setCurrentHighlight(null);
                setHighlightedRef(null);
            }
        }
    }, [mousePosition, boundingBoxes, setCurrentHighlight, setHighlightedRef]);

    return (
        <ViewerContainer ref={viewerContainerRef}>
            <CanvasContainer width={pageWidth} height={pageHeight}>
                <Canvas
                    ref={canvasRef}
                    width={pageWidth}
                    height={pageHeight}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />
                {currentHighlight && (
                    <HighlightOverlay
                        bbox={currentHighlight}
                        pageHeight={pageHeight}
                    />
                )}
            </CanvasContainer>
            <Pagination />
        </ViewerContainer>
    );
};
