/**
 * ShilpoKotha Wishlist Handler
 * Manages wishlist functionality across the site
 */

// Wishlist storage key in localStorage
const WISHLIST_STORAGE_KEY = 'shilpokotha_wishlist';

/**
 * Get the current wishlist from localStorage
 * @returns {Array} Array of product IDs in the wishlist
 */
function getWishlist() {
  try {
    const wishlistData = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return wishlistData ? JSON.parse(wishlistData) : [];
  } catch (error) {
    console.error('Error getting wishlist from localStorage:', error);
    return [];
  }
}

/**
 * Save the wishlist to localStorage
 * @param {Array} wishlist - Array of product IDs to save
 */
function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    // Update wishlist count in the header
    updateWishlistCount(wishlist.length);
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
}

/**
 * Add a product to the wishlist
 * @param {string} productId - ID of the product to add
 * @returns {boolean} True if added successfully, false if already in wishlist
 */
function addToWishlist(productId) {
  const wishlist = getWishlist();
  
  // Check if product is already in wishlist
  if (wishlist.includes(productId)) {
    return false;
  }
  
  // Add product to wishlist
  wishlist.push(productId);
  saveWishlist(wishlist);
  return true;
}

/**
 * Remove a product from the wishlist
 * @param {string} productId - ID of the product to remove
 * @returns {boolean} True if removed successfully, false if not in wishlist
 */
function removeFromWishlist(productId) {
  const wishlist = getWishlist();
  
  // Check if product is in wishlist
  const index = wishlist.indexOf(productId);
  if (index === -1) {
    return false;
  }
  
  // Remove product from wishlist
  wishlist.splice(index, 1);
  saveWishlist(wishlist);
  return true;
}

/**
 * Check if a product is in the wishlist
 * @param {string} productId - ID of the product to check
 * @returns {boolean} True if in wishlist, false otherwise
 */
function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.includes(productId);
}

/**
 * Toggle a product in the wishlist (add if not present, remove if present)
 * @param {string} productId - ID of the product to toggle
 * @returns {boolean} True if added to wishlist, false if removed
 */
function toggleWishlist(productId) {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
}

/**
 * Update the wishlist count in the header
 * @param {number} count - Number of items in the wishlist
 */
function updateWishlistCount(count) {
  const wishlistCountElements = document.querySelectorAll('.wishlist-count');
  wishlistCountElements.forEach(element => {
    element.textContent = count;
  });
}

/**
 * Initialize wishlist functionality
 */
function initWishlist() {
  // Update wishlist count on page load
  const wishlist = getWishlist();
  updateWishlistCount(wishlist.length);
}

// Initialize wishlist when DOM is loaded
document.addEventListener('DOMContentLoaded', initWishlist);

// Export functions for use in other files
export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist
};
