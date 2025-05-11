/**
 * ShilpoKotha Header Manager
 * This file handles header updates for cart and wishlist counts across all pages
 */

// Import from both storage systems to ensure compatibility
import * as localStorageManager from './local-storage.js';
import * as cartHandler from './cart-handler.js';
import * as wishlistHandler from './wishlist-handler.js';

/**
 * Updates the cart count in the header
 */
export function updateCartCount() {
  let count = 0;
  
  // Try to get cart from cart-handler first
  try {
    count = cartHandler.getCartTotalQuantity();
  } catch (error) {
    // Fallback to local-storage system
    try {
      const cartResult = localStorageManager.getCart();
      if (cartResult.success) {
        count = cartResult.data.items.length;
      }
    } catch (error) {
      console.error('Error getting cart count:', error);
    }
  }
  
  // Update all cart count elements
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = count;
  });
  
  // Update mobile menu cart count if it exists
  const mobileCartCount = document.querySelector('.mobile-cart-count');
  if (mobileCartCount) {
    mobileCartCount.textContent = `Cart (${count})`;
  }
  
  // Add cart count badge if it doesn't exist
  const cartLink = document.querySelector('a[href="cart.html"]');
  if (cartLink) {
    let badge = cartLink.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge cart-count absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
      badge.textContent = count;
      cartLink.classList.add('relative');
      cartLink.appendChild(badge);
    } else {
      badge.textContent = count;
    }
    
    // Only show badge if count > 0
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

/**
 * Updates the wishlist count in the header
 */
export function updateWishlistCount() {
  let count = 0;
  
  // Try to get wishlist from wishlist-handler first
  try {
    count = wishlistHandler.getWishlist().length;
  } catch (error) {
    // Fallback to local-storage system
    try {
      const wishlistResult = localStorageManager.getWishlist();
      if (wishlistResult.success) {
        count = wishlistResult.data.items.length;
      }
    } catch (error) {
      console.error('Error getting wishlist count:', error);
    }
  }
  
  // Update all wishlist count elements
  const wishlistCountElements = document.querySelectorAll('.wishlist-count');
  wishlistCountElements.forEach(element => {
    element.textContent = count;
  });
  
  // Add wishlist count badge if it doesn't exist
  const wishlistLink = document.querySelector('a[href="wishlist.html"]');
  if (wishlistLink) {
    let badge = wishlistLink.querySelector('.wishlist-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'wishlist-badge wishlist-count absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
      badge.textContent = count;
      wishlistLink.classList.add('relative');
      wishlistLink.appendChild(badge);
    } else {
      badge.textContent = count;
    }
    
    // Only show badge if count > 0
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

/**
 * Initialize header counts
 */
export function initHeaderCounts() {
  updateCartCount();
  updateWishlistCount();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initHeaderCounts);
