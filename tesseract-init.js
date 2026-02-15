// Tesseract initialization function
function initializeTesseract() {
  const urls = {
    tesseract: document.currentScript.dataset.tesseractUrl,
    core: document.currentScript.dataset.coreUrl,
    worker: document.currentScript.dataset.workerUrl
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  // Load worker script first
  loadScript(urls.worker).then(() => {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Worker not loaded');
    }
    
    // Then load main Tesseract script
    return loadScript(urls.tesseract).then(() => {
      if (!Tesseract.setWorkerPath || !Tesseract.recognize) {
        throw new Error('Tesseract methods not loaded');
      }
      
      // Finally load WASM core
      return loadScript(urls.core);
    });
  }).then(() => {
    window.Tesseract = Tesseract;
    Tesseract.setWorkerPath(urls.worker);
    
    return Tesseract.recognize(new Blob(), 'eng', {
      corePath: urls.core
    });
  }).then(() => {
    document.dispatchEvent(new CustomEvent('TesseractReady'));
  }).catch(err => {
    document.dispatchEvent(new CustomEvent('TesseractError', {detail: err}));
  });
}

// Start initialization
initializeTesseract();
