import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

interface PageCanvas {
  canvas: HTMLCanvasElement;
  pageNum: number;
  rendered: boolean;
}

interface PdfRenderResult {
  pagesRendered: number[];
  isRendering: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  renderPage: (pageNum: number) => Promise<void>;
  renderAllPages: () => Promise<void>;
  clearRenderedPages: () => void;
}

/**
 * Custom hook for rendering PDF pages to canvas elements
 */
export const usePdfRenderer = (
  pdfDoc: PDFDocumentProxy | null,
  canvasWidth: number
): PdfRenderResult => {
  const [pagesRendered, setPagesRendered] = useState<number[]>([]);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderingPage, setRenderingPage] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageCanvasesRef = useRef<Map<number, PageCanvas>>(new Map());

  /**
   * Render a specific page from the PDF
   */
  const renderPage = useCallback(async (pageNum: number): Promise<void> => {
    if (!pdfDoc || renderingPage === pageNum) {
      return;
    }
    
    setRenderingPage(pageNum);
    setIsRendering(true);
    
    try {
      const page: PDFPageProxy = await pdfDoc.getPage(pageNum);

      let pageCanvas = pageCanvasesRef.current.get(pageNum);
      if (!pageCanvas) {
        const canvas = document.createElement('canvas');
        canvas.className = 'page-canvas mx-auto bg-white shadow-md dark:shadow-lg shadow-gray-800 dark:shadow-zinc-700';
        pageCanvas = { canvas, pageNum, rendered: false };
        pageCanvasesRef.current.set(pageNum, pageCanvas);
      }
      
      const resolution = 2.5;
      const viewport = page.getViewport({ scale: 1 });
      pageCanvas.canvas.width = resolution * viewport.width;
      pageCanvas.canvas.height = resolution * viewport.height;
      pageCanvas.canvas.style.width = "100%";
      pageCanvas.canvas.style.maxWidth = `${canvasWidth}px`;
      
      const ctx = pageCanvas.canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: [resolution, 0, 0, resolution, 0, 0],
        renderInteractiveForms: false,
        enableXfa: false,
        intent: 'display',
      };

      // Wait for rendering to finish
      await page.render(renderContext).promise;
      
      pageCanvas.rendered = true;
      
      if (containerRef.current) {
        const existingWrapper = containerRef.current.querySelector(`[data-page="${pageNum}"]`);
        
        if (!existingWrapper) {
          const wrapper = document.createElement('div');
          wrapper.className = 'page-container mb-3';
          wrapper.setAttribute('data-page', pageNum.toString());
          wrapper.appendChild(pageCanvas.canvas);
          containerRef.current.appendChild(wrapper);
        }
      }
      
      setPagesRendered(prev => {
        if (!prev.includes(pageNum)) {
          return [...prev, pageNum].sort((a, b) => a - b);
        }
        return prev;
      });
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    } finally {
      setRenderingPage(null);
      setIsRendering(false);
    }
  }, [pdfDoc, renderingPage, canvasWidth]);

  /**
   * Render all pages in the PDF
   */
  const renderAllPages = useCallback(async (): Promise<void> => {
    if (!pdfDoc) return;
    
    setIsRendering(true);
    
    // Need to clear container first
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }
    
    // Render each page sequentially
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      await renderPage(pageNum);
    }
    
    setIsRendering(false);
  }, [pdfDoc, renderPage]);

  /**
   * Clear all rendered pages
   */
  const clearRenderedPages = useCallback((): void => {
    // Need to clear the container
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }
    
    // Now clear the page canvases
    pageCanvasesRef.current.clear();
    setPagesRendered([]);
  }, []);

  // Effect to handle changes in PDF document or canvas width
  useEffect(() => {
    if (pdfDoc) {
      // When PDF changes, clear and re-render
      clearRenderedPages();
      renderAllPages();
    }
    
    return () => {
      // Clean up on unmount
      clearRenderedPages();
    };
  }, [pdfDoc, canvasWidth]);

  return {
    pagesRendered,
    isRendering,
    containerRef,
    renderPage,
    renderAllPages,
    clearRenderedPages
  };
};