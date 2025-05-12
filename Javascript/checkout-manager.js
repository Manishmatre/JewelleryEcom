/**
 * ShilpoKotha Checkout Manager
 * This file handles checkout operations and UI updates for the ShilpoKotha jewelry e-commerce site
 */

import { getCart, clearCart, getCartTotalQuantity, getCartTotalPrice } from './cart-handler.js';
import { getAllProducts } from './products-data-additional.js';

// Debug flag - set to true to see console logs
const DEBUG = true;

// Shipping options and their costs
const SHIPPING_OPTIONS = {
  standard: {
    name: 'Standard Shipping',
    description: 'Delivery in 3-5 business days',
    cost: 375.00
  },
  express: {
    name: 'Express Shipping',
    description: 'Delivery in 1-2 business days',
    cost: 1125.00
  }
};

// Tax rate (10%)
const TAX_RATE = 0.10;

// Current selected shipping method
let currentShipping = 'standard';

/**
 * Initialize checkout page
 */
function initCheckout() {
  if (DEBUG) console.log('Initializing checkout page');
  
  // Load cart items
  loadCartItems();
  
  // Load user profile if available
  loadUserProfile();
  
  // Set up event listeners
  setupEventListeners();
  
  // Update order summary
  updateOrderSummary();
}

/**
 * Load cart items into the order summary
 */
function loadCartItems() {
  const orderItemsContainer = document.getElementById('order-items');
  if (!orderItemsContainer) {
    if (DEBUG) console.error('Order items container not found');
    return;
  }
  
  const cart = getCart();
  const allProducts = getAllProducts();
  
  if (cart.length === 0) {
    // Cart is empty, redirect to cart page
    window.location.href = 'cart.html';
    return;
  }
  
  let orderItemsHTML = '';
  
  cart.forEach(cartItem => {
    // Find the product details
    const product = allProducts.find(p => p.id === cartItem.productId);
    if (!product) {
      if (DEBUG) console.log(`Product not found for ID: ${cartItem.productId}`);
      return; // Skip this item
    }
    
    const itemTotal = (product.price * cartItem.quantity).toFixed(2);
    
    orderItemsHTML += `
      <div class="flex items-center justify-between pb-4 border-b border-secondary-dark">
        <div class="flex items-center">
          <div class="w-16 h-16 flex-shrink-0 bg-secondary rounded-md overflow-hidden mr-4">
            <img src="${product.image || 'images/product-placeholder.jpg'}" alt="${product.name}" class="w-full h-full object-cover">
          </div>
          <div>
            <h3 class="font-medium text-text-dark">${product.name}</h3>
            <p class="text-xs text-text-light">${product.category || ''}</p>
            <p class="text-xs text-text-light">Qty: ${cartItem.quantity}</p>
          </div>
        </div>
        <span class="font-medium">₹${itemTotal}</span>
      </div>
    `;
  });
  
  orderItemsContainer.innerHTML = orderItemsHTML;
}

/**
 * Load user profile information into the checkout form
 */
function loadUserProfile() {
  try {
    // Try to get user profile from localStorage
    const userProfileStr = localStorage.getItem('shilpokotha_user_profile');
    if (!userProfileStr) return;
    
    const userProfile = JSON.parse(userProfileStr);
    if (!userProfile) return;
    
    // Fill in the form fields with user data
    if (userProfile.email) {
      const emailField = document.getElementById('email');
      if (emailField) emailField.value = userProfile.email;
    }
    
    if (userProfile.firstName) {
      const firstNameField = document.getElementById('firstName');
      if (firstNameField) firstNameField.value = userProfile.firstName;
    }
    
    if (userProfile.lastName) {
      const lastNameField = document.getElementById('lastName');
      if (lastNameField) lastNameField.value = userProfile.lastName;
    }
    
    if (userProfile.address) {
      const addressField = document.getElementById('address');
      if (addressField) addressField.value = userProfile.address;
    }
    
    if (userProfile.apartment) {
      const apartmentField = document.getElementById('apartment');
      if (apartmentField) apartmentField.value = userProfile.apartment;
    }
    
    if (userProfile.city) {
      const cityField = document.getElementById('city');
      if (cityField) cityField.value = userProfile.city;
    }
    
    if (userProfile.country) {
      const countryField = document.getElementById('country');
      if (countryField) countryField.value = userProfile.country;
    }
    
    if (userProfile.state) {
      const stateField = document.getElementById('state');
      if (stateField) stateField.value = userProfile.state;
    }
    
    if (userProfile.zipCode) {
      const zipCodeField = document.getElementById('zipCode');
      if (zipCodeField) zipCodeField.value = userProfile.zipCode;
    }
    
    if (userProfile.phone) {
      const phoneField = document.getElementById('phone');
      if (phoneField) phoneField.value = userProfile.phone;
    }
    
    if (DEBUG) console.log('User profile loaded successfully');
  } catch (error) {
    if (DEBUG) console.error('Error loading user profile:', error);
  }
}

