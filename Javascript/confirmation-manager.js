/**
 * ShilpoKotha Confirmation Manager
 * This file handles the order confirmation page functionality
 */

import { getCart, clearCart, getCartTotalQuantity, getCartTotalPrice } from './cart-handler.js';
import { getAllProducts } from './products-data-additional.js';

// Debug flag - set to true to see console logs
const DEBUG = true;

// Tax rate (10%)
const TAX_RATE = 0.10;

// Shipping options and their costs
const SHIPPING_OPTIONS = {
  standard: {
    name: 'Standard Shipping',
    description: 'Delivery in 3-5 business days',
    cost: 5.00
  },
  express: {
    name: 'Express Shipping',
    description: 'Delivery in 1-2 business days',
    cost: 15.00
  }
};

/**
 * Generate a random order number
 * @returns {string} Random order number
 */
function generateOrderNumber() {
  const prefix = 'SK';
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

/**
 * Format date for estimated delivery
 * @param {number} daysToAdd - Number of days to add to current date
 * @returns {string} Formatted date string
 */
function getEstimatedDeliveryDate(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  
  // Format as Month Day, Year
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Initialize confirmation page
 */
function initConfirmation() {
  if (DEBUG) console.log('Initializing confirmation page');
  
  // Check if we have order data in sessionStorage
  const orderData = sessionStorage.getItem('shilpokotha_order_data');
  
  if (orderData) {
    // Use the saved order data
    displayOrderConfirmation(JSON.parse(orderData));
  } else {
    // Generate order data from cart and user profile
    generateOrderConfirmation();
  }
  
  // Clear the cart after displaying the confirmation
  clearCart();
}

/**
 * Generate order confirmation data from cart and user profile
 */
function generateOrderConfirmation() {
  // Get cart data
  const cart = getCart();
  
  // If cart is empty, redirect to home page
  if (cart.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  
  // Get user profile data
  const userProfileStr = localStorage.getItem('shilpokotha_user_profile');
  const userProfile = userProfileStr ? JSON.parse(userProfileStr) : {};
  
  // Get shipping method from sessionStorage or default to standard
  const shippingMethod = sessionStorage.getItem('shilpokotha_shipping_method') || 'standard';
  
  // Generate order data
  const orderData = {
    orderNumber: generateOrderNumber(),
    orderDate: new Date().toISOString(),
    items: cart,
    userProfile: userProfile,
    shipping: {
      method: shippingMethod,
      cost: SHIPPING_OPTIONS[shippingMethod].cost,
      name: SHIPPING_OPTIONS[shippingMethod].name,
      estimatedDelivery: getEstimatedDeliveryDate(shippingMethod === 'express' ? 2 : 5)
    },
    payment: {
      method: sessionStorage.getItem('shilpokotha_payment_method') || 'credit-card',
      lastFour: sessionStorage.getItem('shilpokotha_card_last_four') || '4242'
    }
  };
  
  // Save order data to sessionStorage
  sessionStorage.setItem('shilpokotha_order_data', JSON.stringify(orderData));
  
  // Display the order confirmation
  displayOrderConfirmation(orderData);
}

/**
 * Display order confirmation on the page
 * @param {Object} orderData - Order data to display
 */
function displayOrderConfirmation(orderData) {
  if (DEBUG) console.log('Displaying order confirmation', orderData);
  
  // Update order number
  const orderNumberElement = document.querySelector('.order-number');
  if (orderNumberElement) {
    orderNumberElement.textContent = orderData.orderNumber;
  }
  
  // Update customer email
  const customerEmailElement = document.querySelector('.customer-email');
  if (customerEmailElement && orderData.userProfile && orderData.userProfile.email) {
    customerEmailElement.textContent = orderData.userProfile.email;
  }
  
  // First update the order summary to ensure calculations are done
  updateOrderSummary(orderData);
  
  // Then update the other sections
  updateOrderItems(orderData.items);
  updateShippingInfo(orderData.userProfile, orderData.shipping);
  updatePaymentInfo(orderData.payment, orderData.userProfile);
}

/**
 * Calculate order totals
 * @param {Array} items - Cart items
 * @param {Object} shipping - Shipping information
 * @returns {Object} Order totals
 */
function calculateOrderTotals(items, shipping) {
  const allProducts = getAllProducts();
  
  // Calculate subtotal from items
  let subtotal = 0;
  items.forEach(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
    }
  });
  
  // Calculate shipping, tax, and total
  const shippingCost = shipping ? shipping.cost : SHIPPING_OPTIONS.standard.cost;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;
  
  return {
    subtotal,
    shipping: shippingCost,
    tax,
    total,
    items: items.length
  };
}

/**
 * Update order items in the confirmation page
 * @param {Array} items - Cart items
 */
function updateOrderItems(items) {
  const orderItemsContainer = document.getElementById('order-items');
  if (!orderItemsContainer) return;
  
  const allProducts = getAllProducts();
  
  let orderItemsHTML = '';
  
  items.forEach(item => {
    // Find the product details
    const product = allProducts.find(p => p.id === item.productId);
    if (!product) {
      if (DEBUG) console.log(`Product not found for ID: ${item.productId}`);
      return; // Skip this item
    }
    
    const itemTotal = product.price * item.quantity;
    
    orderItemsHTML += `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-secondary-dark">
        <div class="flex items-center mb-4 sm:mb-0">
          <div class="w-16 h-16 flex-shrink-0 bg-secondary rounded-md overflow-hidden mr-4">
            <img src="${product.image || 'images/product-placeholder.jpg'}" alt="${product.name}" class="w-full h-full object-cover">
          </div>
          <div>
            <h3 class="font-medium text-text-dark">${product.name}</h3>
            <p class="text-xs text-text-light">${product.category || ''}</p>
            <p class="text-xs text-text-light">Qty: ${item.quantity}</p>
          </div>
        </div>
        <span class="font-medium">$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });
  
  orderItemsContainer.innerHTML = orderItemsHTML;
}

/**
 * Update shipping information in the confirmation page
 * @param {Object} userProfile - User profile data
 * @param {Object} shipping - Shipping data
 */
function updateShippingInfo(userProfile, shipping) {
  const shippingInfoContainer = document.querySelector('.shipping-info');
  if (!shippingInfoContainer || !userProfile) return;
  
  const fullName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
  const address = userProfile.address || '';
  const apartment = userProfile.apartment ? `${userProfile.apartment}` : '';
  const cityStateZip = [
    userProfile.city || '',
    userProfile.state || '',
    userProfile.zipCode || ''
  ].filter(Boolean).join(', ');
  const country = userProfile.country || '';
  const phone = userProfile.phone || '';
  const email = userProfile.email || '';
  
  shippingInfoContainer.innerHTML = `
    <p class="font-medium">${fullName}</p>
    <p>${address}</p>
    ${apartment ? `<p>${apartment}</p>` : ''}
    <p>${cityStateZip}</p>
    <p>${country}</p>
    <p class="mt-4">Phone: ${phone}</p>
    <p>Email: ${email}</p>
  `;
  
  // Update delivery method
  const deliveryMethodElement = document.querySelector('.delivery-method');
  if (deliveryMethodElement && shipping) {
    deliveryMethodElement.textContent = shipping.name;
  }
  
  // Update estimated delivery date
  const estimatedDeliveryElement = document.querySelector('.estimated-delivery');
  if (estimatedDeliveryElement && shipping) {
    estimatedDeliveryElement.textContent = shipping.estimatedDelivery;
  }
}

/**
 * Update payment information in the confirmation page
 * @param {Object} payment - Payment data
 * @param {Object} userProfile - User profile data
 */
function updatePaymentInfo(payment, userProfile) {
  const paymentInfoContainer = document.querySelector('.payment-info');
  if (!paymentInfoContainer || !payment) return;
  
  let paymentHTML = '';
  
  if (payment.method === 'credit-card') {
    paymentHTML = `
      <div class="flex items-center">
        <i class="fab fa-cc-visa text-blue-800 text-xl mr-2"></i>
        <span>Credit Card ending in ${payment.lastFour}</span>
      </div>
    `;
  } else if (payment.method === 'paypal') {
    paymentHTML = `
      <div class="flex items-center">
        <i class="fab fa-paypal text-blue-600 text-xl mr-2"></i>
        <span>PayPal</span>
      </div>
    `;
  } else {
    paymentHTML = `
      <div class="flex items-center">
        <i class="fas fa-money-bill-wave text-green-600 text-xl mr-2"></i>
        <span>Other Payment Method</span>
      </div>
    `;
  }
  
  paymentHTML += `<p>Billing Address: Same as shipping</p>`;
  
  paymentInfoContainer.innerHTML = paymentHTML;
}

/**
 * Update order summary in the confirmation page
 * @param {Object} orderData - Order data
 */
function updateOrderSummary(orderData) {
  const subtotalElement = document.getElementById('order-subtotal');
  const shippingElement = document.getElementById('order-shipping');
  const taxElement = document.getElementById('order-tax');
  const totalElement = document.getElementById('order-total');
  
  if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return;
  
  // Calculate order totals
  const totals = calculateOrderTotals(orderData.items, orderData.shipping);
  
  // Update the display
  subtotalElement.textContent = `$${totals.subtotal.toFixed(2)}`;
  
  // Show 'Free' if shipping is zero, otherwise show the cost
  if (totals.shipping === 0) {
    shippingElement.textContent = 'Free';
  } else {
    shippingElement.textContent = `$${totals.shipping.toFixed(2)}`;
  }
  
  taxElement.textContent = `$${totals.tax.toFixed(2)}`;
  totalElement.textContent = `$${totals.total.toFixed(2)}`;
}

// Initialize confirmation page when DOM is loaded
document.addEventListener('DOMContentLoaded', initConfirmation);

// Export functions for use in other files
export {
  initConfirmation
};
