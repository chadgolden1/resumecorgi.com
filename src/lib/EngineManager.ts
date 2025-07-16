import { PdfTeXEngine } from '../types';

const EngineManager = (() => {
  let instance: PdfTeXEngine | null = null;
  let isLoading = false;
  let engineReady = false;
  let loadPromise: Promise<PdfTeXEngine> | null = null;

  // Set up PDF.js worker once for the entire application
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
  }

  // Register service worker for caching
  const registerServiceWorker = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        console.log('Service worker registered:', registration.scope);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.type = "text/javascript";
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.body.appendChild(script);
    });
  };

  const initialize = async (): Promise<PdfTeXEngine> => {
    if (engineReady) return Promise.resolve(instance!);
    if (loadPromise) return loadPromise;

    isLoading = true;
    loadPromise = (async () => {
      try {
        // Register service worker for caching TexLive assets
        await registerServiceWorker();
        
        // Load the PdfTeXEngine script
        await loadScript("PdfTeXEngine.js");
        
        const pdfTeXEngine = new window.PdfTeXEngine();
        await pdfTeXEngine.loadEngine();
        pdfTeXEngine.setTexliveEndpoint("https://texlive.resumecorgi.com/");
        
        // TODO: Wait for the service worker to be activated?
        // if (navigator.serviceWorker.controller) {
        //   console.log('Service worker is active and controlling the page');
        // } else {
        //   console.log('Service worker is registered but not yet controlling the page');
        //   window.location.reload();
        // }
        
        instance = pdfTeXEngine;
        engineReady = true;
        isLoading = false;
        
        return instance;
      } catch (err) {
        isLoading = false;
        engineReady = false;
        loadPromise = null;
        console.error("Failed to initialize PdfTeXEngine:", err);
        throw err;
      }
    })();

    return loadPromise;
  };

  return {
    getInstance: initialize,
    isReady: () => engineReady,
    isLoading: () => isLoading
  };
})();

export default EngineManager;