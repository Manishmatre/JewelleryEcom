/**
 * ShilpoKotha Cart Handler
 * Manages shopping cart functionality across the site
 */

// Cart storage key in localStorage
const CART_STORAGE_KEY = 'shilpokotha_cart';

/**
 * Get the current cart from localStorage
 * @returns {Array} Array of cart items with product IDs and quantities
 */
function getCart() {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return [];
  }
}

/**
 * Save the cart to localStorage
 * @param {Array} cart - Array of cart items to save
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Update cart count in the header
    updateCartCount(getCartTotalQuantity(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

/**
 * Get the total quantity of items in the cart
 * @param {Array} cart - The cart array
 * @returns {number} Total quantity
 */
function getCartTotalQuantity(cart = null) {
  const cartItems = cart || getCart();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get the total price of items in the cart
 * @param {Array} products - Array of all products
 * @returns {number} Total price
 */
function getCartTotalPrice(products) {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      return total + (product.price * item.quantity);
    }
    return total;
  }, 0);
}

/**
 * Add a product to the cart
 * @param {string} productId - ID of the product to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Object} Updated cart item
 */
function addToCart(productId, quantity = 1) {
  const cart = getCart();
  
  // Check if product is already in cart
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  
  if (existingItemIndex !== -1) {
    // Update quantity if product already in cart
    cart[existingItemIndex].quantity += quantity;
    const updatedItem = cart[existingItemIndex];
    saveCart(cart);
    return updatedItem;
  } else {
    // Add new item to cart
    const newItem = { productId, quantity };
    cart.push(newItem);
    saveCart(cart);
    return newItem;
  }
}

/**
 * Remove a product from the cart
 * @param {string} productId - ID of the product to remove
 * @returns {boolean} True if removed successfully, false if not in cart
 */
function removeFromCart(productId) {
  const cart = getCart();
  
  // Check if product is in cart
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  if (existingItemIndex === -1) {
    return false;
  }
  
  // Remove product from cart
  cart.splice(existingItemIndex, 1);
  saveCart(cart);
  return true;
}

/**
 * Update the quantity of a product in the cart
 * @param {string} productId - ID of the product to update
 * @param {number} quantity - New quantity (must be positive)
 * @returns {boolean} True if updated successfully, false if not in cart or invalid quantity
 */
function updateCartItemQuantity(productId, quantity) {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  
  const cart = getCart();
  
  // Check if product is in cart
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  if (existingItemIndex === -1) {
    return false;
  }
  
  // Update quantity
  cart[existingItemIndex].quantity = quantity;
  saveCart(cart);
  return true;
}

/**
 * Check if a product is in the cart
 * @param {string} productId - ID of the product to check
 * @returns {boolean} True if in cart, false otherwise
 */
function isInCart(productId) {
  const cart = getCart();
  return cart.some(item => item.productId === productId);
}

/**
 * Get the quantity of a product in the cart
 * @param {string} productId - ID of the product to check
 * @returns {number} Quantity of the product in cart, 0 if not in cart
 */
function getCartItemQuantity(productId) {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  return item ? item.quantity : 0;
}

/**
 * Clear the entire cart
 * @returns {boolean} True if cleared successfully
 */
function clearCart() {
  try {
    saveCart([]);
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
}

/**
 * Update the cart count in the header
 * @param {number} count - Number of items in the cart
 */
function updateCartCount(count) {
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = count;
  });
}

/**
 * Initialize cart functionality
 */
function initCart() {
  // Update cart count on page load
  const cartTotalQuantity = getCartTotalQuantity();
  updateCartCount(cartTotalQuantity);
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', initCart);

// Export functions for use in other files
export {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  isInCart,
  getCartItemQuantity,
  getCartTotalQuantity,
  getCartTotalPrice,
  clearCart
};
