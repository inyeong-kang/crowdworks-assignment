import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styled from 'styled-components';
import { BoundingBox, DoclingDocument } from '@/types';

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

const CanvasContainer = styled.div`
    position: relative;
    width: ${DEFAULT_PAGE_WIDTH}px;
    height: ${DEFAULT_PAGE_HEIGHT}px;
    flex: 1;
`;

const Canvas = styled.canvas`
    display: block;
    width: ${DEFAULT_PAGE_WIDTH}px;
    height: ${DEFAULT_PAGE_HEIGHT}px;
    flex: 1;
`;

const PageControls = styled.div`
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
`;

const PageButton = styled.button`
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #212529;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
        background-color: #e9ecef;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PageInfo = styled.div`
    font-size: 14px;
    color: #495057;
`;

const HighlightOverlay = styled.div<{ bbox: BoundingBox }>`
    position: absolute;
    left: ${(props) => props.bbox.l}px;
    top: ${(props) => DEFAULT_PAGE_HEIGHT - props.bbox.t}px;
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
}: PDFViewerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [mousePosition, setMousePosition] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [boundingBoxes, setBoundingBoxes] = useState<BoundingBoxWithType[]>(
        [],
    );
    const [currentHighlight, setCurrentHighlight] =
        useState<BoundingBox | null>(null);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

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
        const loadPDF = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(url);
                const pdfDoc = await loadingTask.promise;
                setPdf(pdfDoc);
                setTotalPages(pdfDoc.numPages);
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        };

        loadPDF();
    }, [url]);

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
                    boxes.push({
                        ...p.bbox,
                        type: 'text',
                        ref: text.self_ref,
                    });
                });
            });

            // pictures에서 bbox 추출
            jsonData.pictures.forEach((picture) => {
                picture.prov?.forEach((p) => {
                    boxes.push({
                        ...p.bbox,
                        type: 'picture',
                        ref: picture.self_ref,
                    });
                });
            });

            // tables에서 bbox 추출
            jsonData.tables.forEach((table) => {
                table.prov?.forEach((p) => {
                    boxes.push({
                        ...p.bbox,
                        type: 'table',
                        ref: table.self_ref,
                    });
                });
            });

            setBoundingBoxes(boxes);
        };

        extractBoundingBoxes();
    }, [jsonData]);

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
        } else {
            setCurrentHighlight(null);
            onHighlightChange(null);
        }
    }, [mousePosition, boundingBoxes, onHighlightChange]);

    return (
        <ViewerContainer>
            <CanvasContainer>
                <Canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        width: `${pageWidth}px`,
                        height: `${pageHeight}px`,
                    }}
                />
                {currentHighlight && (
                    <HighlightOverlay bbox={currentHighlight} />
                )}
            </CanvasContainer>
            <PageControls>
                <PageButton
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                >
                    이전
                </PageButton>
                <PageInfo>
                    {currentPage} / {totalPages}
                </PageInfo>
                <PageButton
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                >
                    다음
                </PageButton>
            </PageControls>
        </ViewerContainer>
    );
};
