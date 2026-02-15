class Yad2Extension {
  constructor() {
  }

  async validateUrl(tabId) {
    if (!tabId) {
      return false;
    }
    
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab || !tab.url) {
        return false;
      }
      
      return tab.url.includes('yad2.co.il/vehicles/item/');
    } catch (error) {
      return false;
    }
  }

  async extractImages(tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: {tabId},
        function: () => {
          // Target only the main vehicle gallery images
          const gallery = document.querySelector('section.top-gallery_topGalleryBox__AoZUe');
          if (!gallery) return [];

          // Try multiple selectors for images
          const imageSelectors = [
            'img.cover-image_container__xfETO',
            'img.vehicle-image',
            'img[data-testid="vehicle-image"]',
            '.item-photo img',
            '.gallery img'
          ];

          let imageElements = [];

          // Try each selector
          for (const selector of imageSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              imageElements = Array.from(elements);
              break;
            }
          }

          // If no images found with selectors, try to find any image with the specific URL pattern
          if (imageElements.length === 0) {
            const allImages = document.querySelectorAll('img');
            imageElements = Array.from(allImages).filter(img =>
              img.src && img.src.includes('https://img.yad2.co.il/Pic/')
            );
          }

          return imageElements
            .filter(img => img.src.includes('https://img.yad2.co.il/Pic/'))
            .map(img => img.src);
        }
      });
      return results[0].result || [];
    } catch (error) {
      console.error('Error extracting images:', error);
      return [];
    }
  }

  async fetchVehicleData(plateNumber, tabId) {
    try {
      // Step 1: Get resource IDs from dataset page
      const resourceIds = await this.getResourceIds();

      // Step 2: Try each resource ID until we find data
      const cleanPlateNumber = plateNumber.replace(/-/g, '');
      for (const resourceId of resourceIds) {
        try {
          const vehicleData = await this.queryVehicleApi(resourceId, cleanPlateNumber);
          if (vehicleData) {
            return vehicleData;
          }
        } catch (error) {
          console.error(`Error with resource ${resourceId}:`, error);
          continue;
        }
      }

      throw new Error('No vehicle data found in any resource');
    } catch (error) {
      console.error('Error in fetchVehicleData:', error);
      throw error;
    }
  }

  async getResourceIds() {
    try {
      const response = await fetch('https://data.gov.il/he/datasets/ministry_of_transport/private-and-commercial-vehicles');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();

      // Try broader patterns
      const patterns = [
        /private-and-commercial-vehicles\/([a-f0-9-]{36})/g,
        /datasets\/ministry_of_transport\/private-and-commercial-vehicles\/([a-f0-9-]{36})/g,
        /"resource_id":\s*"([a-f0-9-]{36})"/g,
        /"id":\s*"([a-f0-9-]{36})"/g,
        /resource_id[=:]\s*["']?([a-f0-9-]{36})["']?/g
      ];

      const resourceIds = new Set();

      patterns.forEach((pattern) => {
        const matches = html.match(pattern);

        if (matches) {
          matches.forEach(match => {
            // Extract UUID from the match
            const uuidMatch = match.match(/([a-f0-9-]{36})/);
            if (uuidMatch) {
              resourceIds.add(uuidMatch[1]);
            }
          });
        }
      });

      const ids = Array.from(resourceIds);

      if (ids.length === 0) {
        // Fallback: try to find any UUID in the HTML
        const allUuids = html.match(/[a-f0-9-]{36}/g);

        if (allUuids && allUuids.length > 0) {
          return allUuids.slice(0, 5); // Return first 5 UUIDs as fallback
        }

        // Last resort: try some known resource IDs (with better security)
        const knownIds = [
          '053cea08-09bc-40ec-8f7a-156f0677aff3',
          '9ad396b9-9f1a-4c12-9c1d-3c3f8b5d9e8f'
        ];
        return knownIds;
      }

      return ids;
    } catch (error) {
      console.error('Error getting resource IDs:', error);
      // Return fallback IDs if we can't fetch from the API
      return [
        '053cea08-09bc-40ec-8f7a-156f0677aff3',
        '9ad396b9-9f1a-4c12-9c1d-3c3f8b5d9e8f'
      ];
    }
  }

  async queryVehicleApi(resourceId, plateNumber) {
    try {
      const url = `https://data.gov.il/api/action/datastore_search?resource_id=${resourceId}&filters={"mispar_rechev":"${plateNumber}"}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`HTTP ${response.status} for resource ${resourceId}`);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.result.records && data.result.records.length > 0) {
        const record = data.result.records[0];

        // Translate and format the response
        const translatedData = {
          "בעלות": record.baalut || 'לא ידוע',
          "ארץ ייצור": record.tozeret_nm || 'לא ידוע',
          "קוד דגם": record.degem_nm || 'לא ידוע',
          "רמת גימור": record.ramat_gimur || 'לא ידוע',
          "רמת אבזור בטיחותי": record.ramat_eivzur_betihuty || 'לא ידוע',
          "קבוצת זיהום": record.kvutzat_zihum || 'לא ידוע',
          "שנת ייצור": record.shnat_yitzur || 'לא ידוע',
          "דגם מנוע": record.degem_manoa || 'לא ידוע',
          "מועד עלייה לכביש": record.moed_aliya_lakvish || 'לא ידוע',
          "מבחן רישוי אחרון": record.mivchan_acharon_dt || 'לא ידוע',
          "תוקף רישוי שנתי": record.tokef_dt || 'לא ידוע',
          "צבע רכב": record.tzeva_rechev || 'לא ידוע',
          "צמיג קדמי": record.zmig_kidmi || 'לא ידוע',
          "צמיג אחורי": record.zmig_ahori || 'לא ידוע',
          "סוג דלק": record.sug_delek_nm || 'לא ידוע'
        };

        return JSON.stringify(translatedData, null, 2);
      }

      return null;
    } catch (error) {
      console.error('Error querying vehicle API:', error);
      throw error;
    }
  }


}

const extension = new Yad2Extension();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      console.log('[BG] action received:', request.action, 'tabId:', request.tabId);
      switch (request.action) {
        case 'validateCurrentUrl':
          const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
          if (!tab?.id) throw new Error('No active tab found');
          sendResponse({
            isValid: tab.url.includes('yad2.co.il/vehicles/item/')
          });
          break;
          
        case 'extractInfo':
          try {
            console.log('[BG] extractInfo start');
            const imageUrls = await extension.extractImages(request.tabId);
            console.log('[BG] extractInfo images found:', imageUrls.length, imageUrls);
            if (imageUrls.length === 0) {
              sendResponse({
                imageCount: 0,
                mostFrequentPlate: 'NONE',
                error: 'No images found'
              });
              break;
            }

            const ocrResponse = await chrome.tabs.sendMessage(request.tabId, {
              action: 'runOcrOnImages',
              imageUrls
            });

            if (ocrResponse?.error) {
              throw new Error(ocrResponse.error);
            }

            const results = ocrResponse?.results || [];

            console.log('[BG] OCR results:', results);
            console.log('[BG] OCR results detailed:', JSON.stringify(results, null, 2));
            
            const plateCounts = {};
            results.forEach(result => {
              console.log('[BG] Processing result:', result);
              if (result.plateNumber !== 'NONE') {
                plateCounts[result.plateNumber] = (plateCounts[result.plateNumber] || 0) + 1;
                console.log('[BG] Found plate:', result.plateNumber, 'Count:', plateCounts[result.plateNumber]);
              }
            });

            console.log('[BG] Final plate counts:', plateCounts);
            
            const mostFrequentPlate = Object.keys(plateCounts).length > 0 ?
              Object.keys(plateCounts).reduce((a, b) => plateCounts[a] > plateCounts[b] ? a : b) : 'NONE';
            
            console.log('[BG] Most frequent plate:', mostFrequentPlate);

            sendResponse({
              imageCount: imageUrls.length,
              mostFrequentPlate,
              error: null
            });
          } catch (error) {
            sendResponse({
              imageCount: 0,
              mostFrequentPlate: 'NONE',
              error: error.message
            });
          }
          break;
          
        case 'fetchVehicleData':
          try {
            const html = await extension.fetchVehicleData(request.plateNumber, sender.tab.id);
            sendResponse({
              data: html,
              error: null
            });
          } catch (error) {
            sendResponse({
              data: null,
              error: error.message
            });
          }
          break;
          
        default:
          throw new Error('Unknown action');
      }
    } catch (error) {
      sendResponse({error: error.message});
    }
  };
  
  handleAsync();
  return true;
});
