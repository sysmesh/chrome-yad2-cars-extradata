const MAX_RETRIES = 3;

// Function to extract car data from a Yad2 ad page
function extractCarData() {
  const carData = {};

  // Extract title - try multiple selectors
  let titleElement = document.querySelector('.item-title') ||
                     document.querySelector('.title') ||
                     document.querySelector('h1');
  if (titleElement) {
    carData.title = titleElement.textContent.trim();
  }

  // Extract price - try multiple selectors
  let priceElement = document.querySelector('.item-price') ||
                     document.querySelector('.price') ||
                     document.querySelector('[data-testid="price"]');
  if (priceElement) {
    carData.price = priceElement.textContent.trim();
  }

  // Extract year - try multiple selectors
  let yearElement = document.querySelector('.item-year') ||
                    document.querySelector('.year') ||
                    document.querySelector('[data-testid="year"]');
  if (yearElement) {
    carData.year = yearElement.textContent.trim();
  }

  // Extract mileage - try multiple selectors
  let mileageElement = document.querySelector('.item-mileage') ||
                       document.querySelector('.mileage') ||
                       document.querySelector('[data-testid="mileage"]');
  if (mileageElement) {
    carData.mileage = mileageElement.textContent.trim();
  }

  // Extract engine capacity - try multiple selectors
  let engineElement = document.querySelector('.item-engine') ||
                      document.querySelector('.engine') ||
                      document.querySelector('[data-testid="engine"]');
  if (engineElement) {
    carData.engine = engineElement.textContent.trim();
  }

  // Extract gearbox - try multiple selectors
  let gearboxElement = document.querySelector('.item-gearbox') ||
                       document.querySelector('.gearbox') ||
                       document.querySelector('[data-testid="gearbox"]');
  if (gearboxElement) {
    carData.gearbox = gearboxElement.textContent.trim();
  }

  // Extract fuel type - try multiple selectors
  let fuelElement = document.querySelector('.item-fuel') ||
                    document.querySelector('.fuel') ||
                    document.querySelector('[data-testid="fuel"]');
  if (fuelElement) {
    carData.fuel = fuelElement.textContent.trim();
  }

  // Extract color - try multiple selectors
  let colorElement = document.querySelector('.item-color') ||
                     document.querySelector('.color') ||
                     document.querySelector('[data-testid="color"]');
  if (colorElement) {
    carData.color = colorElement.textContent.trim();
  }

  // Extract VIN - try multiple selectors
  let vinElement = document.querySelector('.item-vin') ||
                   document.querySelector('.vin') ||
                   document.querySelector('[data-testid="vin"]');
  if (vinElement) {
    carData.vin = vinElement.textContent.trim();
  }

  // Extract description - try multiple selectors
  let descriptionElement = document.querySelector('.item-description') ||
                           document.querySelector('.description') ||
                           document.querySelector('[data-testid="description"]');
  if (descriptionElement) {
    carData.description = descriptionElement.textContent.trim();
  }

  // Extract seller info - try multiple selectors
  let sellerElement = document.querySelector('.item-seller') ||
                      document.querySelector('.seller') ||
                      document.querySelector('[data-testid="seller"]');
  if (sellerElement) {
    carData.seller = sellerElement.textContent.trim();
  }

  // Extract phone number - try multiple selectors
  let phoneElement = document.querySelector('.item-phone') ||
                     document.querySelector('.phone') ||
                     document.querySelector('[data-testid="phone"]');
  if (phoneElement) {
    carData.phone = phoneElement.textContent.trim();
  }

  // Extract location - try multiple selectors
  let locationElement = document.querySelector('.item-location') ||
                        document.querySelector('.location') ||
                        document.querySelector('[data-testid="location"]');
  if (locationElement) {
    carData.location = locationElement.textContent.trim();
  }

  // Extract photos - try multiple selectors
  let photoElements = document.querySelectorAll('.item-photo, .photo, [data-testid="photo"]');
  if (photoElements.length > 0) {
    carData.photos = Array.from(photoElements).map(photo => photo.src);
  }

  return carData;
}

// Function to send data to background script
function sendDataToBackground(data) {
  chrome.runtime.sendMessage({
    action: 'saveCarData',
    data: data
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending data to background:', chrome.runtime.lastError);
    } else if (response && response.success) {
      console.log('Data saved successfully');
    }
  });
}

