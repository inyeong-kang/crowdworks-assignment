/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pdfjsLib from 'pdfjs-dist';

interface Params {
    url: string;
    successCallback: (data?: any) => void;
    errorCallback: (error?: any) => void;
}

export const loadJSON = async ({
    url,
    successCallback,
    errorCallback,
}: Params) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to load JSON');
        }
        const data = await response.json();

        successCallback(data);
    } catch (err) {
        errorCallback(
            err instanceof Error ? err.message : 'Failed to load JSON',
        );
        console.error('Error loading JSON:', err);
    }
};

export const loadPDF = async ({
    url,
    successCallback,
    errorCallback,
}: Params) => {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;

        successCallback(pdfDoc);
    } catch (error) {
        errorCallback(error as Error);
    }
};
