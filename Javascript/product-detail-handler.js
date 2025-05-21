/**
 * ShilpoKotha Product Detail Handler
 * This script handles functionality specific to the product detail page
 */

import { addToCart } from './cart-handler.js';
import { isInWishlist, toggleWishlist } from './wishlist-handler.js';
import { openTryOn } from './try-on-handler.js';
import { openPreview } from './virtual-preview.js';

/**
 * Initialize the product detail page functionality
 */
function initProductDetailPage() {
  console.log('Initializing product detail page');
  
  // Get the current product ID
  const productId = getCurrentProductId();
  console.log(`Current product ID: ${productId}`);
  
  // Initialize Add to Cart button
  initAddToCartButton(productId);
  
  // Initialize Virtual Try-On button
  initVirtualTryOnButton(productId);
  
  // Initialize Wishlist button
  initWishlistButton(productId);
  
  // Initialize quantity controls
  initQuantityControls();
}

/**
 * Get the current product ID from the URL or page metadata
 * @returns {string} The product ID
 */
function getCurrentProductId() {
  // Try to get from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get('id');
  if (idFromUrl) return idFromUrl;
  
  // Try to get from add-to-cart button
  const addToCartBtn = document.querySelector('.add-to-cart[data-product-id]');
  if (addToCartBtn) return addToCartBtn.getAttribute('data-product-id');
  
  // Default fallback ID
  return 'ring-001';
}

/**
 * Initialize the Add to Cart button
 * @param {string} productId - The product ID
 */
function initAddToCartButton(productId) {
  const addToCartBtn = document.querySelector('.add-to-cart');
  if (!addToCartBtn) {
    console.error('Add to Cart button not found');
    return;
  }
  
  // Update the product ID attribute
  addToCartBtn.setAttribute('data-product-id', productId);
  
  // Add click event listener
  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Get the quantity
    const quantityInput = document.getElementById('quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    try {
      // Add to cart
      addToCart(productId, quantity);
      
      // Show success animation
      const originalText = addToCartBtn.innerHTML;
      addToCartBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Added to Cart';
      addToCartBtn.disabled = true;
      
      // Reset button after 2 seconds
      setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
      }, 2000);
      
      showToast('Added to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart', 'error');
    }
  });
  
  console.log('Add to Cart button initialized');
}

/**
 * Initialize the Virtual Try-On button
 * @param {string} productId - The product ID
 */
function initVirtualTryOnButton(productId) {
  const tryOnBtn = document.getElementById('virtual-try-on-button');
  if (!tryOnBtn) {
    console.error('Virtual Try-On button not found');
    return;
  }
  
  // Update the product ID attribute
  tryOnBtn.setAttribute('data-product-id', productId);
  
  // Add click event listener
  tryOnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(`Virtual try-on button clicked for product: ${productId}`);
    
    try {
      // Try multiple approaches to ensure the virtual try-on works
      
      // First try direct openPreview import
      if (typeof openPreview === 'function') {
        console.log('Using directly imported openPreview function');
        openPreview(productId);
        return;
      }
      
      // Then try openTryOn from try-on-handler
      if (typeof openTryOn === 'function') {
        console.log('Using openTryOn function from try-on-handler');
        openTryOn(productId);
        return;
      }
      
      // Fall back to global function
      if (typeof window.openPreview === 'function') {
        console.log('Using global openPreview function');
        window.openPreview(productId);
        return;
      }
      
      // If all else fails, try dynamic import
      console.log('Attempting dynamic import of virtual-preview.js');
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
      console.error('Error opening virtual try-on:', error);
      showToast('Error opening virtual try-on', 'error');
    }
  });
  
  console.log('Virtual Try-On button initialized');
}

/**
 * Initialize the Wishlist button
 * @param {string} productId - The product ID
 */
function initWishlistButton(productId) {
  const wishlistBtn = document.querySelector('.toggle-wishlist');
  if (!wishlistBtn) {
    console.error('Wishlist button not found');
    return;
  }
  
  const wishlistIcon = wishlistBtn.querySelector('.wishlist-icon');
  if (!wishlistIcon) {
    console.error('Wishlist icon not found');
    return;
  }
  
  // Update the product ID attribute
  wishlistBtn.setAttribute('data-product-id', productId);
  
  // Set initial state
  updateWishlistButtonState(wishlistBtn, wishlistIcon, productId);
  
  // Add click event listener
  wishlistBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    try {
      // Toggle wishlist status
      const inWishlist = toggleWishlist(productId);
      
      // Update button state
      updateWishlistButtonState(wishlistBtn, wishlistIcon, productId);
      
      // Show toast
      showToast(inWishlist ? 'Added to wishlist!' : 'Removed from wishlist', inWishlist ? 'success' : 'info');
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showToast('Error updating wishlist', 'error');
    }
  });
  
  console.log('Wishlist button initialized');
}

/**
 * Update the wishlist button state based on whether the product is in the wishlist
 * @param {HTMLElement} button - The wishlist button
 * @param {HTMLElement} icon - The wishlist icon
 * @param {string} productId - The product ID
 */
function updateWishlistButtonState(button, icon, productId) {
  const inWishlist = isInWishlist(productId);
  
  if (inWishlist) {
    icon.classList.add('fas');
    icon.classList.remove('far');
    button.querySelector('span').textContent = 'Remove from Wishlist';
  } else {
    icon.classList.add('far');
    icon.classList.remove('fas');
    button.querySelector('span').textContent = 'Add to Wishlist';
  }
}

/**
 * Initialize quantity controls
 */
function initQuantityControls() {
  const quantityInput = document.getElementById('quantity');
  if (!quantityInput) {
    console.error('Quantity input not found');
    return;
  }
  
  // Increment button
  const incrementBtn = document.querySelector('button[onclick="incrementQuantity()"]');
  if (incrementBtn) {
    // Remove the inline onclick attribute
    incrementBtn.removeAttribute('onclick');
    
    // Add click event listener
    incrementBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      const maxValue = parseInt(quantityInput.getAttribute('max') || 99);
      
      if (currentValue < maxValue) {
        quantityInput.value = currentValue + 1;
      }
    });
  }
  
  // Decrement button
  const decrementBtn = document.querySelector('button[onclick="decrementQuantity()"]');
  if (decrementBtn) {
    // Remove the inline onclick attribute
    decrementBtn.removeAttribute('onclick');
    
    // Add click event listener
    decrementBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      const minValue = parseInt(quantityInput.getAttribute('min') || 1);
      
      if (currentValue > minValue) {
        quantityInput.value = currentValue - 1;
      }
    });
  }
  
  console.log('Quantity controls initialized');
}

/**
 * Show a toast notification
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
document.addEventListener('DOMContentLoaded', initProductDetailPage);

// Export functions
export { initProductDetailPage, getCurrentProductId, showToast };