// Function to run OCR on images
async function runOcrOnImages(imageUrls) {
  try {
    const results = [];

    // Initialize Tesseract if not already initialized
    if (typeof Tesseract === 'undefined') {
      console.error('Tesseract not initialized');
      return { error: 'Tesseract not initialized' };
    }

    for (const url of imageUrls) {
      try {
        // Fetch image
        const response = await fetch(url);
        const blob = await response.blob();

        // Run OCR with optimized settings for license plates
        const result = await Tesseract.recognize(
          blob,
          'eng',
          {
            logger: (m) => console.log(m),
            tessedit_char_whitelist: '0123456789', // Only digits for license plates
            tessedit_ocr_engine_mode: 1,
            preserve_interword_spaces: '0',
            page_separator: '',
            tesseract_script: 'eng',
            // Additional settings for better plate recognition
            tessedit_pageseg_mode: 7, // Treat as a single line
            tessedit_char_whitelist: '0123456789',
            // For yellow on black plates, we can try different configurations
            // but since we know it's black on yellow, we'll focus on digits
          }
        );

        // Extract plate number with better pattern matching for license plates
        let plateNumber = 'NONE';
        if (result.data && result.data.text) {
          // Clean the text and extract only digits
          let cleanText = result.data.text.replace(/[^0-9]/g, '');

          // License plates are typically 7 digits (e.g., 1234567) or 6 digits
          // But can also be 5-8 digits depending on format
          if (cleanText.length >= 5 && cleanText.length <= 8) {
            plateNumber = cleanText;
          } else if (cleanText.length > 8) {
            // If longer than 8 digits, take the first 8 digits
            plateNumber = cleanText.substring(0, 8);
          }
        }

        results.push({
          imageUrl: url,
          plateNumber: plateNumber,
          confidence: result.data?.confidence || 0
        });
      } catch (error) {
        console.error('OCR error for image:', url, error);
        results.push({
          imageUrl: url,
          plateNumber: 'NONE',
          error: error.message
        });
      }
    }

    return { results };
  } catch (error) {
    console.error('Error in runOcrOnImages:', error);
    return { error: error.message };
  }
}

// Function to check if we're on a Yad2 car ad page
function isYad2CarAdPage() {
  return window.location.hostname.includes('yad2') && 
         window.location.href.includes('yad2.co.il/vehicles/item/');
}

// Function to wait for element to be present
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - start > timeout) {
        reject(new Error(`Element ${selector} not found after ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// Function to wait for page to load
async function waitForPageLoad() {
  try {
    // Wait for main content to load
    await waitForElement('.item-container', 15000);
    
    // Wait for title to be present
    await waitForElement('.item-title', 10000);
    
    console.log('Page loaded, extracting data...');
    return true;
  } catch (error) {
    console.error('Error waiting for page load:', error);
    return false;
  }
}

// Function to extract data with retries
async function extractDataWithRetries() {
  let retries = 0;
  let lastError = null;
  
  while (retries < MAX_RETRIES) {
    try {
      if (!(await waitForPageLoad())) {
        throw new Error('Page did not load properly');
      }
      
      const carData = extractCarData();
      
      // Validate that we got some data
      if (Object.keys(carData).length === 0) {
        throw new Error('No car data extracted');
      }
      
      return carData;
    } catch (error) {
      lastError = error;
      retries++;
      console.error(`Attempt ${retries} failed:`, error.message);
      
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        location.reload();
      }
    }
  }
  
  throw lastError;
}

// Main function to run when content script is loaded
async function main() {
  try {
    // Check if we're on a Yad2 car ad page
    if (!isYad2CarAdPage()) {
      console.log('Not on a Yad2 car ad page');
      return;
    }
    
    console.log('Yad2 Car Data extension loaded');
    
    // Extract car data with retries
    const carData = await extractDataWithRetries();
    
    // Send data to background script
    sendDataToBackground(carData);
    
    console.log('Car data extracted and sent to background:', carData);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run main function when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Also listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    extractDataWithRetries()
      .then(carData => {
        sendResponse({success: true, data: carData});
      })
      .catch(error => {
        sendResponse({success: false, error: error.message});
      });
    return true; // Required for async response
  }

  if (request.action === 'extractAndExportData') {
    extractDataWithRetries()
      .then(carData => {
        // Send data to background for processing
        sendDataToBackground(carData);
        sendResponse({success: true, data: carData});
      })
      .catch(error => {
        sendResponse({success: false, error: error.message});
      });
    return true; // Required for async response
  }

  if (request.action === 'runOcrOnImages') {
    runOcrOnImages(request.imageUrls)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({error: error.message});
      });
    return true; // Required for async response
  }
});