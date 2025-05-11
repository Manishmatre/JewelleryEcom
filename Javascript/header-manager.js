/**
 * ShilpoKotha Header Manager
 * This file handles header updates for cart and wishlist counts across all pages
 */

import { getCart, getWishlist } from './local-storage.js';

/**
 * Updates the cart count in the header
 */
export function updateCartCount() {
  const cartResult = getCart();
  let count = 0;
  
  if (cartResult.success) {
    count = cartResult.data.items.length;
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
}

/**
 * Updates the wishlist count in the header
 */
export function updateWishlistCount() {
  const wishlistResult = getWishlist();
  let count = 0;
  
  if (wishlistResult.success) {
    count = wishlistResult.data.items.length;
  }
  
  // Update all wishlist count elements
  const wishlistCountElements = document.querySelectorAll('.wishlist-count');
  wishlistCountElements.forEach(element => {
    element.textContent = count;
  });
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
