/**
 * ShilpoKotha Order Details
 * This script handles the order details page functionality
 */

import { auth, db, getCurrentUser } from './firebase-config.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { addToCart } from './local-storage.js';
import { updateCartCount } from './header-manager.js';

// DOM Elements
let loadingState;
let notLoggedInState;
let orderNotFoundState;
let orderDetailsState;
let orderNumber;
let orderDate;
let orderStatus;
let orderItemsContainer;
let orderSubtotal;
let orderShipping;
let orderTax;
let orderDiscount;
let orderTotal;
let shippingName;
let shippingAddress1;
let shippingAddress2;
let shippingCityStateZip;
let shippingCountry;
let shippingPhone;
let paymentMethod;
let paymentCard;
let paymentUpi;
let paymentUpiId;
let paymentBilling;
let trackPackageBtn;
let cancelOrderBtn;
let reorderBtn;
let contactSupportBtn;
let timelineOrderPlaced;
let timelinePayment;
let timelineProcessing;
let timelineShipped;
let timelineDelivered;
let paymentDot;
let processingDot;
let shippedDot;
let deliveredDot;

// State
let currentUser = null;
let currentOrder = null;
let currentOrderId = null;

/**
 * Initialize the order details page
 */
export async function initOrderDetailsPage() {
  // Get DOM elements
  loadingState = document.getElementById('loading-state');
  notLoggedInState = document.getElementById('not-logged-in');
  orderNotFoundState = document.getElementById('order-not-found');
  orderDetailsState = document.getElementById('order-details');
  orderNumber = document.getElementById('order-number');
  orderDate = document.getElementById('order-date');
  orderStatus = document.getElementById('order-status');
  orderItemsContainer = document.getElementById('order-items-container');
  orderSubtotal = document.getElementById('order-subtotal');
  orderShipping = document.getElementById('order-shipping');
  orderTax = document.getElementById('order-tax');
  orderDiscount = document.getElementById('order-discount');
  orderTotal = document.getElementById('order-total');
  shippingName = document.getElementById('shipping-name');
  shippingAddress1 = document.getElementById('shipping-address-1');
  shippingAddress2 = document.getElementById('shipping-address-2');
  shippingCityStateZip = document.getElementById('shipping-city-state-zip');
  shippingCountry = document.getElementById('shipping-country');
  shippingPhone = document.getElementById('shipping-phone');
  paymentMethod = document.getElementById('payment-method');
  paymentCard = document.getElementById('payment-card');
  paymentUpi = document.getElementById('payment-upi');
  paymentUpiId = document.getElementById('payment-upi-id');
  paymentBilling = document.getElementById('payment-billing');
  trackPackageBtn = document.getElementById('track-package-btn');
  cancelOrderBtn = document.getElementById('cancel-order-btn');
  reorderBtn = document.getElementById('reorder-btn');
  contactSupportBtn = document.getElementById('contact-support-btn');
  timelineOrderPlaced = document.getElementById('timeline-order-placed');
  timelinePayment = document.getElementById('timeline-payment');
  timelineProcessing = document.getElementById('timeline-processing');
  timelineShipped = document.getElementById('timeline-shipped');
  timelineDelivered = document.getElementById('timeline-delivered');
  paymentDot = document.getElementById('payment-dot');
  processingDot = document.getElementById('processing-dot');
  shippedDot = document.getElementById('shipped-dot');
  deliveredDot = document.getElementById('delivered-dot');
  
  // Get current user
  currentUser = await getCurrentUser();
  
  if (!currentUser) {
    showNotLoggedInState();
    return;
  }
  
  // Get order ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  currentOrderId = urlParams.get('id');
  
  if (!currentOrderId) {
    showOrderNotFoundState();
    return;
  }
  
  // Load order details
  await loadOrderDetails();
  
  // Set up event listeners
  setupEventListeners();
  
  // Update cart count
  updateCartCount();
}

/**
 * Load order details
 */
async function loadOrderDetails() {
  try {
    // Get order document
    const orderDoc = await getDoc(doc(db, 'orders', currentOrderId));
    
    if (!orderDoc.exists()) {
      showOrderNotFoundState();
      return;
    }
    
    // Get order data
    currentOrder = orderDoc.data();
    
    // Check if this order belongs to the current user
    if (currentOrder.userId !== currentUser.uid) {
      showOrderNotFoundState();
      return;
    }
    
    // Update UI with order data
    updateOrderUI();
    
    // Show order details
    showOrderDetailsState();
  } catch (error) {
    console.error('Error loading order details:', error);
    showOrderNotFoundState();
  }
}

/**
 * Update the UI with order data
 */
