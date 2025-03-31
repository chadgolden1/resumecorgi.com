import { useEffect, useState, useRef, useMemo } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import EngineManager from "../lib/EngineManager";
import Skeleton from "../components/Skeleton";
import Toolbar from "../components/Toolbar";
import { FormData, Section } from "../types";
import { TemplateFactory } from "@/lib/LaTeX/TemplateFactory";
import { useResume } from '@/lib/ResumeContext';

interface CompilationQueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface PreviewState {
  formData: FormData | null;
  selectedSections: Section[] | null;
  compiling: boolean;
}

function Preview() {
  const { formData, sections, selectedTemplate } = useResume();
  const scale = 1;
  const debounceShortMs = 50;
  const debounceLongMs = 600;
  const debounceInactivityIntervalMs = 1000;
  const maxWidth = 800;

  const compilationQueue = useRef<CompilationQueueItem[]>([]);
  const isProcessing = useRef<boolean>(false);

  const prevTemplateRef = useRef<string | null>(null);
  const prevFormDataRef = useRef<FormData | null>(null);
  const prevSelectedSectionsRef = useRef<Section[] | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const lastEditTimeRef = useRef<number>(0);
  const inactivityTimerRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localPreviewState, setLocalPreviewState] = useState<PreviewState>({
    formData: null,
    selectedSections: null,
    compiling: false
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfDoc, setPdfDoc] = useState<unknown>(null);
  const [pageRendered, setPageRendered] = useState<boolean>(false);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [pageNumPending, setPageNumPending] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [canvasWidthPx, setCanvasWidthPx] = useState<number>(maxWidth);

  // Use memoized LaTeX to avoid recreating it on every render
  const compiledLaTeX = useMemo(() => {
    let laTeX = TemplateFactory.createTemplate(selectedTemplate.id, formData, sections).generateLaTeX();
    return laTeX;
  }, [formData, sections, selectedTemplate]);

  useEffect(() => {
    const pdfViewerArea = document.getElementById('pdf-viewer-area');

    const updateCanvasWidth = () => {
      if (pdfViewerArea) {
        const viewerWidth = pdfViewerArea.clientWidth || document.body.clientWidth;
        setCanvasWidthPx(Math.min(viewerWidth, maxWidth));
      }
    };

    // Initial sizing
    updateCanvasWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasWidth();
    });

    if (pdfViewerArea) {
      resizeObserver.observe(pdfViewerArea);
      resizeObserver.observe(document.body);
    }

    // Use JSON.stringify for deep comparison
    const currentFormDataString = JSON.stringify(formData);
    const prevFormDataString = JSON.stringify(prevFormDataRef.current);
  
    const currentSelectedSectionsString = JSON.stringify(sections);
    const prevSelectedSectionsString = JSON.stringify(prevSelectedSectionsRef.current);
  
    // Skip if data hasn't changed
    if (
      pageRendered && currentFormDataString === prevFormDataString &&
      currentSelectedSectionsString === prevSelectedSectionsString &&
      prevTemplateRef.current === selectedTemplate.id
    ) {
      console.log('No changes detected. Skipping compilation');
      return;
    }
    
    // Store current values for next comparison
    prevFormDataRef.current = JSON.parse(currentFormDataString);
    prevSelectedSectionsRef.current = JSON.parse(currentSelectedSectionsString);
    prevTemplateRef.current = selectedTemplate.id;

    setLocalPreviewState({
      formData,
      selectedSections: sections,
      compiling: true
    });
    
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  
    // Clear any pending inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Determine if this is a "sparse" edit (long time since last edit)
    const now = Date.now();
    const timeSinceLastEdit = now - (lastEditTimeRef.current || 0);
    const isSparseEdit = timeSinceLastEdit > debounceInactivityIntervalMs;
    
    // Fast response for sparse edits, regular debounce for active typing
    const debounceTime = isSparseEdit ? debounceShortMs : debounceLongMs;
    
    // Update last edit timestamp
    lastEditTimeRef.current = now;
    
    // Set debounce timer
    debounceTimerRef.current = window.setTimeout(() => {
      compileLaTeX()
        .then(() => {
          setLocalPreviewState(prev => ({ ...prev, compiling: false }));
          
          // Start inactivity timer
          inactivityTimerRef.current = window.setTimeout(() => {
            // This will make the next edit considered "sparse"
            lastEditTimeRef.current = 0;
          }, 2000);
        })
        .catch((err: Error) => {
          console.error('Compilation failed:', err);
          setLocalPreviewState(prev => ({ ...prev, compiling: false }));
        });
    }, debounceTime);
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      if (pdfViewerArea) {
        resizeObserver.unobserve(document.body);
        resizeObserver.unobserve(pdfViewerArea);
      }
      resizeObserver.disconnect();

      // Cancel any in-progress compilation
      cleanupRef.current?.();
    };
  }, [formData, sections, compiledLaTeX, pageRendered, canvasWidthPx, selectedTemplate.id]);

  const compileLaTeX = async (): Promise<unknown> => {
    // Queue the compilation request and wait for it to process
    return new Promise((resolve, reject) => {
      compilationQueue.current.push({ resolve, reject });
      processQueue();
    });
  };

  const processQueue = async (): Promise<void> => {
    // If already processing or queue is empty, do nothing
    if (isProcessing.current || compilationQueue.current.length === 0) return;
    
    // Set processing flag to prevent concurrent executions
    isProcessing.current = true;
    
    // Get the next item from the queue
    const { resolve, reject } = compilationQueue.current.shift()!;
    
    let mounted = true;
    const cleanup = () => {
      mounted = false;
    };
    cleanupRef.current = cleanup;
  
    try {
      // Keep the previous PDF visible during loading
      setIsLoading(true);
      setError(null);
  
      // Get the engine instance
      const engine = await EngineManager.getInstance();
      
      if (!mounted) {
        isProcessing.current = false;
        processQueue(); // Process next in queue
        return;
      }
  
      // Prepare and compile the LaTeX
      engine.writeMemFSFile("main.tex", compiledLaTeX);
      engine.setEngineMainFile("main.tex");
  
      let result = await engine.compileLaTeX();
      
      if (!mounted) {
        isProcessing.current = false;
        processQueue(); // Process next in queue
        return;
      }

      if (result.status !== 0) {
        console.error(result.log);
      }
      
      // Load the PDF
      const cachedBuffer = result.pdf.buffer.slice(0);
      const loadingTask = pdfjsLib.getDocument({ data: result.pdf.buffer });
      loadingTask.promise.then(pdf => {
        if (!mounted) {
          isProcessing.current = false;
          processQueue(); // Process next in queue
          return;
        }
        
        setPdfBuffer(cachedBuffer);
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        renderPage(pdf, 1);
        setIsLoading(false);
        
        resolve(pdf); // Resolve the promise with the result
        
        // Set processing to false and process the next item in the queue
        isProcessing.current = false;
        processQueue();
      }).catch(error => {
        if (!mounted) {
          isProcessing.current = false;
          processQueue(); // Process next in queue
          return;
        }
        
        console.error('Error loading PDF:', error);
        setError(`Error loading PDF: ${error.message}`);
        setIsLoading(false);
        
        reject(error); // Reject the promise with the error
        
        // Set processing to false and process the next item in the queue
        isProcessing.current = false;
        processQueue();
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (mounted) {
        console.error("Failed to compile LaTeX:", err);
        setError(`Failed to compile LaTeX: ${err?.message}`);
        setIsLoading(false);
      }
      
      reject(err); // Reject the promise with the error
      
      // Set processing to false and process the next item in the queue
      isProcessing.current = false;
      processQueue();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = (pdf: any, pageNum: number): void => {
    if (pageRendering) {
      setPageNumPending(pageNum);
      return;
    }
  
    setPageRendering(true);
    
    // Using promise to fetch the page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.getPage(pageNum).then((page: any) => {
      // Use the hidden active canvas for rendering
      const canvas = activeCanvasRef.current;
  
      if (!canvas) {
        setPageRendering(false);
        return;
      }
  
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setPageRendering(false);
        return;
      }
      
      ctx.imageSmoothingQuality = 'high';
      ctx.imageSmoothingEnabled = false;
      
      const resolution = 2.5;
      const viewport = page.getViewport({ scale });
      canvas.height = resolution * viewport.height;
      canvas.width = resolution * viewport.width;
      
      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: [resolution, 0, 0, resolution, 0, 0]
      };
  
      const renderTask = page.render(renderContext);
      
      // Wait for rendering to finish
      renderTask.promise.then(() => {
        // When render is complete, swap the canvas contents to the display canvas
        const displayCanvas = displayCanvasRef.current;
        if (displayCanvas) {
          // Match the dimensions
          displayCanvas.width = canvas.width;
          displayCanvas.height = canvas.height;
          displayCanvas.style.width = "100%";
          displayCanvas.style.maxWidth = `${canvasWidthPx}px`;
          
          // Copy content from active canvas to display canvas
          const displayCtx = displayCanvas.getContext('2d');
          if (displayCtx) {
            displayCtx.drawImage(canvas, 0, 0);
          }
        }
        
        setPageRendered(true);
        setPageRendering(false);
        
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pdfDoc, pageNumPending);
          setPageNumPending(null);
        }
      }).catch((error: Error) => {
        console.error('Error rendering page:', error);
        setPageRendering(false);
      });
    }).catch((error: Error) => {
      console.error('Error getting page:', error);
      setPageRendering(false);
    });
  
    setCurrentPage(pageNum);
  };

  const previousPage = (): void => {
    if (currentPage <= 1 || !pdfDoc) return;
    renderPage(pdfDoc, currentPage - 1);
  };

  const nextPage = (): void => {
    if (currentPage >= numPages || !pdfDoc) return;
    renderPage(pdfDoc, currentPage + 1);
  };

  const downloadPdf = (): void => {
    if (!pdfBuffer) return;
    
    // Use the cached PDF buffer that's already in sync with what's displayed...
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadLaTeX = (): void => {
    const blob = new Blob([compiledLaTeX], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = "resume.tex";
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2 className="text-lg sr-only">PDF Preview</h2>
  
      <div className="sticky top-0 w-full z-48">
        <Toolbar 
          error={error} 
          isLoading={isLoading} 
          pageRendered={pageRendered} 
          currentPage={currentPage}
          totalPages={numPages}
          onPrevious={previousPage}
          onNext={nextPage}
          onDownloadPdf={downloadPdf}
          onDownloadLaTeX={downloadLaTeX}
        />
      </div>

      <div id="pdf-viewer-area" className="pdf-viewer flex justify-center items-center w-full mt-3">
        <div ref={canvasContainerRef} className="grow canvas-container relative px-4 lg:px-3 w-auto">

          {/* Display canvas - always visible */}
          {!error && (
            <>
              <canvas
                ref={displayCanvasRef}
                style={{ width: canvasWidthPx + "px" }}
                className={`mx-auto bg-white shadow-md dark:shadow-lg shadow-gray-800 dark:shadow-zinc-700 ${!pageRendered ? 'hidden' : ''}`}
              ></canvas>
            </>
          )}
          
          {/* Active canvas - hidden, used for rendering */}
          <canvas 
            ref={activeCanvasRef}
            style={{ width: canvasWidthPx + "px" }}
            className="hidden"
          ></canvas>
          
          {/* Only show skeleton when no canvas has been rendered yet */}
          {(isLoading && !pageRendered) && <Skeleton width={"100%"} />}
        </div>
      </div>
    </>
  );
}

export default Preview;