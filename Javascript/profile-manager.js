/**
 * ShilpoKotha Profile Manager
 * This script handles user profile functionality, including order history, addresses, and account settings
 */

import { auth, db, getCurrentUser } from './firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { updateCartCount, updateWishlistCount } from './header-manager.js';

// DOM Elements
let loadingState;
let notLoggedInState;
let profileInfo;
let userNameElement;
let userEmailElement;
let detailNameElement;
let detailEmailElement;
let detailPhoneElement;
let noAddressSection;
let savedAddressSection;
let addressLine1;
let addressLine2;
let addressCityStateZip;
let addressCountry;
let noOrdersSection;
let orderListSection;
let orderTemplate;

// Initialize the profile page
export async function initProfilePage() {
  // Get DOM elements
  loadingState = document.getElementById('loading-state');
  notLoggedInState = document.getElementById('not-logged-in');
  profileInfo = document.getElementById('profile-info');
  userNameElement = document.getElementById('user-name');
  userEmailElement = document.getElementById('user-email');
  detailNameElement = document.getElementById('detail-name');
  detailEmailElement = document.getElementById('detail-email');
  detailPhoneElement = document.getElementById('detail-phone');
  noAddressSection = document.getElementById('no-address');
  savedAddressSection = document.getElementById('saved-address');
  addressLine1 = document.getElementById('address-line1');
  addressLine2 = document.getElementById('address-line2');
  addressCityStateZip = document.getElementById('address-city-state-zip');
  addressCountry = document.getElementById('address-country');
  noOrdersSection = document.getElementById('no-orders');
  orderListSection = document.getElementById('order-list');
  orderTemplate = document.getElementById('order-template');
  
  // Set up event listeners
  setupEventListeners();
  
  // Check if user is logged in
  const user = await getCurrentUser();
  
  if (user) {
    // User is logged in
    await loadUserProfile(user);
    await loadOrderHistory(user.uid);
  } else {
    // User is not logged in
    showNotLoggedInState();
  }
  
  // Update cart and wishlist counts
  updateCartCount();
  updateWishlistCount();
}

// Set up event listeners
function setupEventListeners() {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
  
  const notificationsButton = document.getElementById('notifications-settings');
  if (notificationsButton) {
    notificationsButton.addEventListener('click', () => {
      showModal('Notification Settings', 'Notification preferences will be available soon.');
    });
  }
  
  const paymentMethodsButton = document.getElementById('payment-methods');
  if (paymentMethodsButton) {
    paymentMethodsButton.addEventListener('click', () => {
      showModal('Payment Methods', 'Payment method management will be available soon.');
    });
  }
}

// Handle user logout
async function handleLogout() {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error signing out:', error);
    showModal('Error', 'Failed to sign out. Please try again.');
  }
}

// Load user profile data
async function loadUserProfile(user) {
  try {
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Update UI with user data
      const displayName = userData.displayName || user.displayName || 'User';
      const email = user.email;
      const phone = userData.phone || 'Not provided';
      
      userNameElement.textContent = displayName;
      userEmailElement.textContent = email;
      detailNameElement.textContent = displayName;
      detailEmailElement.textContent = email;
      
      if (phone !== 'Not provided') {
        detailPhoneElement.textContent = phone;
        detailPhoneElement.classList.remove('text-gray-400');
      }
      
      // Handle address display
      if (userData.address) {
        showSavedAddress(userData.address);
      } else {
        showNoAddress();
      }
    } else {
      // User document doesn't exist, use auth data
      const displayName = user.displayName || 'User';
      userNameElement.textContent = displayName;
      userEmailElement.textContent = user.email;
      detailNameElement.textContent = displayName;
      detailEmailElement.textContent = user.email;
      
      showNoAddress();
    }
    
    // Show profile info section
    showProfileInfo();
  } catch (error) {
    console.error('Error loading user profile:', error);
    showModal('Error', 'Failed to load profile data. Please try again later.');
    showProfileInfo(); // Still show the profile section with limited data
  }
}

// Load order history
async function loadOrderHistory(userId) {
  try {
    // Query orders collection for this user
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    
    if (querySnapshot.empty) {
      // No orders found
      showNoOrders();
      return;
    }
    
    // Clear existing orders
    orderListSection.innerHTML = '';
    
    // Process each order
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      addOrderToList(doc.id, orderData);
    });
    
    // Show order list
    showOrderList();
  } catch (error) {
    console.error('Error loading order history:', error);
    showNoOrders();
  }
}