function updateOrderUI() {
  // Update order header
  orderNumber.textContent = currentOrderId.slice(-8).toUpperCase();
  
  // Format date
  const orderDateTime = currentOrder.createdAt ? new Date(currentOrder.createdAt.seconds * 1000) : new Date();
  const formattedDate = orderDateTime.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  orderDate.textContent = formattedDate;
  
  // Update order status
  orderStatus.textContent = currentOrder.status || 'Processing';
  
  // Set status color
  switch (currentOrder.status) {
    case 'Delivered':
      orderStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800';
      break;
    case 'Shipped':
      orderStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';
      break;
    case 'Cancelled':
      orderStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800';
      break;
    case 'Processing':
    default:
      orderStatus.className = 'px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800';
      break;
  }
  
  // Update order items
  updateOrderItems();
  
  // Update order summary
  orderSubtotal.textContent = `₹${currentOrder.subtotal.toFixed(2)}`;
  orderShipping.textContent = `₹${currentOrder.shipping.toFixed(2)}`;
  orderTax.textContent = `₹${currentOrder.tax.toFixed(2)}`;
  
  if (currentOrder.discount > 0) {
    orderDiscount.textContent = `-₹${currentOrder.discount.toFixed(2)}`;
  } else {
    orderDiscount.textContent = '₹0.00';
  }
  
  orderTotal.textContent = `₹${currentOrder.total.toFixed(2)}`;
  
  // Update shipping information
  const shipping = currentOrder.shipping_address || {};
  shippingName.textContent = shipping.name || '';
  shippingAddress1.textContent = shipping.line1 || '';
  
  if (shipping.line2) {
    shippingAddress2.textContent = shipping.line2;
    shippingAddress2.classList.remove('hidden');
  } else {
    shippingAddress2.classList.add('hidden');
  }
  
  const cityStateZip = [
    shipping.city || '',
    shipping.state || '',
    shipping.zip || ''
  ].filter(Boolean).join(', ');
  
  shippingCityStateZip.textContent = cityStateZip;
  shippingCountry.textContent = shipping.country || '';
  shippingPhone.textContent = shipping.phone || '';
  
  // Update payment information
  const payment = currentOrder.payment || {};
  paymentMethod.textContent = payment.method || 'Credit Card';
  
  if (payment.method === 'Credit Card' || payment.method === 'Debit Card') {
    paymentCard.textContent = payment.card_last4 ? `•••• •••• •••• ${payment.card_last4}` : '•••• •••• •••• ****';
    paymentCard.parentElement.classList.remove('hidden');
    paymentUpi.classList.add('hidden');
  } else if (payment.method === 'UPI') {
    paymentUpi.classList.remove('hidden');
    paymentUpiId.textContent = payment.upi_id || 'user@bank';
    paymentCard.parentElement.classList.add('hidden');
  } else {
    paymentCard.parentElement.classList.add('hidden');
    paymentUpi.classList.add('hidden');
  }
  
  paymentBilling.textContent = payment.billing_same_as_shipping ? 'Same as shipping address' : 'Different billing address';
  
  // Update timeline
  updateOrderTimeline();
  
  // Update action buttons
  updateActionButtons();
}

/**
 * Update order items
 */
function updateOrderItems() {
  // Clear container
  orderItemsContainer.innerHTML = '';
  
  // Add each item
  if (currentOrder.items && currentOrder.items.length > 0) {
    currentOrder.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'flex flex-col md:grid md:grid-cols-12 p-4 gap-4';
      
      const itemTotal = (item.price * item.quantity).toFixed(2);
      
      itemElement.innerHTML = `
        <div class="md:col-span-6 flex">
          <div class="w-20 h-20 flex-shrink-0 bg-secondary rounded-md overflow-hidden">
            <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.name}" class="w-full h-full object-cover">
          </div>
          <div class="ml-4">
            <h3 class="font-medium">${item.name}</h3>
            <p class="text-sm text-text-light">${item.variant || ''}</p>
            <a href="product.html?id=${item.id}" class="text-xs text-primary hover:underline mt-1 inline-block">View Product</a>
          </div>
        </div>
        <div class="md:col-span-2 flex md:justify-center md:items-center">
          <span class="text-sm md:hidden font-medium mr-2">Price:</span>
          <span>₹${item.price.toFixed(2)}</span>
        </div>
        <div class="md:col-span-2 flex md:justify-center md:items-center">
          <span class="text-sm md:hidden font-medium mr-2">Quantity:</span>
          <span>${item.quantity}</span>
        </div>
        <div class="md:col-span-2 flex md:justify-center md:items-center font-medium">
          <span class="text-sm md:hidden font-medium mr-2">Total:</span>
          <span>₹${itemTotal}</span>
        </div>
      `;
      
      orderItemsContainer.appendChild(itemElement);
    });
  } else {
    // No items
    const noItems = document.createElement('div');
    noItems.className = 'p-4 text-center text-text-light';
    noItems.textContent = 'No items in this order';
    orderItemsContainer.appendChild(noItems);
  }
}

