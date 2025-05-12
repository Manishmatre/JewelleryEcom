/**
 * ShilpoKotha Home Page Functionality
 * This file contains JavaScript functionality specific to the home page
 */

import { addToCart } from './local-storage.js';
import { updateCartCount } from './header-manager.js';

// Add event listeners to all Add to Cart buttons
document.addEventListener('DOMContentLoaded', function() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const productName = this.getAttribute('data-product-name');
      const productPrice = parseFloat(this.getAttribute('data-product-price'));
      const productImage = this.getAttribute('data-product-image');
      
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage
      };
      
      const result = addToCart(product, 1);
      
      if (result.success) {
        // Show success message
        alert(`${productName} added to cart!`);
        // Update cart count
        updateCartCount();
      } else {
        // Show error message
        alert(result.error || 'Failed to add item to cart. Please try again.');
      }
    });
  });
  
  // Countdown Timer Functionality
  function updateCountdown() {
    // Set the date we're counting down to (7 days from now)
    const now = new Date();
    const countdownDate = new Date(now);
    countdownDate.setDate(now.getDate() + 7); // Sale ends 7 days from now
    
    // Update the countdown every 1 second
    const countdownTimer = setInterval(function() {
      // Get current date and time
      const currentTime = new Date().getTime();
      
      // Find the distance between now and the countdown date
      const distance = countdownDate - currentTime;
      
      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Display the result with leading zeros
      document.getElementById('countdown-days').textContent = days < 10 ? '0' + days : days;
      document.getElementById('countdown-hours').textContent = hours < 10 ? '0' + hours : hours;
      document.getElementById('countdown-minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
      document.getElementById('countdown-seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
      
      // If the countdown is finished, display a message
      if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById('countdown-days').textContent = '00';
        document.getElementById('countdown-hours').textContent = '00';
        document.getElementById('countdown-minutes').textContent = '00';
        document.getElementById('countdown-seconds').textContent = '00';
      }
    }, 1000);
  }
  
  // Initialize countdown
  if (document.getElementById('countdown-timer')) {
    updateCountdown();
  }
});
