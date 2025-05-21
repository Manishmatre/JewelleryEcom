/**
 * ShilpoKotha Product Card Handler
 * This file manages the product card interactions, including:
 * - Making the entire card clickable to show product details
 * - Handling wishlist toggling
 * - Handling add to cart functionality
 * - Initializing virtual try-on buttons
 */

import { addToCart } from './cart-handler.js';
import { isInWishlist, toggleWishlist } from './wishlist-handler.js';
import { openTryOn } from './try-on-handler.js';

/**
 * Initialize all product cards on the page
 */
function initProductCards() {
  // Get all product cards
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const productId = card.getAttribute('data-product-id');
    if (!productId) return;
    
    // Initialize wishlist icons
    initWishlistIcon(card, productId);
    
    // Initialize add to cart buttons
    initAddToCartButton(card, productId);
    
    // Initialize virtual try-on buttons
    initVirtualTryOnButton(card, productId);
  });
}

/**
 * Initialize wishlist icon for a product card
 * @param {HTMLElement} card - The product card element
 * @param {string} productId - The product ID
 */
function initWishlistIcon(card, productId) {
  const wishlistIcon = card.querySelector('.wishlist-icon');
  if (!wishlistIcon) return;
  
  // Set initial state
  if (isInWishlist(productId)) {
    wishlistIcon.classList.add('fas');
    wishlistIcon.classList.remove('far');
    wishlistIcon.classList.add('text-red-500');
  } else {
    wishlistIcon.classList.add('far');
    wishlistIcon.classList.remove('fas');
    wishlistIcon.classList.remove('text-red-500');
  }
  
  // Add click event
  const wishlistButton = card.querySelector('.toggle-wishlist');
  if (wishlistButton) {
    wishlistButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const inWishlist = toggleWishlist(productId);
      
      if (inWishlist) {
        wishlistIcon.classList.add('fas');
        wishlistIcon.classList.remove('far');
        wishlistIcon.classList.add('text-red-500');
        showToast('Added to wishlist!', 'success');
      } else {
        wishlistIcon.classList.add('far');
        wishlistIcon.classList.remove('fas');
        wishlistIcon.classList.remove('text-red-500');
        showToast('Removed from wishlist', 'info');
      }
    });
  }
}

/**
 * Initialize add to cart button for a product card
 * @param {HTMLElement} card - The product card element
 * @param {string} productId - The product ID
 */
function initAddToCartButton(card, productId) {
  const addToCartButton = card.querySelector('.add-to-cart');
  if (!addToCartButton) return;
  
  addToCartButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart(productId, 1);
      
      // Show success animation
      const originalText = addToCartButton.innerHTML;
      addToCartButton.innerHTML = '<i class="fas fa-check mr-1"></i> Added';
      addToCartButton.disabled = true;
      
      // Reset button after 2 seconds
      setTimeout(() => {
        addToCartButton.innerHTML = originalText;
        addToCartButton.disabled = false;
      }, 2000);
      
      showToast('Added to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart', 'error');
    }
  });
}

/**
 * Initialize virtual try-on button for a product card
 * @param {HTMLElement} card - The product card element
 * @param {string} productId - The product ID
 */
function initVirtualTryOnButton(card, productId) {
  const tryOnButton = card.querySelector('.virtual-try-on');
  if (!tryOnButton) return;
  
  tryOnButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Use the imported openTryOn function
      openTryOn(productId);
    } catch (error) {
      console.error('Error opening virtual preview:', error);
      showToast('Error opening virtual preview', 'error');
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
  initProductCards();
});

// Export functions for use in other files
export { initProductCards, showToast };
