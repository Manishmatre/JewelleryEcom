/**
 * ShilpoKotha Wishlist Management
 * This file contains all functionality for managing the wishlist page
 */

import { getWishlist as getWishlistItems, removeFromWishlist } from './wishlist-handler.js';
import { getAllProducts } from './products-data-additional.js';
import { addToCart } from './cart-handler.js';

// DOM elements
const loadingState = document.getElementById('loading-state');
const notLoggedIn = document.getElementById('not-logged-in');
const emptyWishlist = document.getElementById('empty-wishlist');
const wishlistItems = document.getElementById('wishlist-items');
const wishlistGrid = document.getElementById('wishlist-grid');
const wishlistCount = document.getElementById('wishlist-count');

// Mock function to get current user (in a real app, this would check authentication)
function getCurrentUser() {
  return Promise.resolve({ id: 'user123', name: 'John Doe' });
}

// Function to add product to cart
function addProductToCart(productId, quantity = 1) {
  try {
    // Use the imported addToCart function
    addToCart(productId, quantity);
    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error };
  }
}

// Product template function
function createProductCard(item) {
  return `
    <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all group" data-product-id="${item.id}">
      <div class="relative overflow-hidden">
        <img src="${item.image}" alt="${item.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute top-0 right-0 p-2">
          <button class="remove-from-wishlist bg-white text-primary hover:text-red-500 p-2 rounded-full shadow-md transition-all" data-product-id="${item.id}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-text-dark font-medium mb-1 group-hover:text-primary transition-all">${item.name}</h3>
        <p class="text-primary font-semibold mb-3">₹${item.price.toFixed(2)}</p>
        <div class="flex space-x-2">
          <button class="add-to-cart bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all flex-grow text-sm" data-product-id="${item.id}">
            Add to Cart
          </button>
          <a href="product.html?id=${item.id}" class="border border-primary text-primary px-3 py-2 rounded-md hover:bg-secondary-dark transition-all text-sm">
            View
          </a>
        </div>
      </div>
    </div>
  `;
}

// Load wishlist items
async function loadWishlist() {
  try {
    // Show loading state
    loadingState.classList.remove('hidden');
    notLoggedIn.classList.add('hidden');
    emptyWishlist.classList.add('hidden');
    wishlistItems.classList.add('hidden');
    
    // Check if user is logged in (in a real app, this would be a proper auth check)
    const user = await getCurrentUser();
    
    if (!user) {
      // User is not logged in
      loadingState.classList.add('hidden');
      notLoggedIn.classList.remove('hidden');
      return;
    }
    
    // Get wishlist items from localStorage
    const wishlistIds = getWishlistItems();
    
    // Update wishlist count in header
    if (wishlistCount) {
      wishlistCount.textContent = wishlistIds.length;
    }
    
    if (wishlistIds.length === 0) {
      // Wishlist is empty
      loadingState.classList.add('hidden');
      emptyWishlist.classList.remove('hidden');
      return;
    }
    
    // Get all products
    const allProducts = getAllProducts();
    
    // Filter products that are in the wishlist
    const wishlistProducts = allProducts.filter(product => wishlistIds.includes(product.id));
    
    // Render wishlist items
    wishlistGrid.innerHTML = '';
    wishlistProducts.forEach(item => {
      wishlistGrid.innerHTML += createProductCard(item);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
      button.addEventListener('click', handleRemoveFromWishlist);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', handleAddToCart);
    });
    
    // Show wishlist items
    loadingState.classList.add('hidden');
    wishlistItems.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading wishlist:', error);
    loadingState.classList.add('hidden');
    emptyWishlist.classList.remove('hidden');
  }
}

// Handle remove from wishlist
function handleRemoveFromWishlist(e) {
  const productId = e.currentTarget.dataset.productId;
  
  // Remove from wishlist
  const removed = removeFromWishlist(productId);
  
  if (removed) {
    // Update UI
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (productCard) {
      productCard.remove();
    }
    
    // Get updated wishlist
    const wishlistIds = getWishlistItems();
    
    // Update wishlist count
    if (wishlistCount) {
      wishlistCount.textContent = wishlistIds.length;
    }
    
    // Show empty wishlist if no items left
    if (wishlistIds.length === 0) {
      wishlistItems.classList.add('hidden');
      emptyWishlist.classList.remove('hidden');
    }
    
    // Show toast notification
    showToast('Product removed from wishlist', 'info');
  } else {
    console.error('Error removing from wishlist');
  }
}

// Handle add to cart
function handleAddToCart(e) {
  const productId = e.currentTarget.dataset.productId;
  
  if (!productId) {
    console.error('Product ID not found');
    return;
  }
  
  // Add to cart using our cart handler
  const result = addProductToCart(productId);
  
  if (result.success) {
    // Show success message
    const button = e.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check mr-1"></i> Added';
    button.disabled = true;
    
    // Reset button after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 2000);
    
    // Show toast notification
    showToast('Product added to cart!', 'success');
  } else {
    // Show error message
    showToast('Error adding to cart', 'error');
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 flex items-center space-x-2 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`;
  
  // Add icon based on type
  const icon = type === 'success' ? 'check-circle' : 'info-circle';
  toast.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileSearchButton = document.getElementById('mobile-search-button');
  const mobileSearch = document.getElementById('mobile-search');
  
  if (mobileSearchButton && mobileSearch) {
    mobileSearchButton.addEventListener('click', () => {
      mobileSearch.classList.toggle('hidden');
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadWishlist();
  initMobileMenu();
});
