/**
 * ShilpoKotha Order Confirmation Page Functionality
 * This file contains JavaScript functionality for the order confirmation page
 */

// Print order details
document.addEventListener('DOMContentLoaded', function() {
  const printButton = document.querySelector('.print-order');
  if (printButton) {
    printButton.addEventListener('click', function() {
      window.print();
    });
  }
});

// Simulate order tracking
const trackOrderButton = document.querySelector('a[href="#"]');
if (trackOrderButton) {
  trackOrderButton.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Order tracking feature would open here. This is just a demo.');
  });
}
