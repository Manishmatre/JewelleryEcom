/**
 * ShilpoKotha Cart Manager
 * This file handles cart operations and UI updates for the ShilpoKotha jewelry e-commerce site
 */

import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from './local-storage.js';
import { updateCartCount } from './header-manager.js';

// We now import updateCartCount from header-manager.js

/**
 * Renders the cart items in the cart page
 */
export function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  if (!cartItemsContainer) return;
  
  const cartResult = getCart();
  
  if (!cartResult.success) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-text-light">Please log in to view your cart.</p>
        <a href="login.html" class="inline-block mt-4 bg-primary hover:bg-primary-dark text-white text-center font-medium px-6 py-2 rounded-md transition-all">
          Login
        </a>
      </div>
    `;
    return;
  }
  
  const cart = cartResult.data;
  
  if (cart.items.length === 0) {
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
  
  cart.items.forEach(item => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    
    cartItemsHTML += `
      <div class="flex flex-col md:grid md:grid-cols-12 bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all" data-product-id="${item.id}">
        <div class="md:col-span-6 flex p-4">
          <div class="w-24 h-24 flex-shrink-0 bg-secondary rounded-md overflow-hidden">
            <img src="${item.image || 'images/product-placeholder.jpg'}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          <div class="ml-4 flex flex-col justify-between">
            <div>
              <h3 class="font-medium text-text-dark hover:text-primary transition-all">${item.name}</h3>
              <p class="text-sm text-text-light">${item.variant || ''}</p>
            </div>
            <button class="remove-from-cart text-xs text-primary hover:text-primary-dark transition-all flex items-center w-max" data-product-id="${item.id}">
              <i class="fas fa-trash-alt mr-1"></i> Remove
            </button>
          </div>
        </div>
        <div class="md:col-span-2 flex md:flex-col md:items-center md:justify-center p-4 md:p-0 border-t md:border-t-0 md:border-l border-secondary-dark">
          <span class="text-sm text-text-light md:hidden">Price:</span>
          <span class="ml-auto md:ml-0 font-medium">$${item.price.toFixed(2)}</span>
        </div>
        <div class="md:col-span-2 flex md:flex-col md:items-center md:justify-center p-4 md:p-0 border-t md:border-t-0 md:border-l border-secondary-dark">
          <span class="text-sm text-text-light md:hidden">Quantity:</span>
          <div class="ml-auto md:ml-0 flex items-center border border-secondary-dark rounded-md">
            <button class="quantity-decrease w-8 h-8 flex items-center justify-center text-text-light hover:text-primary transition-all" data-product-id="${item.id}">
              <i class="fas fa-minus text-xs"></i>
            </button>
            <input type="number" value="${item.quantity}" min="1" class="quantity-input w-10 h-8 text-center border-x border-secondary-dark focus:outline-none" data-product-id="${item.id}">
            <button class="quantity-increase w-8 h-8 flex items-center justify-center text-text-light hover:text-primary transition-all" data-product-id="${item.id}">
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
        <div class="md:col-span-2 flex md:flex-col md:items-center md:justify-center p-4 md:p-0 border-t md:border-t-0 md:border-l border-secondary-dark">
          <span class="text-sm text-text-light md:hidden">Total:</span>
          <span class="ml-auto md:ml-0 font-medium text-primary item-total">$${itemTotal}</span>
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
      removeFromCart(productId);
      renderCartItems();
      updateCartCount();
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
      updateCartCount();
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
      updateCartCount();
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
      updateCartCount();
    });
  });
}

/**
 * Updates the total price for a specific item
 * @param {string} productId - The product ID
 */
function updateItemTotal(productId) {
  const cartResult = getCart();
  if (!cartResult.success) return;
  
  const cart = cartResult.data;
  const item = cart.items.find(item => item.id === productId);
  
  if (!item) return;
  
  const itemTotalElement = document.querySelector(`[data-product-id="${productId}"] .item-total`);
  if (itemTotalElement) {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    itemTotalElement.textContent = `$${itemTotal}`;
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
  
  const cartResult = getCart();
  if (!cartResult.success) return;
  
  const cart = cartResult.data;
  const subtotal = cart.total;
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;
  
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  taxElement.textContent = `$${tax.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
}

/**
 * Initialize cart functionality
 */
export function initCart() {
  updateCartCount();
  
  // If we're on the cart page, render the cart items
  if (document.getElementById('cart-items-container')) {
    renderCartItems();
    
    // Update cart button
    const updateCartButton = document.getElementById('update-cart-button');
    if (updateCartButton) {
      updateCartButton.addEventListener('click', function() {
        renderCartItems();
        updateCartCount();
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCart);
