/**
 * ShilpoKotha Display All Products
 * This script displays all products from our database in the existing product grid
 */

import { getAllProducts } from './products-data-additional.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get the products container
  const productsContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
  
  // Get all products
  const allProducts = getAllProducts();
  
  // Clear existing product cards (keep the first one as template)
  const template = productsContainer.children[0].cloneNode(true);
  productsContainer.innerHTML = '';
  
  // Display all products
  allProducts.forEach(product => {
    // Clone the template
    const productCard = template.cloneNode(true);
    
    // Update product image
    const productImage = productCard.querySelector('img');
    if (productImage) {
      productImage.src = product.image;
      productImage.alt = product.name;
    }
    
    // Update product name
    const productName = productCard.querySelector('h3');
    if (productName) {
      productName.textContent = product.name;
    }
    
    // Update product links
    const productLinks = productCard.querySelectorAll('a');
    productLinks.forEach(link => {
      if (link.href.includes('product.html')) {
        link.href = `product.html?id=${product.id}`;
      }
    });
    
    // Update product description
    const productDescription = productCard.querySelector('p.text-sm.text-text-light.mb-2');
    if (productDescription) {
      productDescription.textContent = product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '');
    }
    
    // Update product price
    const productPrice = productCard.querySelector('.text-primary.font-semibold');
    if (productPrice) {
      productPrice.textContent = `$${product.price.toFixed(2)}`;
    }
    
    // Update original price if available
    const originalPrice = productCard.querySelector('.text-text-light.line-through');
    if (originalPrice && product.originalPrice) {
      originalPrice.textContent = `$${product.originalPrice.toFixed(2)}`;
      originalPrice.style.display = 'inline';
    } else if (originalPrice) {
      originalPrice.style.display = 'none';
    }
    
    // Update Add to Cart button
    const addToCartButton = productCard.querySelector('.add-to-cart');
    if (addToCartButton) {
      addToCartButton.dataset.productId = product.id;
      addToCartButton.dataset.productName = product.name;
      addToCartButton.dataset.productPrice = product.price;
    }
    
    // Update sale badge if available
    const saleBadge = productCard.querySelector('.absolute.top-3.left-3');
    if (saleBadge) {
      if (product.discount) {
        saleBadge.style.display = 'block';
        saleBadge.textContent = `-${product.discount}%`;
      } else {
        saleBadge.style.display = 'none';
      }
    }
    
    // Update rating stars
    const ratingStars = productCard.querySelectorAll('.text-yellow-400.text-xs.mb-1 i');
    if (ratingStars.length > 0) {
      // Reset all stars
      ratingStars.forEach(star => {
        star.className = 'far fa-star';
      });
      
      // Set full stars
      const fullStars = Math.floor(product.rating);
      for (let i = 0; i < fullStars && i < 5; i++) {
        ratingStars[i].className = 'fas fa-star';
      }
      
      // Set half star if needed
      if (product.rating % 1 >= 0.5 && fullStars < 5) {
        ratingStars[fullStars].className = 'fas fa-star-half-alt';
      }
    }
    
    // Update review count
    const reviewCount = productCard.querySelector('.text-xs.text-text-light.ml-1');
    if (reviewCount) {
      reviewCount.textContent = `(${product.reviews})`;
    }
    
    // Add the product card to the container
    productsContainer.appendChild(productCard);
  });
  
  // Update product count
  const productCountElement = document.querySelector('.text-text-light span');
  if (productCountElement) {
    productCountElement.textContent = allProducts.length;
  }
});
