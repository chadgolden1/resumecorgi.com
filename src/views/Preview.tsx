import { useState, useMemo, useEffect } from "react";
import Skeleton from "../components/Skeleton";
import Toolbar from "../components/Toolbar";
import { TemplateFactory } from "@/lib/LaTeX/TemplateFactory";
import { useResume } from '@/lib/ResumeContext';
import { useLatexCompilation } from "@/lib/hooks/LaTeXCompiler";
import { usePdfRenderer } from "../lib/hooks/PdfRenderer";

const MAX_WIDTH = 800;

function Preview() {
  const { formData, sections, selectedTemplate } = useResume();
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [canvasWidthPx, setCanvasWidthPx] = useState<number>(MAX_WIDTH);

  const compiledLaTeX = useMemo(() => {
    return TemplateFactory.createTemplate(
      selectedTemplate.id, 
      formData, 
      sections
    ).generateLaTeX();
  }, [formData, sections, selectedTemplate]);
  
  const { 
    pdfBuffer, 
    pdfDoc,
    error, 
    isCompiling 
  } = useLatexCompilation(compiledLaTeX, [formData, sections, selectedTemplate.id]);

  const {
    containerRef,
    pagesRendered,
    isRendering
  } = usePdfRenderer(pdfDoc, canvasWidthPx);

  // Handle window resize for responsive canvas
  useEffect(() => {
    const pdfViewerArea = document.getElementById('pdf-viewer-area');
    
    const updateCanvasWidth = () => {
      if (pdfViewerArea) {
        const viewerWidth = pdfViewerArea.clientWidth || document.body.clientWidth;
        const newWidth = Math.min(viewerWidth, MAX_WIDTH);
        
        if (newWidth !== canvasWidthPx) {
          setCanvasWidthPx(newWidth);
        }
      }
    };
  
    // need to setup initial sizing
    updateCanvasWidth();
  
    // need to set up resize handler
    window.addEventListener('resize', updateCanvasWidth);
    const resizeObserver = new ResizeObserver(updateCanvasWidth);
    
    if (pdfViewerArea) {
      resizeObserver.observe(pdfViewerArea);
    }
  
    return () => {
      window.removeEventListener('resize', updateCanvasWidth);
      if (pdfViewerArea) resizeObserver.unobserve(pdfViewerArea);
      resizeObserver.disconnect();
    };
  }, [canvasWidthPx]);

  // Preserve container height during recompilation to prevent layout shifts
  useEffect(() => {
    if (isCompiling && containerRef.current && containerRef.current.offsetHeight > 0) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
    
    // Clear fixed height once content is rendered
    if (!isCompiling && !isRendering && pagesRendered.length > 0) {
      setTimeout(() => {
        setContainerHeight(null);
      }, 100);
    }
  }, [isCompiling, isRendering, pagesRendered.length]);
  
  const downloadPdf = () => {
    if (!pdfBuffer) return;
    
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
  
  const downloadLaTeX = () => {
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
          isLoading={isCompiling} 
          pageRendered={pdfDoc !== null}
          onDownloadPdf={downloadPdf}
          onDownloadLaTeX={downloadLaTeX}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="relative error-message text-red-200 dark:text-red-300 p-4 max-w-[800px] mx-auto text-sm">
          <h3 className="text-lg font-bold mb-3">Compiler Error</h3>
          <pre>
            <p>{error}</p>
          </pre>
        </div>
      )}

      <div id="pdf-viewer-area" className="pdf-viewer flex justify-center items-center w-full mt-3"
        hidden={error !== null}>
        <div 
          ref={containerRef}
          className="grow canvas-container relative px-4 lg:px-3 w-auto"
          style={containerHeight ? { height: `${containerHeight}px`, minHeight: `${containerHeight}px` } : {}}
        >
          {/* Show skeleton while loading */}
          {!error && pdfDoc === null && (
            <Skeleton width={"100%"} />
          )}
          
          {/* PDF pages are rendered into the containerRef by the usePdfRenderer hook */}
        </div>
      </div>
    </>
  );
}

export default Preview;