/**
 * Update order timeline
 */
function updateOrderTimeline() {
  // Order placed date
  const orderPlacedDate = currentOrder.createdAt ? new Date(currentOrder.createdAt.seconds * 1000) : new Date();
  timelineOrderPlaced.textContent = formatDate(orderPlacedDate);
  
  // Get timeline events
  const events = currentOrder.timeline || [];
  
  // Payment confirmed
  const paymentEvent = events.find(event => event.status === 'Payment Confirmed');
  if (paymentEvent) {
    timelinePayment.textContent = formatDate(new Date(paymentEvent.timestamp.seconds * 1000));
    paymentDot.classList.add('completed');
  } else {
    timelinePayment.textContent = 'Pending';
    paymentDot.classList.remove('completed');
  }
  
  // Order processing
  const processingEvent = events.find(event => event.status === 'Processing');
  if (processingEvent) {
    timelineProcessing.textContent = formatDate(new Date(processingEvent.timestamp.seconds * 1000));
    processingDot.classList.add('completed');
  } else {
    timelineProcessing.textContent = 'Pending';
    processingDot.classList.remove('completed');
  }
  
  // Shipped
  const shippedEvent = events.find(event => event.status === 'Shipped');
  if (shippedEvent) {
    timelineShipped.textContent = formatDate(new Date(shippedEvent.timestamp.seconds * 1000));
    shippedDot.classList.add('completed');
    
    // Show tracking button
    if (shippedEvent.tracking_number) {
      trackPackageBtn.classList.remove('hidden');
      trackPackageBtn.setAttribute('data-tracking', shippedEvent.tracking_number);
      trackPackageBtn.setAttribute('data-carrier', shippedEvent.carrier || 'default');
    }
  } else {
    timelineShipped.textContent = 'Pending';
    shippedDot.classList.remove('completed');
  }
  
  // Delivered
  const deliveredEvent = events.find(event => event.status === 'Delivered');
  if (deliveredEvent) {
    timelineDelivered.textContent = formatDate(new Date(deliveredEvent.timestamp.seconds * 1000));
    deliveredDot.classList.add('completed');
  } else {
    timelineDelivered.textContent = 'Pending';
    deliveredDot.classList.remove('completed');
  }
  
  // Set active dot based on current status
  switch (currentOrder.status) {
    case 'Payment Confirmed':
      paymentDot.classList.add('active');
      break;
    case 'Processing':
      processingDot.classList.add('active');
      break;
    case 'Shipped':
      shippedDot.classList.add('active');
      break;
    case 'Delivered':
      deliveredDot.classList.add('active');
      break;
  }
}

/**
 * Update action buttons
 */
function updateActionButtons() {
  // Cancel order button
  if (currentOrder.status === 'Processing' || currentOrder.status === 'Payment Confirmed') {
    cancelOrderBtn.classList.remove('hidden');
  } else {
    cancelOrderBtn.classList.add('hidden');
  }
  
  // Track package button is handled in updateOrderTimeline()
  
  // Reorder button
  if (currentOrder.status === 'Cancelled') {
    reorderBtn.textContent = 'Order Again';
  } else {
    reorderBtn.textContent = 'Reorder';
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Track package button
  if (trackPackageBtn) {
    trackPackageBtn.addEventListener('click', handleTrackPackage);
  }
  
  // Cancel order button
  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', handleCancelOrder);
  }
  
  // Reorder button
  if (reorderBtn) {
    reorderBtn.addEventListener('click', handleReorder);
  }
  
  // Contact support button
  if (contactSupportBtn) {
    contactSupportBtn.addEventListener('click', handleContactSupport);
  }
}

/**
 * Handle track package button click
 */
function handleTrackPackage() {
  const trackingNumber = trackPackageBtn.getAttribute('data-tracking');
  const carrier = trackPackageBtn.getAttribute('data-carrier');
  
  if (!trackingNumber) {
    showNotification('Tracking information not available', 'error');
    return;
  }
  
  // Determine tracking URL based on carrier
  let trackingUrl = '';
  
  switch (carrier.toLowerCase()) {
    case 'fedex':
      trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
      break;
    case 'dhl':
      trackingUrl = `https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;
      break;
    case 'bluedart':
      trackingUrl = `https://www.bluedart.com/tracking?trackfor=${trackingNumber}`;
      break;
    case 'dtdc':
      trackingUrl = `https://www.dtdc.in/tracking/tracking_results.asp?TrkType=Tracking&TrkNo=${trackingNumber}`;
      break;
    default:
      // Generic tracking URL or default to a major carrier
      trackingUrl = `https://www.shiprocket.in/shipment-tracking/?tracking_id=${trackingNumber}`;
      break;
  }
  
  // Open tracking URL in a new tab
  window.open(trackingUrl, '_blank');
}

