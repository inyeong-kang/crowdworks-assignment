import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styled from 'styled-components';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

interface PDFViewerProps {
    url: string;
    onPageLoad?: (page: pdfjsLib.PDFPageProxy) => void;
}

const ViewerContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
`;

const Canvas = styled.canvas`
    display: block;
    width: 100%;
    height: auto;
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

export const PDFViewer = ({ url, onPageLoad }: PDFViewerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

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
                // 이전 렌더링 작업이 있다면 취소
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

    return (
        <ViewerContainer>
            <Canvas ref={canvasRef} />
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
