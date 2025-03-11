import { useEffect, useState, useRef, useMemo } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import EngineManager from "../components/EngineManager";
import Skeleton from "../components/Skeleton";

function Preview({ formData, selectedSections }) {
  const compilationQueue = useRef([]);
  const isProcessing = useRef(false);

  const prevFormDataRef = useRef(null);
  const prevSelectedSectionsRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const cleanupRef = useRef(null);
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const prevCanvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendered, setPageRendered] = useState(false);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const scale = 1;

  // Use memoized LaTeX to avoid recreating it on every render
  const compiledLaTeX = useMemo(() => {
    let laTeX = createLaTeXFromFormData(formData, selectedSections);
    return laTeX;
  }, [formData, selectedSections]);

  useEffect(() => {
    // Use JSON.stringify for deep comparison
    const currentFormDataString = JSON.stringify(formData);
    const prevFormDataString = JSON.stringify(prevFormDataRef.current);
  
    const currentSelectedSectionsString = JSON.stringify(selectedSections);
    const prevSelectedSectionsString = JSON.stringify(prevSelectedSectionsRef.current);
  
    // Skip if data hasn't changed
    if (pageRendered && currentFormDataString === prevFormDataString && currentSelectedSectionsString === prevSelectedSectionsString) {
      console.log('No changes detected. Skipping compilation');
      return;
    }
    
    // Store current values for next comparison
    prevFormDataRef.current = JSON.parse(currentFormDataString);
    prevSelectedSectionsRef.current = JSON.parse(currentSelectedSectionsString);
    
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set debounce timer
    debounceTimerRef.current = setTimeout(() => {
      compileLaTeX()
        .then(() => console.log('Compilation completed successfully'))
        .catch(err => console.error('Compilation failed:', err));
    }, 600);
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Cancel any in-progress compilation
      cleanupRef.current?.();
    };
  }, [formData, selectedSections, compiledLaTeX]);

  const compileLaTeX = async () => {
    // Queue the compilation request and wait for it to process
    return new Promise((resolve, reject) => {
      compilationQueue.current.push({ resolve, reject });
      processQueue();
    });
  };

  const processQueue = async () => {
    // If already processing or queue is empty, do nothing
    if (isProcessing.current || compilationQueue.current.length === 0) return;
    
    // Set processing flag to prevent concurrent executions
    isProcessing.current = true;
    
    // Get the next item from the queue
    const { resolve, reject } = compilationQueue.current.shift();
    
    let mounted = true;
    const cleanup = () => {
      mounted = false;
    };
    cleanupRef.current = cleanup;
  
    try {
      setIsLoading(true);
      setError(null);
  
      // Get the engine instance
      const engine = await EngineManager.getInstance();
      
      if (!mounted) {
        isProcessing.current = false;
        processQueue(); // Process next in queue
        return cleanup;
      }
  
      // Prepare and compile the LaTeX
      engine.writeMemFSFile("main.tex", compiledLaTeX);
      engine.setEngineMainFile("main.tex");
  
      let result = await engine.compileLaTeX();
      
      if (!mounted) {
        isProcessing.current = false;
        processQueue(); // Process next in queue
        return cleanup;
      }
      
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument({ data: result.pdf.buffer });
      loadingTask.promise.then(pdf => {
        if (!mounted) {
          isProcessing.current = false;
          processQueue(); // Process next in queue
          return;
        }
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        renderPage(pdf, 1);
        setPageRendered(true);
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
    } catch (err) {
      if (mounted) {
        console.error("Failed to compile LaTeX:", err);
        setError(`Failed to compile LaTeX: ${err.message}`);
        setIsLoading(false);
      }
      
      reject(err); // Reject the promise with the error
      
      // Set processing to false and process the next item in the queue
      isProcessing.current = false;
      processQueue();
    }
    
    return cleanup;
  };

  const renderPage = (pdf, pageNum) => {
    if (pageRendering) {
      setPageNumPending(pageNum);
      return;
    }

    setPageRendering(true);
    
    // Using promise to fetch the page
    pdf.getPage(pageNum).then(page => {
      const canvas = canvasRef.current;
      prevCanvasRef.current = canvas;

      if (!canvas) {
        setPageRendering(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.imageSmoothingEnabled = false;
      
      const resolution = 2.5;
      const viewport = page.getViewport({ scale });
      canvas.height = resolution * viewport.height;
      canvas.width = resolution * viewport.width;
      canvas.style.width = "100%";
      canvas.style.maxWidth = "800px";
      
      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        transform: [resolution, 0, 0, resolution, 0, 0]
      };

      const renderTask = page.render(renderContext);
      
      // Wait for rendering to finish
      renderTask.promise.then(() => {
        setPageRendering(false);
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pdfDoc, pageNumPending);
          setPageNumPending(null);
        }
      }).catch(error => {
        console.error('Error rendering page:', error);
        setPageRendering(false);
      });
    }).catch(error => {
      console.error('Error getting page:', error);
      setPageRendering(false);
    });

    setCurrentPage(pageNum);
  };

  const previousPage = () => {
    if (currentPage <= 1 || !pdfDoc) return;
    renderPage(pdfDoc, currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage >= numPages || !pdfDoc) return;
    renderPage(pdfDoc, currentPage + 1);
  };

  return (
    <>
      <h2 className="text-lg sr-only">PDF Preview</h2>

      {(isLoading || error) && <Skeleton />}

      {!isLoading && !error && (
        <div className="pdf-viewer flex justify-center items-center w-full">
          <div className="canvas-container">
            <canvas ref={canvasRef} className="shadow-md dark:shadow-lg shadow-gray-800 dark:shadow-zinc-700"></canvas>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to create LaTeX from formData
function createLaTeXFromFormData(formData, selectedSections) {
  // Format the name
  const name = formData.personalInfo.name || 'Your Name';
  
  // Format contacts (filtering out empty ones)
  const contacts = [
    formData.personalInfo.contact0,
    formData.personalInfo.contact1,
    formData.personalInfo.contact2
  ].filter(Boolean);
  
  // Format contact line
  const contactLine = contacts.length > 0 
    ? contacts.map(c => `\\href{${getHref(c)}}{${c}}`).join(' | ')
    : 'your.email@example.com';
  
  // Get summary
  const summary = formData.summary?.text || '';

  return `
\\documentclass[11pt]{article}
\\usepackage[letterpaper, top=0.5in, bottom=0.5in, left=0.5in, right=0.5in]{geometry}
\\usepackage{XCharter}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\raggedright
\\pagestyle{empty}

\\input{glyphtounicode}
\\pdfgentounicode=1

\\titleformat{\\section}{\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule\\vspace{-6.5pt}]
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\setlist[itemize]{itemsep=-2pt, leftmargin=12pt, topsep=7pt}

\\begin{document}

% name
\\centerline{\\Huge ${name}}

\\vspace{5pt}

% contact information
\\centerline{${contactLine}}

\\vspace{-10pt}

${formatSummary(formData.personalInfo.summary)}

${selectedSections.find(s => s.id === 'experience').selected ? formatExperience(formData.experience) : ''}

${selectedSections.find(s => s.id === 'education').selected ? formatEducation(formData.education) : ''}

\\end{document}
`;
}

// Helper function for links
function getHref(contact) {
  if (contact.includes('@')) return `mailto:${contact}`;
  if (contact.includes('linkedin')) return `https://www.${contact.replace(/^(https?:\/\/)?(www\.)?/, '')}`;
  if (contact.includes('http')) return contact;
  return `https://${contact}`;
}

function formatSummary(summary) {
  if (!summary || !summary.length) {
    return ``;
  }

  return `
\\section*{Summary}
{${summary}}
\\vspace{-10pt}`;
}

// Helper to format experience
function formatExperience(experience) {
  if (!experience || !experience.length) {
    return `% experience section
\\section*{Experience}
\\textbf{Position Title,} {Company Name} -- Location \\hfill Start -- End \\\\
\\vspace{-9pt}
\\begin{itemize}
  \\item Describe your responsibilities and achievements
  \\item Quantify your results when possible
\\end{itemize}`;
  }

  const sectionHeading = `\\section*{Experience}
`;

  return sectionHeading + experience.map(job => {
    const title = job.title || 'Position Title';
    const company = job.company || 'Company Name';
    const dateRange = `${job.start || 'Start'} -- ${job.end || 'End'}`;

    // // Extract bullet points as array of strings
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = job.accomplishments || '<ul><li>Describe your responsibilities and achievements, quantified if possible</li></ul>';
    const accomplishments = Array.from(tempDiv.querySelectorAll('li'))
      .map(li => li.textContent.trim())
      .filter(item => item && item.length > 0)
      .map(item => `  \\item ${item}`).join('\n');

    return `% experience section
\\textbf{${title},} {${company}} \\hfill ${dateRange} \\\\
\\vspace{-9pt}
\\begin{itemize}
${accomplishments}
\\end{itemize}
\\vspace{-4pt}`;
  }).join('\n\n');
}

// Helper to format education
function formatEducation(education) {
  if (!education || !education.length) {
    return `\\textbf{Degree,} Institution \\hfill Year`;
  }
  
  return education.map(edu => {
    const degree = edu.degree || 'Degree';
    const institution = edu.institution || 'Institution';
    const year = edu.year || 'Year';

    const sectionHeading = `% education section
% \\vspace{-15pt}
% \\section*{Education}`
    
    return sectionHeading + `\\textbf{${degree},} ${institution} \\hfill ${year}`;
  }).join('\n\n');
}

export default Preview;