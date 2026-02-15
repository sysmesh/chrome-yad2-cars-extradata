// Force expose all Tesseract APIs to window
(function() {
  // First expose core WASM if available
  if (typeof TesseractCoreWASM !== 'undefined') {
    window.TesseractCoreWASM = TesseractCoreWASM;
    console.log('[Tesseract Export] Exposed TesseractCoreWASM');
  }
  
  // Then expose main Tesseract object completely
  if (typeof Tesseract !== 'undefined') {
    window.Tesseract = Tesseract;
    
    // Expose all methods and properties
    for (const key in Tesseract) {
      if (typeof Tesseract[key] === 'function') {
        window.Tesseract[key] = Tesseract[key].bind(Tesseract);
      } else {
        window.Tesseract[key] = Tesseract[key];
      }
    }
    
    console.log('[Tesseract Export] Fully exposed Tesseract with methods:', Object.keys(window.Tesseract));
  }
  
  // Final verification
  console.log('[Tesseract Export] Final window.Tesseract:', {
    exists: !!window.Tesseract,
    methods: window.Tesseract ? Object.keys(window.Tesseract) : []
  });
})();