/**
 * Handle cancel order button click
 */
async function handleCancelOrder() {
  if (!currentOrderId) return;
  
  // Show confirmation dialog
  const confirmed = confirm('Are you sure you want to cancel this order? This action cannot be undone.');
  
  if (!confirmed) return;
  
  try {
    // Update order status in Firestore
    await updateDoc(doc(db, 'orders', currentOrderId), {
      status: 'Cancelled',
      timeline: [
        ...(currentOrder.timeline || []),
        {
          status: 'Cancelled',
          timestamp: new Date(),
          note: 'Order cancelled by customer'
        }
      ]
    });
    
    // Reload order details
    await loadOrderDetails();
    
    showNotification('Order cancelled successfully', 'success');
  } catch (error) {
    console.error('Error cancelling order:', error);
    showNotification('Failed to cancel order', 'error');
  }
}

/**
 * Handle reorder button click
 */
async function handleReorder() {
  if (!currentOrder || !currentOrder.items || currentOrder.items.length === 0) {
    showNotification('No items to reorder', 'error');
    return;
  }
  
  try {
    // Add each item to cart
    currentOrder.items.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      });
    });
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showNotification('Items added to cart', 'success');
    
    // Redirect to cart page
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 1500);
  } catch (error) {
    console.error('Error reordering items:', error);
    showNotification('Failed to add items to cart', 'error');
  }
}

/**
 * Handle contact support button click
 */
function handleContactSupport() {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
      <div class="bg-primary px-6 py-4">
        <h3 class="text-lg font-medium text-white">Contact Support</h3>
      </div>
      <div class="px-6 py-4">
        <p class="mb-4">How would you like to contact our customer support team?</p>
        <div class="space-y-3">
          <a href="mailto:support@shilpokotha.com?subject=Order%20${currentOrderId.slice(-8).toUpperCase()}" class="flex items-center p-3 bg-secondary bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-all">
            <i class="fas fa-envelope text-primary text-xl mr-3"></i>
            <div>
              <h4 class="font-medium">Email Support</h4>
              <p class="text-sm text-text-light">support@shilpokotha.com</p>
            </div>
          </a>
          
          <a href="tel:+919876543210" class="flex items-center p-3 bg-secondary bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-all">
            <i class="fas fa-phone-alt text-primary text-xl mr-3"></i>
            <div>
              <h4 class="font-medium">Phone Support</h4>
              <p class="text-sm text-text-light">+91 9876543210</p>
            </div>
          </a>
          
          <button id="live-chat-btn" class="flex items-center w-full text-left p-3 bg-secondary bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-all">
            <i class="fas fa-comments text-primary text-xl mr-3"></i>
            <div>
              <h4 class="font-medium">Live Chat</h4>
              <p class="text-sm text-text-light">Chat with a support agent</p>
            </div>
          </button>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button id="close-support-modal" class="px-4 py-2 border border-secondary-dark text-text-dark rounded-md text-sm hover:bg-secondary transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(modal);
  
  // Add event listeners
  const closeButton = modal.querySelector('#close-support-modal');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  const liveChatButton = modal.querySelector('#live-chat-btn');
  liveChatButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    showNotification('Live chat is coming soon!', 'info');
  });
}

/**
 * Format date
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Show loading state
 */
function showLoadingState() {
  loadingState.classList.remove('hidden');
  notLoggedInState.classList.add('hidden');
  orderNotFoundState.classList.add('hidden');
  orderDetailsState.classList.add('hidden');
}

/**
 * Show not logged in state
 */
function showNotLoggedInState() {
  loadingState.classList.add('hidden');
  notLoggedInState.classList.remove('hidden');
  orderNotFoundState.classList.add('hidden');
  orderDetailsState.classList.add('hidden');
}

/**
 * Show order not found state
 */
function showOrderNotFoundState() {
  loadingState.classList.add('hidden');
  notLoggedInState.classList.add('hidden');
  orderNotFoundState.classList.remove('hidden');
  orderDetailsState.classList.add('hidden');
}

/**
 * Show order details state
 */
function showOrderDetailsState() {
  loadingState.classList.add('hidden');
  notLoggedInState.classList.add('hidden');
  orderNotFoundState.classList.add('hidden');
  orderDetailsState.classList.remove('hidden');
}

/**
 * Show a notification
 * @param {string} message - The message to show
 * @param {string} type - The type of notification ('success', 'error', or 'info')
 */
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  
  // Set notification color based on type
  let bgColor, textColor;
  switch (type) {
    case 'error':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      break;
    case 'info':
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      break;
    case 'success':
    default:
      bgColor = 'bg-green-500';
      textColor = 'text-white';
      break;
  }
  
  notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${bgColor} ${textColor} transition-all transform translate-y-0 opacity-100 z-50`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initOrderDetailsPage);
