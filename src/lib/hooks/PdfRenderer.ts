import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderingRef = useRef<{
    inProgress: boolean;
    buffer: HTMLDivElement | null;
    activeBuffer: HTMLDivElement | null;
  }>({
    inProgress: false,
    buffer: null,
    activeBuffer: null
  });

  /**
   * Render a single PDF page to a canvas element
   */
  const renderPageToCanvas = useCallback(async (
    pageNum: number, 
    pdfDoc: PDFDocumentProxy
  ): Promise<HTMLCanvasElement | null> => {
    try {
      // Get the page from the PDF
      const page: PDFPageProxy = await pdfDoc.getPage(pageNum);
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas mx-auto bg-white shadow-md dark:shadow-lg shadow-gray-800 dark:shadow-zinc-700';
      canvas.setAttribute('data-page', pageNum.toString());
      
      const resolution = 2.5;
      const viewport = page.getViewport({ scale: 1 });
      canvas.width = resolution * viewport.width;
      canvas.height = resolution * viewport.height;
      canvas.style.width = "100%";
      canvas.style.maxWidth = `${canvasWidth}px`;
      
      const ctx = canvas.getContext('2d');
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
      
      return canvas;
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      return null;
    }
  }, [canvasWidth]);

  /**
   * Prepare a fresh buffer div for the new content
   */
  const prepareBuffer = useCallback(() => {
    // Create a new buffer div for rendering
    const bufferDiv = document.createElement('div');
    bufferDiv.className = 'pdf-buffer';
    bufferDiv.style.width = '100%';
    
    // Replace any existing unused buffer
    if (renderingRef.current.buffer) {
      const oldBuffer = renderingRef.current.buffer;
      if (oldBuffer.parentNode) {
        oldBuffer.parentNode.removeChild(oldBuffer);
      }
    }
    
    renderingRef.current.buffer = bufferDiv;
    return bufferDiv;
  }, []);

  /**
   * Swap the active buffer with the newly rendered one
   */
  const swapBuffers = useCallback(() => {
    if (!containerRef.current || !renderingRef.current.buffer) return;
    
    // Add the new buffer to the container
    containerRef.current.appendChild(renderingRef.current.buffer);
    
    // Remove the old buffer after a tiny delay to prevent flicker
    if (renderingRef.current.activeBuffer) {
      const oldBuffer = renderingRef.current.activeBuffer;

      // remove old content
      if (oldBuffer.parentNode) {
        oldBuffer.parentNode.removeChild(oldBuffer);
      }

      // Use timeout to doubly-ensure the new content is painted before removing old
      // A value of 0 typically works because it executes after the paint cycle
      setTimeout(() => {
        if (oldBuffer.parentNode) {
          oldBuffer.parentNode.removeChild(oldBuffer);
        }
      }, 0);
    }
    
    // Update tracking references
    renderingRef.current.activeBuffer = renderingRef.current.buffer;
    renderingRef.current.buffer = null;
    renderingRef.current.inProgress = false;
  }, []);

  /**
   * Render a specific page and add it to the container
   */
  const renderPage = useCallback(async (pageNum: number): Promise<void> => {
    if (!pdfDoc || renderingRef.current.inProgress) return;
    
    setIsRendering(true);
    renderingRef.current.inProgress = true;
    
    try {
      const buffer = prepareBuffer();

      const canvas = await renderPageToCanvas(pageNum, pdfDoc);
      
      if (canvas) {
        const wrapper = document.createElement('div');
        wrapper.className = 'page-container mb-3';
        wrapper.appendChild(canvas);

        buffer.appendChild(wrapper);
        
        // Swap buffers to display the new content
        swapBuffers();
        
        setPagesRendered([pageNum]);
      }
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    } finally {
      renderingRef.current.inProgress = false;
      setIsRendering(false);
    }
  }, [pdfDoc, renderPageToCanvas, prepareBuffer, swapBuffers]);

  /**
   * Render all pages using double-buffering to prevent any flicker
   */
  const renderAllPages = useCallback(async (): Promise<void> => {
    if (!pdfDoc || renderingRef.current.inProgress) return;
    
    setIsRendering(true);
    renderingRef.current.inProgress = true;
    
    try {
      const buffer = prepareBuffer();
      
      // Create a document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Prepare array to track successfully rendered pages
      const renderedPageNumbers: number[] = [];
      
      // Render all pages in parallel
      const renderPromises = Array.from(
        { length: pdfDoc.numPages }, 
        (_, i) => i + 1
      ).map(async (pageNum) => {
        const canvas = await renderPageToCanvas(pageNum, pdfDoc);
        
        if (canvas) {
          const wrapper = document.createElement('div');
          wrapper.className = 'page-container mb-3';
          wrapper.appendChild(canvas);
          
          fragment.appendChild(wrapper);
          
          renderedPageNumbers.push(pageNum);
        }
      });
      
      // Wait for all rendering to complete
      await Promise.all(renderPromises);
      
      buffer.appendChild(fragment);
      
      // Only swap if we have content (avoids showing blank screen)
      if (renderedPageNumbers.length > 0) {
        // Swap buffers to display the new content without flicker
        swapBuffers();
        setPagesRendered(renderedPageNumbers.sort((a, b) => a - b));
      }
    } catch (error) {
      console.error('Error rendering all pages:', error);
    } finally {
      renderingRef.current.inProgress = false;
      setIsRendering(false);
    }
  }, [pdfDoc, renderPageToCanvas, prepareBuffer, swapBuffers]);

  /**
   * Clear all rendered pages
   */
  const clearRenderedPages = useCallback((): void => {
    // Clean up buffers
    if (renderingRef.current.buffer && renderingRef.current.buffer.parentNode) {
      renderingRef.current.buffer.parentNode.removeChild(renderingRef.current.buffer);
    }
    
    if (renderingRef.current.activeBuffer && renderingRef.current.activeBuffer.parentNode) {
      renderingRef.current.activeBuffer.parentNode.removeChild(renderingRef.current.activeBuffer);
    }
    
    renderingRef.current.buffer = null;
    renderingRef.current.activeBuffer = null;
    
    setPagesRendered([]);
  }, []);

  // Effect to initialize when PDF changes
  useEffect(() => {
    // Initialize with container if we have both container and PDF
    if (containerRef.current && pdfDoc) {
      // Just render the new pages without clearing first
      renderAllPages();
    }
    
    // Only clean up on unmount, not on PDF changes
    return () => {
      // Only clear on component unmount
      if (!containerRef.current) {
        clearRenderedPages();
      }
    };
  }, [pdfDoc]);

  // Separate effect for canvas width changes
  useEffect(() => {
    if (pdfDoc && containerRef.current && pagesRendered.length > 0) {
      renderAllPages();
    }
  }, [canvasWidth]);

  return {
    pagesRendered,
    isRendering,
    containerRef,
    renderPage,
    renderAllPages,
    clearRenderedPages
  };
};