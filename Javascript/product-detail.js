/**
 * ShilpoKotha Product Page Functionality 
 * This file handles the product detail page functionality
 */

import { addToCart } from './local-storage.js';
import { updateCartCount } from './header-manager.js';
import { getAllProducts } from './products-data-additional.js';

/**
 * Update the main product details on the page
 * @param {Object} product - The product object
 */
function updateProductDetails(product) {
  // Update product badges
  const badgesContainer = document.getElementById('product-badges');
  if (badgesContainer) {
    const badges = [];
    if (product.bestSeller) badges.push('Best Seller');
    if (product.new) badges.push('New Arrival');
    if (product.featured) badges.push('Featured');
    
    badgesContainer.innerHTML = badges
      .map(badge => `<span class="inline-block bg-red-500 text-white text-xs font-medium px-2 py-1 rounded mb-2 mr-2">${badge}</span>`)
      .join('');
  }
  
  // Update product title
  const titleElement = document.querySelector('.product-title');
  if (titleElement) {
    titleElement.textContent = product.name;
  }
  
  // Update all instances of product name (including breadcrumb)
  document.querySelectorAll('.product-name').forEach(el => {
    el.textContent = product.name;
  });
  
  // Update price information
  const priceElement = document.querySelector('.product-price');
  if (priceElement) {
    const savings = product.originalPrice ? (product.originalPrice - product.price) : 0;
    const savingsPercent = product.originalPrice ? Math.round((savings / product.originalPrice) * 100) : 0;
    
    const priceHTML = `
      <span class="text-2xl font-bold text-primary">₹${product.price.toFixed(2)}</span>
      ${product.originalPrice ? `
        <span class="text-text-light line-through ml-2">₹${product.originalPrice.toFixed(2)}</span>
        <span class="text-green-600 text-sm ml-2">Save ₹${savings.toFixed(2)} (${savingsPercent}% OFF)</span>
      ` : ''}
    `;
    priceElement.innerHTML = priceHTML;
  }

  // Update rating
  const ratingContainer = document.querySelector('.product-rating');
  if (ratingContainer) {
    const fullStars = Math.floor(product.rating || 0);
    const hasHalfStar = (product.rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(product.rating || 0);
    
    const ratingHTML = `
      <div class="text-yellow-400 text-sm mr-2">
        ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
      </div>
      <span class="text-text-light text-sm">(${product.reviews || 0} reviews)</span>
    `;
    ratingContainer.innerHTML = ratingHTML;
  }

  // Update product description
  const descriptionElement = document.querySelector('.product-description');
  if (descriptionElement) {
    descriptionElement.textContent = product.description || 'No description available';
  }

  // Update availability
  const availabilityElement = document.querySelector('.product-availability');
  if (availabilityElement) {
    const inStock = product.stock > 0;
    availabilityElement.innerHTML = `
      <i class="fas ${inStock ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} mr-2"></i>
      <span class="${inStock ? 'text-green-600' : 'text-red-600'}">${inStock ? `In Stock (${product.stock} items left)` : 'Out of Stock'}</span>
    `;
  }

  // Update SKU
  const skuElement = document.querySelector('.product-sku');
  if (skuElement) {
    skuElement.textContent = product.id?.toUpperCase() || 'N/A';
  }

  // Update category
  const categoryElement = document.querySelector('.product-category');
  if (categoryElement) {
    categoryElement.textContent = product.category ? 
      product.category.charAt(0).toUpperCase() + product.category.slice(1) : 
      'N/A';
  }

  // Update brand
  const brandElement = document.querySelector('.product-brand');
  if (brandElement) {
    brandElement.textContent = product.brand || 'ShilpoKotha';
  }

  // Update material
  const materialElement = document.querySelector('.product-material');
  if (materialElement) {
    materialElement.textContent = product.material ? 
      product.material.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 
      'N/A';
  }

  // Update main product image and thumbnails
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    const productImages = product.images || [product.image];
    if (productImages?.length > 0) {
      mainImage.src = productImages[0];
      mainImage.alt = product.name;
      if (mainImage.dataset) {
        mainImage.dataset.zoomImage = productImages[0];
      }

      // Update thumbnails
      const thumbnailContainer = document.querySelector('.product-thumbnails');
      if (thumbnailContainer && productImages.length > 1) {
        thumbnailContainer.innerHTML = productImages.map((img, index) => `
          <button 
            class="bg-white rounded-lg overflow-hidden shadow-sm transition-all ${index === 0 ? 'border-2 border-primary' : 'hover:border-2 hover:border-primary'}" 
            onclick="changeImage('${img}')"
            aria-label="View ${product.name} image ${index + 1}"
          >
            <img 
              src="${img}" 
              alt="${product.name} Thumbnail ${index + 1}" 
              class="w-full h-20 object-cover"
              loading="${index === 0 ? 'eager' : 'lazy'}"
            >
          </button>
        `).join('');
      } else if (thumbnailContainer) {
        thumbnailContainer.style.display = 'none';
      }
    }
  }

  // Enable/disable add to cart button based on stock
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    if (product.stock > 0) {
      addToCartBtn.disabled = false;
      addToCartBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
      addToCartBtn.classList.add('bg-primary', 'hover:bg-primary-dark');
    } else {
      addToCartBtn.disabled = true;
      addToCartBtn.classList.remove('bg-primary', 'hover:bg-primary-dark');
      addToCartBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {  // Get current product ID and category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const currentProductId = urlParams.get('id');
  
  if (!currentProductId) {
    console.error('No product ID provided');
    return;
  }

  // Get all products and find the current one
  const allProducts = getAllProducts();
  const currentProduct = allProducts.find(p => p.id === currentProductId);
  
  if (!currentProduct) {
    console.error(`Product not found: ${currentProductId}`);
    return;
  }

  // Update product details
  updateProductDetails(currentProduct);
    // Update related products
  const relatedProducts = getRelatedProducts(currentProduct.id, currentProduct, allProducts);
  updateRelatedProducts(relatedProducts);// Add to Cart button functionality
  const addToCartButton = document.querySelector('.add-to-cart-btn');
  if (addToCartButton && currentProduct) {
    addToCartButton.addEventListener('click', function() {
      // Get quantity
      const quantityInput = document.querySelector('.quantity-input');
      const quantity = parseInt(quantityInput?.value) || 1;
      
      // Validate quantity against stock
      if (quantity > currentProduct.stock) {
        showNotification(`Only ${currentProduct.stock} items available in stock.`, 'error');
        quantityInput.value = currentProduct.stock;
        return;
      }
      
      if (quantity < 1) {
        showNotification('Please select at least 1 item.', 'error');
        quantityInput.value = 1;
        return;
      }
      
      // Use current product details
      const product = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.images?.[0] || currentProduct.image,
        stock: currentProduct.stock // Add stock info for validation
      };
      
      const result = addToCart(product, quantity);
      
      if (result.success) {
        // Show success message with quantity
        showNotification(`${quantity} ${quantity === 1 ? 'item' : 'items'} of ${currentProduct.name} added to cart!`, 'success');
        // Update cart count
        updateCartCount();
        
        // Reset quantity to 1
        if (quantityInput) {
          quantityInput.value = 1;
        }
      } else {
        // Show error message
        showNotification(result.error || 'Failed to add item to cart. Please try again.', 'error');
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
    });  }
});

// Make changeImage function available globally
window.changeImage = function(imageUrl) {
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.src = imageUrl;
    
    // Update thumbnail borders
    const thumbnails = document.querySelectorAll('.grid.grid-cols-4 button');
    thumbnails.forEach(thumb => {
      const thumbImg = thumb.querySelector('img');
      if (thumbImg && thumbImg.src === imageUrl) {
        thumb.classList.add('border-2', 'border-primary');
        thumb.classList.remove('hover:border-2', 'hover:border-primary');
      } else {
        thumb.classList.remove('border-2', 'border-primary');
        thumb.classList.add('hover:border-2', 'hover:border-primary');
      }
    });
  }
};

