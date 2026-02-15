// Function to show the popup UI
document.addEventListener('DOMContentLoaded', function() {
  const exportBtn = document.getElementById('exportBtn');
  const statusDiv = document.getElementById('status');
  const errorDiv = document.getElementById('error');
  const dataPreviewDiv = document.getElementById('dataPreview');
  const titleDiv = document.getElementById('title');

  // Set title based on language
  titleDiv.textContent = translations.get('popup', 'title');


  // Handle export button click
  exportBtn.addEventListener('click', function() {
    exportBtn.disabled = true;
    exportBtn.textContent = translations.get('popup', 'button');
    statusDiv.textContent = translations.get('popup', 'processing');
    statusDiv.style.display = 'block';
    statusDiv.className = 'status valid';
    errorDiv.style.display = 'none';
    dataPreviewDiv.style.display = 'none';

    // Send message to content script to extract and export data
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'extractAndExportData'}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          statusDiv.textContent = translations.get('popup', 'error_communication');
          statusDiv.className = 'status invalid';
          errorDiv.textContent = translations.get('popup', 'error_injection');
          errorDiv.style.display = 'block';
          exportBtn.disabled = false;
          exportBtn.textContent = translations.get('popup', 'button');
          return;
        }

        if (response && response.success) {
          statusDiv.textContent = translations.get('popup', 'valid_page');
          statusDiv.className = 'status valid';
          
          // Show data preview
          showDataPreview(response.data);
          
          exportBtn.disabled = false;
          exportBtn.textContent = translations.get('popup', 'button');
        } else {
          statusDiv.textContent = translations.get('popup', 'error_communication');
          statusDiv.className = 'status invalid';
          errorDiv.textContent = response ? response.message : translations.get('popup', 'error_injection');
          errorDiv.style.display = 'block';
          exportBtn.disabled = false;
          exportBtn.textContent = translations.get('popup', 'button');
        }
      });
    });
  });
});

// Function to download car data as JSON file
function downloadCarData(data) {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'yad2_car_data.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Function to show data preview
function showDataPreview(data) {
  const dataPreviewDiv = document.getElementById('dataPreview');
  dataPreviewDiv.innerHTML = '<h4>' + translations.get('popup', 'checking_page') + ':</h4>';
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      dataPreviewDiv.innerHTML += `<p><strong>${key}:</strong> ${Array.isArray(value) ? value.length + ' items' : 'Object'}</p>`;
    } else {
      dataPreviewDiv.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;
    }
  }
  
  dataPreviewDiv.style.display = 'block';
}

// Function to check if we're on a Yad2 car ad page
function isYad2CarAdPage() {
  return window.location.hostname.includes('yad2') && 
         window.location.href.includes('yad2.co.il/vehicles/item/');
}

// Check if we're on a Yad2 car ad page when popup opens
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  if (tabs[0] && tabs[0].url && !isYad2CarAdPage()) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = translations.get('popup', 'invalid_page');
    errorDiv.style.display = 'block';
    document.getElementById('exportBtn').style.display = 'none';
  }
});