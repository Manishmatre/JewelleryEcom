/**
 * ShilpoKotha Local Storage Manager
 * This file handles all local storage operations for the ShilpoKotha jewelry e-commerce site
 * It provides functions for managing user profiles, cart, wishlist, and other data
 */

// Keys for different storage items
const STORAGE_KEYS = {
  USER_PROFILES: 'shilpokotha_user_profiles',
  CURRENT_USER: 'shilpokotha_current_user',
  CART: 'shilpokotha_cart',
  WISHLIST: 'shilpokotha_wishlist',
  ORDERS: 'shilpokotha_orders'
};

/**
 * Get data from local storage
 * @param {string} key - The storage key
 * @returns {any} - The parsed data or null if not found
 */
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting data from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Save data to local storage
 * @param {string} key - The storage key
 * @param {any} data - The data to save
 * @returns {boolean} - True if successful, false otherwise
 */
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Remove data from local storage
 * @param {string} key - The storage key
 * @returns {boolean} - True if successful, false otherwise
 */
const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data from localStorage (${key}):`, error);
    return false;
  }
};

// User Profile Management

/**
 * Save user profile data after Firebase authentication
 * @param {Object} user - The Firebase user object
 * @param {Object} additionalData - Additional user data
 * @returns {Object} - Result object with success status
 */
export const saveUserProfile = (user, additionalData = {}) => {
  try {
    // Get existing profiles or initialize empty object
    const profiles = getFromStorage(STORAGE_KEYS.USER_PROFILES) || {};
    
    // Create or update profile
    profiles[user.uid] = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || '',
      phoneNumber: additionalData.phoneNumber || '',
      address: additionalData.address || {},
      createdAt: profiles[user.uid]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save profiles back to storage
    const saved = saveToStorage(STORAGE_KEYS.USER_PROFILES, profiles);
    
    // Set current user
    saveCurrentUser(user.uid);
    
    return { success: saved };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile data
 * @param {string} userId - The user ID
 * @returns {Object} - Result object with success status and user data
 */
export const getUserProfile = (userId) => {
  try {
    const profiles = getFromStorage(STORAGE_KEYS.USER_PROFILES) || {};
    const profile = profiles[userId];
    
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }
    
    return { success: true, data: profile };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile data
 * @param {string} userId - The user ID
 * @param {Object} profileData - The profile data to update
 * @returns {Object} - Result object with success status
 */
export const updateUserProfile = (userId, profileData) => {
  try {
    const profiles = getFromStorage(STORAGE_KEYS.USER_PROFILES) || {};
    const profile = profiles[userId];
    
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }
    
    // Update profile with new data
    profiles[userId] = {
      ...profile,
      displayName: profileData.displayName || profile.displayName,
      phoneNumber: profileData.phoneNumber || profile.phoneNumber,
      address: profileData.address || profile.address,
      updatedAt: new Date().toISOString()
    };
    
    // Save profiles back to storage
    const saved = saveToStorage(STORAGE_KEYS.USER_PROFILES, profiles);
    
    return { success: saved };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save current user ID
 * @param {string} userId - The user ID
 * @returns {boolean} - True if successful, false otherwise
 */
export const saveCurrentUser = (userId) => {
  return saveToStorage(STORAGE_KEYS.CURRENT_USER, userId);
};

/**
 * Get current user ID
 * @returns {string|null} - The current user ID or null
 */
export const getCurrentUserId = () => {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER);
};

/**
 * Get current user profile
 * @returns {Object} - Result object with success status and user data
 */
export const getCurrentUserProfile = () => {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return { success: false, error: 'No user is currently logged in' };
  }
  
  return getUserProfile(userId);
};

/**
 * Clear current user (logout)
 * @returns {boolean} - True if successful, false otherwise
 */
export const clearCurrentUser = () => {
  return removeFromStorage(STORAGE_KEYS.CURRENT_USER);
};

// Cart Management

/**
 * Get cart for current user
 * @returns {Object} - Result object with success status and cart data
 */
export const getCart = () => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const carts = getFromStorage(STORAGE_KEYS.CART) || {};
    const cart = carts[userId] || { items: [], total: 0 };
    
    return { success: true, data: cart };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add item to cart
 * @param {Object} product - The product to add
 * @param {number} quantity - The quantity to add
 * @returns {Object} - Result object with success status
 */
export const addToCart = (product, quantity = 1) => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const carts = getFromStorage(STORAGE_KEYS.CART) || {};
    const cart = carts[userId] || { items: [], total: 0 };
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    // Recalculate total
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Save cart back to storage
    carts[userId] = cart;
    const saved = saveToStorage(STORAGE_KEYS.CART, carts);
    
    return { success: saved, data: cart };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update cart item quantity
 * @param {string} productId - The product ID
 * @param {number} quantity - The new quantity
 * @returns {Object} - Result object with success status
 */
export const updateCartItemQuantity = (productId, quantity) => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const carts = getFromStorage(STORAGE_KEYS.CART) || {};
    const cart = carts[userId] || { items: [], total: 0 };
    
    // Find the item
    const itemIndex = cart.items.findIndex(item => item.id === productId);
    
    if (itemIndex < 0) {
      return { success: false, error: 'Item not found in cart' };
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Recalculate total
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Save cart back to storage
    carts[userId] = cart;
    const saved = saveToStorage(STORAGE_KEYS.CART, carts);
    
    return { success: saved, data: cart };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove item from cart
 * @param {string} productId - The product ID
 * @returns {Object} - Result object with success status
 */
export const removeFromCart = (productId) => {
  return updateCartItemQuantity(productId, 0);
};

/**
 * Clear cart
 * @returns {Object} - Result object with success status
 */
export const clearCart = () => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const carts = getFromStorage(STORAGE_KEYS.CART) || {};
    carts[userId] = { items: [], total: 0 };
    
    const saved = saveToStorage(STORAGE_KEYS.CART, carts);
    
    return { success: saved };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: error.message };
  }
};

// Wishlist Management

/**
 * Get wishlist for current user
 * @returns {Object} - Result object with success status and wishlist data
 */
export const getWishlist = () => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const wishlists = getFromStorage(STORAGE_KEYS.WISHLIST) || {};
    const wishlist = wishlists[userId] || { items: [] };
    
    return { success: true, data: wishlist };
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add item to wishlist
 * @param {Object} product - The product to add
 * @returns {Object} - Result object with success status
 */
export const addToWishlist = (product) => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const wishlists = getFromStorage(STORAGE_KEYS.WISHLIST) || {};
    const wishlist = wishlists[userId] || { items: [] };
    
    // Check if product already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex < 0) {
      // Add new item only if it doesn't exist
      wishlist.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
    }
    
    // Save wishlist back to storage
    wishlists[userId] = wishlist;
    const saved = saveToStorage(STORAGE_KEYS.WISHLIST, wishlists);
    
    return { success: saved, data: wishlist };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove item from wishlist
 * @param {string} productId - The product ID
 * @returns {Object} - Result object with success status
 */
export const removeFromWishlist = (productId) => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const wishlists = getFromStorage(STORAGE_KEYS.WISHLIST) || {};
    const wishlist = wishlists[userId] || { items: [] };
    
    // Find the item
    const itemIndex = wishlist.items.findIndex(item => item.id === productId);
    
    if (itemIndex < 0) {
      return { success: false, error: 'Item not found in wishlist' };
    }
    
    // Remove item
    wishlist.items.splice(itemIndex, 1);
    
    // Save wishlist back to storage
    wishlists[userId] = wishlist;
    const saved = saveToStorage(STORAGE_KEYS.WISHLIST, wishlists);
    
    return { success: saved, data: wishlist };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if item is in wishlist
 * @param {string} productId - The product ID
 * @returns {boolean} - True if in wishlist, false otherwise
 */
export const isInWishlist = (productId) => {
  const result = getWishlist();
  
  if (!result.success) {
    return false;
  }
  
  return result.data.items.some(item => item.id === productId);
};

// Order Management

/**
 * Create a new order
 * @param {Object} orderData - The order data
 * @returns {Object} - Result object with success status
 */
export const createOrder = (orderData) => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || {};
    const userOrders = orders[userId] || [];
    
    // Create new order
    const newOrder = {
      id: `order_${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Add to user orders
    userOrders.push(newOrder);
    orders[userId] = userOrders;
    
    // Save orders back to storage
    const saved = saveToStorage(STORAGE_KEYS.ORDERS, orders);
    
    // Clear cart if order was created successfully
    if (saved) {
      clearCart();
    }
    
    return { success: saved, data: newOrder };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all orders for current user
 * @returns {Object} - Result object with success status and orders data
 */
export const getOrders = () => {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      return { success: false, error: 'No user is currently logged in' };
    }
    
    const orders = getFromStorage(STORAGE_KEYS.ORDERS) || {};
    const userOrders = orders[userId] || [];
    
    return { success: true, data: userOrders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The order ID
 * @returns {Object} - Result object with success status and order data
 */
export const getOrderById = (orderId) => {
  try {
    const result = getOrders();
    
    if (!result.success) {
      return result;
    }
    
    const order = result.data.find(order => order.id === orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    return { success: true, data: order };
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return { success: false, error: error.message };
  }
};

// Export storage keys for reference
export { STORAGE_KEYS };