/**
 * Get related products based on current product
 * @param {string} currentProductId - The ID of the current product
 * @param {Object} currentProduct - The current product object
 * @param {Array} allProducts - Array of all products
 * @returns {Array} Array of related products
 */
function getRelatedProducts(currentProductId, currentProduct, allProducts) {
  // Score products based on similarity
  const scoredProducts = allProducts
    .filter(product => product.id !== currentProductId) // Exclude current product
    .map(product => {
      let score = 0;
      
      // Same category gets highest score
      if (product.category === currentProduct.category) score += 5;
      
      // Same subcategory
      if (product.subcategory === currentProduct.subcategory) score += 3;
      
      // Same material
      if (product.material === currentProduct.material) score += 2;
      
      // Similar price range (within 20%)
      const priceRange = currentProduct.price * 0.2;
      if (Math.abs(product.price - currentProduct.price) <= priceRange) score += 2;
      
      // Bestseller/Featured bonus
      if (product.bestSeller || product.featured) score += 1;
      
      return { product, score };
    })
    .sort((a, b) => {
      // First sort by score
      if (b.score !== a.score) return b.score - a.score;
      // Then randomize products with same score
      return Math.random() - 0.5;
    })
    .slice(0, 4) // Get top 4
    .map(item => item.product); // Extract just the product objects

  return scoredProducts;
}

/**
 * Create HTML for a related product
 * @param {Object} product - The product object
 * @returns {string} HTML string for the product card
 */