// Add an order to the order list
function addOrderToList(orderId, orderData) {
  // Clone the template
  const orderNode = orderTemplate.content.cloneNode(true);
  
  // Set order details
  orderNode.querySelector('.order-id').textContent = orderId.slice(-8).toUpperCase();
  
  // Format date
  const orderDate = orderData.createdAt ? new Date(orderData.createdAt.seconds * 1000) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  orderNode.querySelector('.order-date').textContent = formattedDate;
  
  // Set total
  orderNode.querySelector('.order-total').textContent = `₹${orderData.total.toFixed(2)}`;
  
  // Set status with appropriate color
  const statusElement = orderNode.querySelector('.order-status');
  statusElement.textContent = orderData.status || 'Processing';
  
  // Set status color based on status
  switch (orderData.status) {
    case 'Delivered':
      statusElement.classList.add('bg-green-100', 'text-green-800');
      break;
    case 'Shipped':
      statusElement.classList.add('bg-blue-100', 'text-blue-800');
      break;
    case 'Cancelled':
      statusElement.classList.add('bg-red-100', 'text-red-800');
      break;
    case 'Processing':
    default:
      statusElement.classList.add('bg-yellow-100', 'text-yellow-800');
      break;
  }
  
  // Add product thumbnails
  const itemsPreview = orderNode.querySelector('.order-items-preview');
  
  if (orderData.items && orderData.items.length > 0) {
    orderData.items.forEach(item => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'flex-shrink-0 w-12 h-12 bg-secondary rounded-md overflow-hidden border border-gray-200';
      
      const img = document.createElement('img');
      img.src = item.image || 'images/placeholder.jpg';
      img.alt = item.name || 'Product';
      img.className = 'w-full h-full object-cover';
      
      thumbnail.appendChild(img);
      itemsPreview.appendChild(thumbnail);
    });
  } else {
    // Fallback if no items
    const placeholder = document.createElement('div');
    placeholder.className = 'text-sm text-gray-500';
    placeholder.textContent = 'No items available';
    itemsPreview.appendChild(placeholder);
  }
  
  // Add event listeners
  const viewDetailsButton = orderNode.querySelector('.view-order-details');
  viewDetailsButton.addEventListener('click', () => {
    window.location.href = `order-details.html?id=${orderId}`;
  });
  
  const reorderButton = orderNode.querySelector('.reorder-button');
  reorderButton.addEventListener('click', () => {
    handleReorder(orderData.items);
  });
  
  // Add to the list
  orderListSection.appendChild(orderNode);
}

// Handle reordering items
function handleReorder(items) {
  if (!items || items.length === 0) {
    showModal('Error', 'Cannot reorder as the order contains no items.');
    return;
  }
  
  try {
    // Import cart functions
    import('./local-storage.js').then(module => {
      const { addToCart, getCart } = module;
      
      // Add each item to cart
      items.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        });
      });
      
      // Show success message
      showModal('Success', 'Items have been added to your cart.', () => {
        window.location.href = 'cart.html';
      });
    });
  } catch (error) {
    console.error('Error reordering items:', error);
    showModal('Error', 'Failed to add items to cart. Please try again.');
  }
}

// Show saved address
function showSavedAddress(address) {
  noAddressSection.classList.add('hidden');
  savedAddressSection.classList.remove('hidden');
  
  addressLine1.textContent = address.line1 || '';
  addressLine2.textContent = address.line2 || '';
  
  const cityStateZip = [
    address.city || '',
    address.state || '',
    address.zip || ''
  ].filter(Boolean).join(', ');
  
  addressCityStateZip.textContent = cityStateZip;
  addressCountry.textContent = address.country || '';
}

// Show no address state
function showNoAddress() {
  noAddressSection.classList.remove('hidden');
  savedAddressSection.classList.add('hidden');
}

// Show no orders state
function showNoOrders() {
  noOrdersSection.classList.remove('hidden');
  orderListSection.classList.add('hidden');
}

// Show order list
function showOrderList() {
  noOrdersSection.classList.add('hidden');
  orderListSection.classList.remove('hidden');
}

// Show loading state
function showLoadingState() {
  loadingState.classList.remove('hidden');
  notLoggedInState.classList.add('hidden');
  profileInfo.classList.add('hidden');
}

// Show not logged in state
function showNotLoggedInState() {
  loadingState.classList.add('hidden');
  notLoggedInState.classList.remove('hidden');
  profileInfo.classList.add('hidden');
}

// Show profile info
function showProfileInfo() {
  loadingState.classList.add('hidden');
  notLoggedInState.classList.add('hidden');
  profileInfo.classList.remove('hidden');
}

// Show a modal with a message
function showModal(title, message, callback) {
  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all';
  
  const modalHeader = document.createElement('div');
  modalHeader.className = 'brand-gradient px-6 py-4';
  modalHeader.innerHTML = `<h3 class="text-lg font-medium text-white">${title}</h3>`;
  
  const modalBody = document.createElement('div');
  modalBody.className = 'px-6 py-4';
  modalBody.innerHTML = `<p>${message}</p>`;
  
  const modalFooter = document.createElement('div');
  modalFooter.className = 'px-6 py-3 bg-gray-50 flex justify-end';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'px-4 py-2 bg-[#a39a7e] text-white rounded-md hover:bg-[#7a6f4e] transition-all';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
    if (typeof callback === 'function') {
      callback();
    }
  });
  
  // Assemble the modal
  modalFooter.appendChild(closeButton);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modal.appendChild(modalContent);
  
  // Add to the document
  document.body.appendChild(modal);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfilePage);
