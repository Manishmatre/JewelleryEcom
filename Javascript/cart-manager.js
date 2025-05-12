/**
 * ShilpoKotha Cart Manager
 * This file handles cart operations and UI updates for the ShilpoKotha jewelry e-commerce site
 */

import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart, getCartTotalQuantity, getCartTotalPrice } from './cart-handler.js';
import { getAllProducts } from './products-data-additional.js';

// Debug flag - set to true to see console logs
const DEBUG = true;

/**
 * Renders the cart items in the cart page
 */
export function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  if (!cartItemsContainer) return;
  
  const cart = getCart();
  const allProducts = getAllProducts();
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-text-light">Your cart is empty.</p>
        <a href="products.html" class="inline-block mt-4 bg-primary hover:bg-primary-dark text-white text-center font-medium px-6 py-2 rounded-md transition-all">
          Shop Now
        </a>
      </div>
    `;
    return;
  }
  
  let cartItemsHTML = '';
  
  cart.forEach(cartItem => {
    // Find the product details
    const product = allProducts.find(p => p.id === cartItem.productId);
    if (!product) {
      if (DEBUG) console.log(`Product not found for ID: ${cartItem.productId}`);
      return; // Skip this item
    }
    
    const itemTotal = (product.price * cartItem.quantity).toFixed(2);
    
    cartItemsHTML += `
      <div class="flex flex-col md:grid md:grid-cols-12 bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all mb-4" data-product-id="${product.id}">
        <div class="md:col-span-6 flex p-4">
          <div class="w-24 h-24 flex-shrink-0 bg-secondary rounded-md overflow-hidden">
            <img src="${product.image || 'images/product-placeholder.jpg'}" alt="${product.name}" class="w-full h-full object-cover">
          </div>
          <div class="ml-4 flex flex-col justify-between">
            <div>
              <h3 class="font-medium text-text-dark hover:text-primary transition-all">${product.name}</h3>
              <p class="text-sm text-text-light">${product.category || ''}</p>
            </div>
            <button class="remove-from-cart text-xs text-primary hover:text-primary-dark transition-all flex items-center w-max" data-product-id="${product.id}">
              <i class="fas fa-trash-alt mr-1"></i> Remove
            </button>
          </div>
        </div>
        <div class="md:col-span-2 flex md:flex-col md:items-center md:justify-center p-4 md:p-0 border-t md:border-t-0 md:border-l border-secondary-dark">
          <span class="text-sm text-text-light md:hidden">Price:</span>
          <span class="ml-auto md:ml-0 font-medium">₹${product.price.toFixed(2)}</span>
        </div>
        <div class="md:col-span-2 flex md:flex-col md:items-center md:justify-center p-4 md:p-0 border-t md:border-t-0 md:border-l border-secondary-dark">
          <span class="text-sm text-text-light md:hidden">Quantity:</span>
          <div class="ml-auto md:ml-0 flex items-center border border-secondary-dark rounded-md">
            <button class="quantity-decrease w-8 h-8 flex items-center justify-center text-text-light hover:text-primary transition-all" data-product-id="${product.id}">
              <i class="fas fa-minus text-xs"></i>
            </button>
            <input type="number" value="${cartItem.quantity}" min="1" class="quantity-input w-10 h-8 text-center border-x border-secondary-dark focus:outline-none" data-product-id="${product.id}">
            <button class="quantity-increase w-8 h-8 flex items-center justify-center text-text-light hover:text-primary transition-all" data-product-id="${product.id}">
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
        <div class="md:col-span-2 flex md:flex-col md:items-center md:justify-center p-4 md:p-0 border-t md:border-t-0 md:border-l border-secondary-dark">
          <span class="text-sm text-text-light md:hidden">Total:</span>
          <span class="ml-auto md:ml-0 font-medium item-total">₹${itemTotal}</span>
        </div>
      </div>
    `;
  });
  
  cartItemsContainer.innerHTML = cartItemsHTML;
  
  // Add event listeners to the newly created elements
  addCartItemEventListeners();
  updateOrderSummary();
}

/**
 * Adds event listeners to cart item elements
 */
function addCartItemEventListeners() {
  // Remove item buttons
  document.querySelectorAll('.remove-from-cart').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      if (DEBUG) console.log(`Removing product from cart: ${productId}`);
      
      removeFromCart(productId);
      
      // Show toast notification
      showToast('Item removed from cart', 'info');
      
      // Update UI
      renderCartItems();
    });
  });
  
  // Quantity decrease buttons
  document.querySelectorAll('.quantity-decrease').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      let newQuantity = parseInt(input.value) - 1;
      if (newQuantity < 1) newQuantity = 1;
      input.value = newQuantity;
      
      updateCartItemQuantity(productId, newQuantity);
      updateItemTotal(productId);
      updateOrderSummary();
    });
  });
  
  // Quantity increase buttons
  document.querySelectorAll('.quantity-increase').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      let newQuantity = parseInt(input.value) + 1;
      input.value = newQuantity;
      
      updateCartItemQuantity(productId, newQuantity);
      updateItemTotal(productId);
      updateOrderSummary();
    });
  });
  
  // Quantity input changes
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const productId = this.getAttribute('data-product-id');
      let newQuantity = parseInt(this.value);
      if (newQuantity < 1) {
        newQuantity = 1;
        this.value = 1;
      }
      
      updateCartItemQuantity(productId, newQuantity);
      updateItemTotal(productId);
      updateOrderSummary();
    });
  });
}

/**
 * Updates the total price for a specific item
 * @param {string} productId - The product ID
 */
function updateItemTotal(productId) {
  const cart = getCart();
  const allProducts = getAllProducts();
  
  const cartItem = cart.find(item => item.productId === productId);
  if (!cartItem) return;
  
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  const itemTotalElement = document.querySelector(`[data-product-id="${productId}"] .item-total`);
  if (itemTotalElement) {
    const itemTotal = (product.price * cartItem.quantity).toFixed(2);
    itemTotalElement.textContent = `₹${itemTotal}`;
  }
}

/**
 * Updates the order summary
 */
export function updateOrderSummary() {
  const subtotalElement = document.getElementById('cart-subtotal');
  const taxElement = document.getElementById('cart-tax');
  const totalElement = document.getElementById('cart-total');
  
  if (!subtotalElement || !taxElement || !totalElement) return;
  
  const allProducts = getAllProducts();
  const subtotal = getCartTotalPrice(allProducts);
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;
  
  subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
  taxElement.textContent = `₹${tax.toFixed(2)}`;
  totalElement.textContent = `₹${total.toFixed(2)}`;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, info, error)
 */
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `flex items-center p-3 rounded-md shadow-lg transform transition-all duration-300 translate-x-full`;
  
  // Set background color based on type
  if (type === 'success') {
    toast.classList.add('bg-green-50', 'text-green-800', 'border-l-4', 'border-green-500');
  } else if (type === 'error') {
    toast.classList.add('bg-red-50', 'text-red-800', 'border-l-4', 'border-red-500');
  } else {
    toast.classList.add('bg-blue-50', 'text-blue-800', 'border-l-4', 'border-primary');
  }
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  
  // Set toast content
  toast.innerHTML = `
    <i class="fas fa-${icon} mr-2"></i>
    <span>${message}</span>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Animate toast in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 10);
  
  // Remove toast after delay
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Initialize cart functionality
 */
export function initCart() {
  // If we're on the cart page, render the cart items
  if (document.getElementById('cart-items-container')) {
    renderCartItems();
    
    // Add clear cart button functionality
    const clearCartButton = document.getElementById('clear-cart-button');
    if (clearCartButton) {
      clearCartButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
          clearCart();
          renderCartItems();
          showToast('Cart cleared', 'info');
        }
      });
    }
    
    // Add checkout button functionality
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', function() {
        // In a real implementation, this would redirect to checkout
        showToast('Proceeding to checkout...', 'success');
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCart);