function createRelatedProductHTML(product) {
  const discountBadge = product.discount ? `
    <div class="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
      ${product.discount}% OFF
    </div>
  ` : '';

  const priceHTML = product.originalPrice ? `
    <span class="text-primary font-semibold">₹${product.price.toFixed(2)}</span>
    <span class="text-text-light line-through ml-2">₹${product.originalPrice.toFixed(2)}</span>
  ` : `
    <span class="text-primary font-semibold">₹${product.price.toFixed(2)}</span>
  `;

  return `
    <div class="flex-shrink-0 w-64 group">
      <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div class="relative overflow-hidden">
          <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110">
          <div class="absolute top-3 right-3 flex flex-col space-y-2">
            <button class="bg-white rounded-full p-2 text-primary hover:text-primary-dark transition-all shadow-sm" aria-label="Add to wishlist">
              <i class="far fa-heart"></i>
            </button>
          </div>
          ${discountBadge}
        </div>
        
        <div class="p-4">
          <div class="text-yellow-400 text-xs mb-1">
            ${Array(Math.floor(product.rating)).fill('<i class="fas fa-star"></i>').join('')}
            ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
            <span class="text-text-light ml-1">(${product.reviews})</span>
          </div>
          <h3 class="font-medium text-text-dark group-hover:text-primary transition-all">${product.name}</h3>
          <p class="text-sm text-text-light mb-2">${product.description.slice(0, 50)}...</p>
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              ${priceHTML}
            </div>
            <button class="bg-primary hover:bg-primary-dark text-white text-sm px-3 py-1 rounded transition-all add-to-cart" 
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-price="${product.price}">
              <i class="fas fa-shopping-bag"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update the related products section
 * @param {Array} relatedProducts - Array of related products to display
 */
function updateRelatedProducts(relatedProducts) {
  const relatedSection = document.querySelector('.related-products-section');
  const relatedProductsContainer = document.getElementById('related-products');
  if (!relatedProductsContainer) return;

  if (!relatedProducts || relatedProducts.length === 0) {
    if (relatedSection) relatedSection.style.display = 'none';
    return;
  }

  if (relatedSection) relatedSection.style.display = 'block';
  
  // Add section title if it doesn't exist
  if (!document.querySelector('.related-products-title')) {
    const titleDiv = document.createElement('div');
    titleDiv.className = 'related-products-title mb-4';
    titleDiv.innerHTML = `
      <h2 class="text-2xl font-semibold text-text-dark">You May Also Like</h2>
      <p class="text-text-light">Products similar to what you're viewing</p>
    `;
    relatedProductsContainer.parentElement.insertBefore(titleDiv, relatedProductsContainer);
  }

  // Update products display
  relatedProductsContainer.innerHTML = relatedProducts
    .map(product => createRelatedProductHTML(product))
    .join('');

  // Add event listeners to "Add to Cart" buttons
  const addToCartButtons = relatedProductsContainer.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      const product = relatedProducts.find(p => p.id === productId);
      if (product) {
        const result = addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock
        }, 1);

        if (result.success) {
          showNotification(`${product.name} added to cart!`, 'success');
          updateCartCount();
        } else {
          showNotification(result.error || 'Failed to add item to cart.', 'error');
        }
      }
    });
  });

  // Initialize product carousel
  initProductCarousel();
}

/**
 * Initialize the product carousel
 */
function initProductCarousel() {
  const container = document.getElementById('related-products');
  const prevButton = document.getElementById('prev-related');
  const nextButton = document.getElementById('next-related');

  if (!container || !prevButton || !nextButton) return;

  prevButton.addEventListener('click', () => {
    container.scrollBy({
      left: -280,  // Width of product card + margin
      behavior: 'smooth'
    });
  });

  nextButton.addEventListener('click', () => {
    container.scrollBy({
      left: 280,   // Width of product card + margin
      behavior: 'smooth'
    });
  });
}

/**
 * Show a notification message to the user
 * @param {string} message - The message to show
 * @param {string} type - The type of notification ('success' or 'error')
 */
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all transform translate-y-0 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`;
  
  // Add icon based on type
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${icon} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('opacity-0', 'translate-y-2');
  }, 2000);
  
  // Remove after animation
  setTimeout(() => {
    notification.remove();
  }, 2500);
}

// Update quantity controls
document.addEventListener('DOMContentLoaded', function() {
  // ...existing code...

  // Quantity controls
  const quantityDecrease = document.querySelector('.quantity-decrease');
  const quantityIncrease = document.querySelector('.quantity-increase');
  const quantityInput = document.querySelector('.quantity-input');
  
  if (quantityInput) {
    // Ensure initial value is valid
    let currentQuantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = currentQuantity;
    
    // Handle manual input
    quantityInput.addEventListener('change', function() {
      let newQuantity = parseInt(this.value) || 1;
      if (newQuantity < 1) newQuantity = 1;
      if (currentProduct && newQuantity > currentProduct.stock) {
        newQuantity = currentProduct.stock;
        showNotification(`Only ${currentProduct.stock} items available in stock.`, 'error');
      }
      this.value = newQuantity;
    });
    
    // Decrease button
    if (quantityDecrease) {
      quantityDecrease.addEventListener('click', function() {
        let quantity = parseInt(quantityInput.value) || 1;
        if (quantity > 1) {
          quantityInput.value = quantity - 1;
        }
      });
    }
    
    // Increase button
    if (quantityIncrease) {
      quantityIncrease.addEventListener('click', function() {
        let quantity = parseInt(quantityInput.value) || 1;
        if (currentProduct && quantity < currentProduct.stock) {
          quantityInput.value = quantity + 1;
        } else {
          showNotification(`Only ${currentProduct.stock} items available in stock.`, 'error');
        }
      });
    }
  }
});


