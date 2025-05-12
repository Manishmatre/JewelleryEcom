/**
 * ShilpoKotha Product Page Functionality 
 * This file handles the product detail page functionality
 */

import { addToCart } from './local-storage.js';
import { updateCartCount } from './header-manager.js';

document.addEventListener('DOMContentLoaded', function() {
  // Add to Cart button functionality
  const addToCartButton = document.querySelector('.add-to-cart-btn');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', function() {
      // Get product details
      const productId = 'product-' + Math.random().toString(36).substr(2, 9); // Generate a random ID
      const productName = document.querySelector('.product-title').textContent.trim();
      const productPrice = parseFloat(document.querySelector('.product-price').textContent.replace('₹', ''));
      const productImage = document.querySelector('.product-image').src;
      const quantity = parseInt(document.querySelector('.quantity-input').value);
      
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage
      };
      
      const result = addToCart(product, quantity);
      
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
  }
  
  // Quantity buttons functionality
  const quantityDecrease = document.querySelector('.quantity-decrease');
  const quantityIncrease = document.querySelector('.quantity-increase');
  const quantityInput = document.querySelector('.quantity-input');
  
  if (quantityDecrease && quantityInput) {
    quantityDecrease.addEventListener('click', function() {
      let quantity = parseInt(quantityInput.value);
      if (quantity > 1) {
        quantityInput.value = quantity - 1;
      }
    });
  }
  
  if (quantityIncrease && quantityInput) {
    quantityIncrease.addEventListener('click', function() {
      let quantity = parseInt(quantityInput.value);
      quantityInput.value = quantity + 1;
    });
  }
});
