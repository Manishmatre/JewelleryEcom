/**
 * ShilpoKotha Try-On Handler
 * This file provides a simplified interface for the virtual try-on feature
 */

// Import the openPreview function directly
import { openPreview as importedOpenPreview } from './virtual-preview.js';

/**
 * Open the virtual try-on preview for a product
 * @param {string} productId - The ID of the product to preview
 */
function openTryOn(productId) {
  console.log(`Try-on handler: Opening preview for product ID: ${productId}`);
  
  try {
    // First try to use the imported function
    if (typeof importedOpenPreview === 'function') {
      console.log('Using imported openPreview function');
      importedOpenPreview(productId);
      return;
    }
    
    // Fall back to the global function if the import didn't work
    if (typeof window.openPreview === 'function') {
      console.log('Using global openPreview function');
      window.openPreview(productId);
      return;
    }
    
    // If neither method works, try to dynamically import the function
    console.log('Attempting dynamic import of openPreview function');
    import('./virtual-preview.js')
      .then(module => {
        if (typeof module.openPreview === 'function') {
          module.openPreview(productId);
        } else {
          throw new Error('openPreview function not found in module');
        }
      })
      .catch(error => {
        console.error('Dynamic import failed:', error);
        showToast('Error opening virtual preview', 'error');
      });
  } catch (error) {
    console.error('Error opening virtual preview:', error);
    showToast('Error opening virtual preview', 'error');
  }
}

/**
 * Initialize all virtual try-on buttons on the page
 */
function initTryOnButtons() {
  console.log('Initializing all try-on buttons');
  
  // Get all try-on buttons
  const tryOnButtons = document.querySelectorAll('.virtual-try-on, button[aria-label="Virtual try-on"]');
  console.log(`Found ${tryOnButtons.length} try-on buttons`);
  
  tryOnButtons.forEach(button => {
    if (button.getAttribute('data-event-attached') !== 'true') {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = button.getAttribute('data-product-id');
        console.log(`Try-on button clicked for product: ${productId}`);
        
        openTryOn(productId);
      });
      
      button.setAttribute('data-event-attached', 'true');
    }
  });
}

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `bg-white rounded-lg shadow-lg p-4 mb-3 flex items-center transition-all transform translate-y-0 opacity-100`;
  
  // Set icon based on type
  let icon = 'info-circle';
  let color = 'blue';
  
  if (type === 'success') {
    icon = 'check-circle';
    color = 'green';
  } else if (type === 'error') {
    icon = 'exclamation-circle';
    color = 'red';
  } else if (type === 'warning') {
    icon = 'exclamation-triangle';
    color = 'yellow';
  }
  
  toast.innerHTML = `
    <i class="fas fa-${icon} text-${color}-500 mr-3"></i>
    <span>${message}</span>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initTryOnButtons();
});

// Also listen for the custom event from display-all-products.js
document.addEventListener('productsDisplayed', () => {
  console.log('Products displayed event received, initializing try-on buttons');
  initTryOnButtons();
});

// Set up a periodic check for new buttons
setInterval(() => {
  const uninitializedButtons = document.querySelectorAll('.virtual-try-on:not([data-event-attached="true"])');
  if (uninitializedButtons.length > 0) {
    console.log(`Found ${uninitializedButtons.length} uninitialized try-on buttons`);
    initTryOnButtons();
  }
}, 2000);

// Export functions
export { openTryOn, initTryOnButtons };

// Make functions available globally
window.openTryOn = openTryOn;
window.initTryOnButtons = initTryOnButtons;
