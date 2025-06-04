import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styled from 'styled-components';
import { Pagination } from '@/components';
import { usePagination } from '@/contexts';
import { BoundingBox, DoclingDocument } from '@/types';
import { loadPDF } from '@/utils';

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
    onHighlightChange: (ref: string | null) => void;
    pageWidth?: number;
    pageHeight?: number;
    highlightedRef: string | null;
}

interface BoundingBoxWithType extends BoundingBox {
    type: string;
    ref: string;
}

const ViewerContainer = styled.div`
    width: 100%;
    min-width: 50%
    height: 100%;
    overflow: auto;
    position: relative;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
`;

const CanvasContainer = styled.div<{ width: number; height: number }>`
    position: relative;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    flex: 1;
`;

const Canvas = styled.canvas<{ width: number; height: number }>`
    display: block;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    flex: 1;
`;

const HighlightOverlay = styled.div<{ bbox: BoundingBox; pageHeight: number }>`
    position: absolute;
    left: ${(props) => props.bbox.l}px;
    top: ${(props) => props.pageHeight - props.bbox.t}px;
    width: ${(props) => props.bbox.r - props.bbox.l}px;
    height: ${(props) => props.bbox.t - props.bbox.b}px;
    background-color: rgba(0, 123, 255, 0.1);
    border: 2px solid rgba(0, 123, 255, 0.5);
    pointer-events: none;
`;

export const PDFViewer = ({
    url,
    onPageLoad,
    jsonData,
    onHighlightChange,
    pageWidth = DEFAULT_PAGE_WIDTH,
    pageHeight = DEFAULT_PAGE_HEIGHT,
    highlightedRef,
}: PDFViewerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
    const viewerContainerRef = useRef<HTMLDivElement | null>(null);
    const { currentPage, setTotalPages } = usePagination();

    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [mousePosition, setMousePosition] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [boundingBoxes, setBoundingBoxes] = useState<BoundingBoxWithType[]>(
        [],
    );
    const [currentHighlight, setCurrentHighlight] =
        useState<BoundingBox | null>(null);

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // 캔버스 내에서의 상대 좌표 계산
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // PDF 좌표계로 변환 (y축 반전)
        const pdfX = x;
        const pdfY = pageHeight - y;

        setMousePosition({ x: pdfX, y: pdfY });
    };

    const handleMouseLeave = () => {
        setMousePosition(null);
    };

    useEffect(() => {
        loadPDF({
            url,
            successCallback: (pdfDoc: pdfjsLib.PDFDocumentProxy) => {
                setPdf(pdfDoc);
                setTotalPages(pdfDoc.numPages);
            },
            errorCallback: (error: Error) => {
                console.error('Error loading PDF:', error);
            },
        });
    }, [url, setTotalPages]);

    useEffect(() => {
        const renderPage = async () => {
            if (!pdf || !canvasRef.current) return;

            try {
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                    renderTaskRef.current = null;
                }

                const page = await pdf.getPage(currentPage);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                renderTaskRef.current = page.render(renderContext);
                await renderTaskRef.current.promise;
                renderTaskRef.current = null;

                onPageLoad?.(page);
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message.includes('cancelled')
                ) {
                    return;
                }
                console.error('Error rendering page:', error);
            }
        };

        renderPage();

        return () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }
        };
    }, [pdf, currentPage, onPageLoad]);

    useEffect(() => {
        if (!jsonData) {
            return;
        }

        const extractBoundingBoxes = () => {
            const boxes: BoundingBoxWithType[] = [];

            // texts에서 bbox 추출
            jsonData.texts.forEach((text) => {
                text.prov?.forEach((p) => {
                    if (p.page_no === currentPage) {
                        boxes.push({
                            ...p.bbox,
                            type: 'text',
                            ref: text.self_ref,
                        });
                    }
                });
            });

            // pictures에서 bbox 추출
            jsonData.pictures.forEach((picture) => {
                picture.prov?.forEach((p) => {
                    if (p.page_no === currentPage) {
                        boxes.push({
                            ...p.bbox,
                            type: 'picture',
                            ref: picture.self_ref,
                        });
                    }
                });
            });

            // tables에서 bbox 추출
            jsonData.tables.forEach((table) => {
                table.prov?.forEach((p) => {
                    if (p.page_no === currentPage) {
                        boxes.push({
                            ...p.bbox,
                            type: 'table',
                            ref: table.self_ref,
                        });
                    }
                });
            });

            setBoundingBoxes(boxes);
        };

        extractBoundingBoxes();
    }, [jsonData, currentPage]);

    // Preview에서 클릭된 요소와 매칭되는 영역 하이라이트
    useEffect(() => {
        if (highlightedRef && boundingBoxes.length > 0) {
            const box = boundingBoxes.find((b) => b.ref === highlightedRef);
            if (box) {
                setCurrentHighlight({
                    l: box.l,
                    t: box.t,
                    r: box.r,
                    b: box.b,
                    coord_origin: box.coord_origin,
                });

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
    }, [highlightedRef, boundingBoxes, pageHeight, mousePosition]);

    // 페이지가 변경될 때 하이라이트 초기화
    useEffect(() => {
        setCurrentHighlight(null);
        onHighlightChange(null);
    }, [currentPage, onHighlightChange]);

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
                setCurrentHighlight({
                    l: currentBox.l,
                    t: currentBox.t,
                    r: currentBox.r,
                    b: currentBox.b,
                    coord_origin: currentBox.coord_origin,
                });
                onHighlightChange(currentBox.ref);
            } else {
                setCurrentHighlight(null);
                onHighlightChange(null);
            }
        }
    }, [mousePosition, boundingBoxes, onHighlightChange]);

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
