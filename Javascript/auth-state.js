/**
 * ShilpoKotha Authentication State Manager
 * This file handles checking and updating the authentication state across all pages
 */

import { getCurrentUser } from './firebase-config.js';
import { getCurrentUserProfile } from './local-storage.js';

// DOM elements that will be updated based on auth state
const authElements = {
  // Account icon/link in the header
  accountLink: document.querySelector('a[href="profile.html"]'),
  accountLabel: document.querySelector('.account-label'),
  
  // User-specific elements that should only be shown when logged in
  userOnlyElements: document.querySelectorAll('.user-only'),
  
  // Guest-specific elements that should only be shown when not logged in
  guestOnlyElements: document.querySelectorAll('.guest-only'),
  
  // User display name elements
  userNameElements: document.querySelectorAll('.user-name')
};

/**
 * Update UI elements based on authentication state
 * @param {Object} user - The Firebase user object or null if not logged in
 * @param {Object} profile - The user profile from local storage or null if not found
 */
function updateUIForAuthState(user, profile) {
  if (user) {
    // User is logged in
    
    // Update account link
    if (authElements.accountLink) {
      // Change icon color to indicate logged in state
      const accountIcon = authElements.accountLink.querySelector('i');
      if (accountIcon) {
        accountIcon.classList.remove('text-text-dark');
        accountIcon.classList.add('text-primary');
      }
      
      // Update account label to show 'Profile'
      if (authElements.accountLabel) {
        authElements.accountLabel.textContent = 'Profile';
      }
      
      // Update href to ensure it goes to profile page
      authElements.accountLink.href = 'profile.html';
    }
    
    // Show user-only elements
    authElements.userOnlyElements.forEach(el => {
      el.classList.remove('hidden');
    });
    
    // Hide guest-only elements
    authElements.guestOnlyElements.forEach(el => {
      el.classList.add('hidden');
    });
    
    // Update user name displays
    if (profile) {
      authElements.userNameElements.forEach(el => {
        el.textContent = profile.displayName || 'ShilpoKotha Customer';
      });
    }
  } else {
    // User is not logged in
    
    // Update account link
    if (authElements.accountLink) {
      // Reset icon color
      const accountIcon = authElements.accountLink.querySelector('i');
      if (accountIcon) {
        accountIcon.classList.remove('text-primary');
        accountIcon.classList.add('text-text-dark');
      }
      
      // Update account label to show 'Login'
      if (authElements.accountLabel) {
        authElements.accountLabel.textContent = 'Login';
      }
      
      // Update href to go to login page when not logged in
      authElements.accountLink.href = 'login.html';
    }
    
    // Hide user-only elements
    authElements.userOnlyElements.forEach(el => {
      el.classList.add('hidden');
    });
    
    // Show guest-only elements
    authElements.guestOnlyElements.forEach(el => {
      el.classList.remove('hidden');
    });
  }
}

/**
 * Check authentication state and update UI
 */
async function checkAuthState() {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      // User is logged in, get profile from local storage
      const profileResult = getCurrentUserProfile();
      const profile = profileResult.success ? profileResult.data : null;
      
      // Update UI
      updateUIForAuthState(user, profile);
    } else {
      // User is not logged in
      updateUIForAuthState(null, null);
    }
  } catch (error) {
    console.error('Error checking authentication state:', error);
    // Default to not logged in state on error
    updateUIForAuthState(null, null);
  }
}

// Check auth state when DOM is loaded
document.addEventListener('DOMContentLoaded', checkAuthState);

// Export for use in other files
export { checkAuthState, updateUIForAuthState };