/**
 * Set up event listeners for the checkout page
 */
function setupEventListeners() {
  // Shipping method selection
  const shippingOptions = document.querySelectorAll('input[name="shipping"]');
  shippingOptions.forEach(option => {
    option.addEventListener('change', function() {
      currentShipping = this.value;
      updateOrderSummary();
    });
  });
  
  // Billing address toggle
  const billingSameCheckbox = document.getElementById('billing-same');
  const billingAddressSection = document.getElementById('billing-address');
  
  if (billingSameCheckbox && billingAddressSection) {
    billingSameCheckbox.addEventListener('change', function() {
      if (this.checked) {
        billingAddressSection.classList.add('hidden');
      } else {
        billingAddressSection.classList.remove('hidden');
      }
    });
  }
  
  // Payment method toggle
  const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
  const creditCardForm = document.querySelector('.credit-card-form');
  
  if (paymentMethods && creditCardForm) {
    paymentMethods.forEach(method => {
      method.addEventListener('change', function() {
        if (this.id === 'credit-card') {
          creditCardForm.classList.remove('hidden');
        } else {
          creditCardForm.classList.add('hidden');
        }
      });
    });
  }
  
  // Form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Save user profile for future checkouts
      saveUserProfile();
      
      // Process the order (in a real app, this would send data to a server)
      processOrder();
    });
  }
}

/**
 * Save user profile to localStorage
 */
function saveUserProfile() {
  try {
    const userProfile = {
      email: document.getElementById('email')?.value,
      firstName: document.getElementById('firstName')?.value,
      lastName: document.getElementById('lastName')?.value,
      address: document.getElementById('address')?.value,
      apartment: document.getElementById('apartment')?.value,
      city: document.getElementById('city')?.value,
      country: document.getElementById('country')?.value,
      state: document.getElementById('state')?.value,
      zipCode: document.getElementById('zipCode')?.value,
      phone: document.getElementById('phone')?.value
    };
    
    localStorage.setItem('shilpokotha_user_profile', JSON.stringify(userProfile));
    if (DEBUG) console.log('User profile saved successfully');
  } catch (error) {
    if (DEBUG) console.error('Error saving user profile:', error);
  }
}

/**
 * Process the order
 */
function processOrder() {
  if (DEBUG) console.log('Processing order...');
  
  // Show loading state
  const placeOrderButton = document.querySelector('button[type="submit"]');
  if (placeOrderButton) {
    const originalText = placeOrderButton.innerHTML;
    placeOrderButton.disabled = true;
    placeOrderButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    
    // Simulate order processing
    setTimeout(() => {
      // Clear the cart
      clearCart();
      
      // Redirect to confirmation page
      window.location.href = 'confirmation.html';
    }, 2000);
  }
}

/**
 * Update the order summary with current cart and shipping information
 */
function updateOrderSummary() {
  const subtotalElement = document.getElementById('order-subtotal');
  const shippingElement = document.getElementById('order-shipping');
  const taxElement = document.getElementById('order-tax');
  const totalElement = document.getElementById('order-total');
  
  if (!subtotalElement || !shippingElement || !taxElement || !totalElement) {
    if (DEBUG) console.error('Order summary elements not found');
    return;
  }
  
  const allProducts = getAllProducts();
  const subtotal = getCartTotalPrice(allProducts);
  const shipping = SHIPPING_OPTIONS[currentShipping].cost;
  const tax = (subtotal + shipping) * TAX_RATE;
  const total = subtotal + shipping + tax;
  
  subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
  shippingElement.textContent = `₹${shipping.toFixed(2)}`;
  taxElement.textContent = `₹${tax.toFixed(2)}`;
  totalElement.textContent = `₹${total.toFixed(2)}`;
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', initCheckout);

// Export functions for use in other files
export {
  initCheckout,
  updateOrderSummary
};
