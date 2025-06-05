import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPDF } from '@/utils';

interface UsePDFRenderingProps {
    url: string;
    currentPage: number;
    onPageLoad?: (page: pdfjsLib.PDFPageProxy) => void;
    onTotalPagesChange: (totalPages: number) => void;
}

export const usePDFRendering = ({
    url,
    currentPage,
    onPageLoad,
    onTotalPagesChange,
}: UsePDFRenderingProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

    useEffect(() => {
        loadPDF({
            url,
            successCallback: (pdfDoc: pdfjsLib.PDFDocumentProxy) => {
                setPdf(pdfDoc);
                onTotalPagesChange(pdfDoc.numPages);
            },
            errorCallback: (error: Error) => {
                console.error('Error loading PDF:', error);
            },
        });
    }, [url, onTotalPagesChange]);

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

    return {
        canvasRef,
    };
};
