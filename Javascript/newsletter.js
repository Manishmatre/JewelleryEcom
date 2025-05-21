/**
 * ShilpoKotha Newsletter Subscription
 * This script handles the newsletter subscription functionality
 */

import { db } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

/**
 * Initialize newsletter subscription functionality
 */
export function initNewsletter() {
  // Find all newsletter forms
  const newsletterForms = document.querySelectorAll('form.newsletter-form');
  
  // Add event listeners to each form
  newsletterForms.forEach(form => {
    form.addEventListener('submit', handleNewsletterSubmit);
  });
  
  // If no forms have the newsletter-form class, try to find forms with email inputs
  if (newsletterForms.length === 0) {
    const footerForms = document.querySelectorAll('footer form');
    footerForms.forEach(form => {
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput) {
        form.classList.add('newsletter-form');
        form.addEventListener('submit', handleNewsletterSubmit);
      }
    });
  }
}

/**
 * Handle newsletter form submission
 * @param {Event} event - The form submit event
 */
async function handleNewsletterSubmit(event) {
  event.preventDefault();
  
  // Get form and email input
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  
  if (!emailInput || !emailInput.value) {
    showNotification('Please enter your email address', 'error');
    return;
  }
  
  const email = emailInput.value.trim();
  
  // Validate email format
  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
  
  try {
    // Check if email already exists
    const subscribersRef = collection(db, 'newsletter_subscribers');
    const q = query(subscribersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      showNotification('You are already subscribed to our newsletter', 'info');
      resetForm();
      return;
    }
    
    // Add email to subscribers collection
    await addDoc(subscribersRef, {
      email,
      subscribed_at: new Date(),
      active: true,
      source: window.location.pathname
    });
    
    // Show success message
    showNotification('Thank you for subscribing to our newsletter!', 'success');
    
    // Reset form
    form.reset();
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    showNotification('Failed to subscribe. Please try again later.', 'error');
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
  
  /**
   * Reset form to original state
   */
  function resetForm() {
    form.reset();
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
document.addEventListener('DOMContentLoaded', initNewsletter);
