import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentLoadingTask } from "pdfjs-dist";
import EngineManager from "@/lib/EngineManager";
import { useAdaptiveDebounce } from './AdaptiveDebounce';

interface CompilationJob {
  id: number;
  latex: string;
  timestamp: number;
  isCancelled: boolean;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface CompilationResult {
  pdfBuffer: ArrayBuffer | null;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  numPages: number;
  error: string | null;
  isCompiling: boolean;
}

/**
 * Custom hook for handling LaTeX compilation with debouncing
 */
export const useLatexCompilation = (
  latex: string,
  dependencies: React.DependencyList = []
): CompilationResult => {
  // State for the compilation result
  const [result, setResult] = useState<CompilationResult>({
    pdfBuffer: null,
    pdfDoc: null,
    numPages: 0,
    error: null,
    isCompiling: false
  });

  // Job management refs
  const jobIdCounter = useRef<number>(0);
  const activeJobRef = useRef<CompilationJob | null>(null);
  const pendingJobRef = useRef<CompilationJob | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Get our adaptive debounce hook
  const { 
    updateCompilationTime, 
    startTypingMode
  } = useAdaptiveDebounce();

  // Process a compilation job
  const processCompilationJob = useCallback(async (job: CompilationJob): Promise<void> => {
    if (job.isCancelled) {
      // Don't process cancelled jobs
      return;
    }
    
    // Mark this job as active
    activeJobRef.current = job;
    
    let mounted = true;
    const compilationStartTime = Date.now();
    
    // Create cleanup function
    const cleanup = () => {
      mounted = false;
      if (activeJobRef.current?.id === job.id) {
        activeJobRef.current = null;
      }
    };
    
    cleanupRef.current = cleanup;
  
    try {
      // Reset error
      setResult(prev => ({ ...prev, error: null, isCompiling: true }));
  
      // Get the engine instance
      const engine = await EngineManager.getInstance();
      
      if (!mounted || job.isCancelled) {
        cleanup();
        job.reject(new Error('Job cancelled or component unmounted'));
        processNextJob();
        return;
      }
  
      // Prepare and compile the LaTeX
      engine.writeMemFSFile("main.tex", job.latex);
      engine.setEngineMainFile("main.tex");
  
      const engineResult = await engine.compileLaTeX();
      
      if (!mounted || job.isCancelled) {
        cleanup();
        job.reject(new Error('Job cancelled or component unmounted'));
        processNextJob();
        return;
      }
      
      if (engineResult.status !== 0) {
        console.error(engineResult.log);
        throw new Error(engineResult.log);
      }
      
      // Cache the PDF buffer
      const cachedBuffer = engineResult.pdf.buffer.slice(0);
      
      // Load the PDF
      const loadingTask: PDFDocumentLoadingTask = pdfjsLib.getDocument({ data: engineResult.pdf.buffer });
      
      loadingTask.promise.then(pdf => {
        if (!mounted || job.isCancelled) {
          cleanup();
          job.reject(new Error('Job cancelled or component unmounted'));
          processNextJob();
          return;
        }
        
        // Update state with the new PDF
        setResult({
          pdfBuffer: cachedBuffer,
          pdfDoc: pdf,
          numPages: pdf.numPages,
          error: null,
          isCompiling: false
        });
        
        // Calculate compilation time and update adaptive debounce
        const compilationTime = Date.now() - compilationStartTime;
        updateCompilationTime(compilationTime);
        
        // Resolve the job's promise
        job.resolve(pdf);
        
        // Clean up and process next job
        cleanup();
        processNextJob();
      }).catch(error => {
        if (!mounted || job.isCancelled) {
          cleanup();
          job.reject(new Error('Job cancelled or component unmounted'));
          processNextJob();
          return;
        }
        
        console.error('Error loading PDF:', error);
        setResult(prev => ({
          ...prev,
          error: `Error loading PDF: ${error.message}`,
          isCompiling: false
        }));
        
        // Reject the job's promise
        job.reject(error);
        
        // Clean up and process next job
        cleanup();
        processNextJob();
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : String(err);


      if (mounted && !job.isCancelled) {
        console.error("Failed to compile LaTeX:\n", err);
        setResult(prev => ({
          ...prev,
          error: `Failed to compile LaTeX:\n ${errorMessage}`,
          isCompiling: false
        }));
        
        // Reject the job's promise
        job.reject(err);
      }
      
      // Clean up and process next job
      cleanup();
      processNextJob();
    }
  }, [updateCompilationTime]);

  // Process the next job in the queue
  const processNextJob = useCallback((): void => {
    // If there's a pending job, process it
    if (pendingJobRef.current && !pendingJobRef.current.isCancelled) {
      const nextJob = pendingJobRef.current;
      pendingJobRef.current = null;
      processCompilationJob(nextJob);
    }
  }, [processCompilationJob]);

  // Effect to handle data changes and trigger compilation
  useEffect(() => {
    // Skip if latex is empty
    if (!latex) return;
    
    // Mark that we're in typing mode
    startTypingMode();
    
    // Update loading state
    setResult(prev => ({ ...prev, isCompiling: true }));
    
    // Enqueue compilation job with debounce
    const jobId = ++jobIdCounter.current;
    const now = Date.now();
    
    const newJob: CompilationJob = {
      id: jobId,
      latex,
      timestamp: now,
      isCancelled: false,
      resolve: () => {},
      reject: () => {}
    };
    
    // Create a promise that will be resolved when the job completes
    const compilationPromise = new Promise((resolve, reject) => {
      newJob.resolve = resolve;
      newJob.reject = reject;
    });
    
    // Cancel any pending job (not the active one)
    if (pendingJobRef.current) {
      pendingJobRef.current.isCancelled = true;
      pendingJobRef.current.reject(new Error('Cancelled by newer job'));
    }
    
    // Set the new job as pending
    pendingJobRef.current = newJob;
    
    // Debounce the actual compilation (300ms default)
    setTimeout(() => {
      // Only process if this job is still the pending one (wasn't cancelled)
      if (pendingJobRef.current?.id === jobId && !pendingJobRef.current.isCancelled) {
        // If no active job, process immediately
        if (!activeJobRef.current) {
          processCompilationJob(pendingJobRef.current);
          pendingJobRef.current = null;
        }
        // Otherwise it will be processed when the active job completes
      }
    }, 300);
    
    // Return promise so calling code can await if needed
    compilationPromise.catch((err) => {
      if (err.message !== 'Cancelled by newer job') {
        console.error('Compilation failed:', err);
      }
    });
    
    // Cleanup function
    return () => {
      // Cancel the pending job if component unmounts
      if (pendingJobRef.current) {
        pendingJobRef.current.isCancelled = true;
        pendingJobRef.current.reject(new Error('Component unmounted'));
      }
      
      // Cancel any in-progress compilation
      cleanupRef.current?.();
    };
  }, [latex, ...dependencies, processCompilationJob, startTypingMode]);

  return result;
};