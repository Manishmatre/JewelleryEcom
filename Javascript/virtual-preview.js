/**
 * ShilpoKotha Virtual Preview
 * This script adds virtual try-on functionality for jewelry products
 */

// Import cart and wishlist functions
import { addToCart, isInCart } from './cart-handler.js';
import { addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist } from './wishlist-handler.js';

// This section intentionally left empty - variables are declared below

/**
 * Get product data based on product ID
 * @param {string} productId - The ID of the product
 * @returns {Object} Product data object
 */
function getProductData(productId) {
  // Try to get from window.productsData if it exists (set by product-detail.js)
  if (window.productsData && Array.isArray(window.productsData)) {
    const product = window.productsData.find(p => p.id === productId);
    if (product) return product;
  }
  
  // Fallback: create a product based on the ID
  let category = 'rings'; // Default category
  if (productId && productId.includes('-')) {
    category = productId.split('-')[0];
    // Make it plural if it's not already
    if (!category.endsWith('s')) {
      category += 's';
    }
  }
  
  return {
    id: productId,
    name: 'Jewelry Item',
    price: 0,
    category: category,
    image: null, // Will use placeholder
    description: 'Virtual preview of this jewelry item.'
  };
}

// Configuration for the preview feature
const previewConfig = {
  // Canvas dimensions
  canvasWidth: 640,
  canvasHeight: 480,
  // Overlay opacity
  overlayOpacity: 0.85,
  // Animation duration in ms
  animationDuration: 500,
  // Default model images for different product categories
  modelImages: {
    rings: '/images/preview/hand-model.png',
    bracelets: '/images/preview/wrist-model.png',
    necklaces: '/images/preview/neck-model.png',
    earrings: '/images/preview/ear-model.png',
    // Fallback image for any category
    fallback: '/images/preview/fallback-model.png'
  },
  // Default positions for different product categories
  defaultPositions: {
    rings: { x: 320, y: 240, scale: 0.5, rotation: 0 },
    bracelets: { x: 320, y: 240, scale: 0.6, rotation: 0 },
    necklaces: { x: 320, y: 180, scale: 0.7, rotation: 0 },
    earrings: { x: 320, y: 200, scale: 0.4, rotation: 0 }
  }
};

// DOM elements
let previewContainer = null;
let previewCanvas = null;
let previewContext = null;

// State variables
let previewActive = false;
let currentProduct = null;
let modelImage = null;
let productImage = null;
let dragActive = false;
let lastMousePos = { x: 0, y: 0 };
let productPosition = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0
};

// Flag to track initialization
let isInitialized = false;

/**
 * Initialize the virtual preview feature
 */
function initVirtualPreview() {
  // Prevent multiple initializations
  if (isInitialized) {
    console.log('Virtual preview already initialized');
    return;
  }
  
  console.log('Initializing virtual preview');
  
  // Get DOM elements
  previewContainer = document.getElementById('preview-container');
  previewCanvas = document.getElementById('preview-canvas');
  
  if (!previewContainer || !previewCanvas) {
    console.log('Preview container or canvas not found, creating them');
    createPreviewElements();
  }
  
  // Set up canvas context
  if (previewCanvas) {
    previewContext = previewCanvas.getContext('2d');
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Set up direct event listeners for try-on buttons
  setupDirectEventListeners();
  
  // Mark as initialized
  isInitialized = true;
  
  console.log('Virtual preview initialized');
}

/**
 * Set up event listeners for the preview controls
 */
function setupEventListeners() {
  console.log('Setting up event listeners for preview controls');
  
  try {
    // Close button
    const closeButton = document.getElementById('close-preview');
    if (closeButton) {
      closeButton.addEventListener('click', closePreview);
    }
    
    // Scale control
    const scaleControl = document.getElementById('scale-control');
    if (scaleControl) {
      scaleControl.addEventListener('input', function() {
        if (currentProduct && currentProduct.position) {
          currentProduct.position.scale = parseFloat(this.value);
          renderPreview();
        }
      });
    }
    
    // Rotation control
    const rotationControl = document.getElementById('rotation-control');
    if (rotationControl) {
      rotationControl.addEventListener('input', function() {
        if (currentProduct && currentProduct.position) {
          currentProduct.position.rotation = parseInt(this.value);
          renderPreview();
        }
      });
    }
    
    // Reset position button
    const resetButton = document.getElementById('reset-position');
    if (resetButton) {
      resetButton.addEventListener('click', function() {
        resetProductPosition();
        renderPreview();
        
        // Update the control sliders
        if (scaleControl && currentProduct && currentProduct.position) {
          scaleControl.value = currentProduct.position.scale;
        }
        if (rotationControl && currentProduct && currentProduct.position) {
          rotationControl.value = currentProduct.position.rotation;
        }
      });
    }
    
    // Add to cart button
    const addToCartButton = document.getElementById('add-to-cart-preview');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', function() {
        if (currentProduct && typeof addToCart === 'function') {
          addToCart(currentProduct.id, 1);
          showToast('Added to cart', 'success');
        } else {
          console.error('Cannot add to cart: missing product ID or addToCart function');
          showToast('Could not add to cart', 'error');
        }
      });
    }
    
    // Add to wishlist button
    const wishlistButton = document.getElementById('add-to-wishlist-preview');
    if (wishlistButton) {
      wishlistButton.addEventListener('click', function() {
        if (currentProduct && typeof toggleWishlist === 'function') {
          const inWishlist = toggleWishlist(currentProduct.id);
          const wishlistButtonText = document.getElementById('wishlist-button-text');
          if (wishlistButtonText) {
            wishlistButtonText.textContent = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
          }
          showToast(inWishlist ? 'Added to wishlist' : 'Removed from wishlist', 'success');
        } else {
          console.error('Cannot toggle wishlist: missing product ID or toggleWishlist function');
          showToast('Could not update wishlist', 'error');
        }
      });
    }
    
    // Share button
    const shareButton = document.getElementById('share-preview');
    if (shareButton) {
      shareButton.addEventListener('click', function() {
        try {
          // Create a data URL from the canvas
          const dataUrl = previewCanvas.toDataURL('image/png');
          
          // Try to use the Web Share API if available
          if (navigator.share) {
            fetch(dataUrl)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], 'virtual-try-on.png', { type: 'image/png' });
                navigator.share({
                  title: 'Virtual Try-On',
                  text: `Check out this ${currentProduct.name || 'jewelry item'} I tried on virtually!`,
                  files: [file]
                })
                .then(() => console.log('Shared successfully'))
                .catch(error => {
                  console.error('Error sharing:', error);
                  fallbackShare(dataUrl);
                });
              });
          } else {
            fallbackShare(dataUrl);
          }
        } catch (error) {
          console.error('Error in share function:', error);
          showToast('Could not share preview', 'error');
        }
      });
    }
    
    // Canvas drag events for positioning
    if (previewCanvas) {
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      
      previewCanvas.addEventListener('mousedown', function(e) {
        isDragging = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
      });
      
      previewCanvas.addEventListener('mousemove', function(e) {
        if (isDragging && currentProduct && currentProduct.position) {
          const deltaX = e.offsetX - lastX;
          const deltaY = e.offsetY - lastY;
          
          currentProduct.position.x += deltaX;
          currentProduct.position.y += deltaY;
          
          lastX = e.offsetX;
          lastY = e.offsetY;
          
          renderPreview();
        }
      });
      
      previewCanvas.addEventListener('mouseup', function() {
        isDragging = false;
      });
      
      previewCanvas.addEventListener('mouseleave', function() {
        isDragging = false;
      });
      
      // Touch events for mobile
      previewCanvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          isDragging = true;
          lastX = e.touches[0].clientX - previewCanvas.getBoundingClientRect().left;
          lastY = e.touches[0].clientY - previewCanvas.getBoundingClientRect().top;
          e.preventDefault();
        }
      });
      
      previewCanvas.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1 && currentProduct && currentProduct.position) {
          const touchX = e.touches[0].clientX - previewCanvas.getBoundingClientRect().left;
          const touchY = e.touches[0].clientY - previewCanvas.getBoundingClientRect().top;
          
          const deltaX = touchX - lastX;
          const deltaY = touchY - lastY;
          
          currentProduct.position.x += deltaX;
          currentProduct.position.y += deltaY;
          
          lastX = touchX;
          lastY = touchY;
          
          renderPreview();
          e.preventDefault();
        }
      });
      
      previewCanvas.addEventListener('touchend', function() {
        isDragging = false;
      });
    }
    
    console.log('Event listeners set up successfully');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

/**
 * Fallback share method when Web Share API is not available
 * @param {string} dataUrl - The data URL of the image to share
 */
function fallbackShare(dataUrl) {
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'virtual-try-on.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  showToast('Image downloaded', 'success');
}

/**
 * Close the preview
 */
function closePreview() {
  if (previewContainer) {
    previewContainer.classList.add('hidden');
    previewActive = false;
    
    // Clear the canvas
    if (previewContext && previewCanvas) {
      previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }
    
    console.log('Preview closed');
  }
}

/**
 * Create the preview elements if they don't exist
 */
function createPreviewElements() {
  console.log('Creating preview elements');
  
  // Create container if it doesn't exist
  if (!previewContainer) {
    previewContainer = document.createElement('div');
    previewContainer.id = 'virtual-preview-container';
    previewContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 hidden';
    document.body.appendChild(previewContainer);
  }
  
  // Create preview content
  previewContainer.innerHTML = `
    <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-xl font-semibold text-gray-900" id="preview-title">Virtual Try-On</h3>
        <button id="close-preview" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="flex flex-col md:flex-row p-4 gap-4 flex-grow overflow-auto">
        <div class="flex-grow relative">
          <canvas id="preview-canvas" width="640" height="480" class="w-full h-auto border rounded-lg shadow-inner bg-gray-100"></canvas>
        </div>
        
        <div class="w-full md:w-64 space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium mb-2">Controls</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Scale</label>
                <input type="range" id="scale-control" min="0.5" max="2" step="0.1" value="1" class="w-full">
              </div>
              
              <div>
                <label class="block text-sm text-gray-600 mb-1">Rotation</label>
                <input type="range" id="rotation-control" min="0" max="360" step="1" value="0" class="w-full">
              </div>
              
              <button id="reset-position" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-all mt-2">
                Reset Position
              </button>
            </div>
          </div>
          
          <div class="space-y-2">
            <button id="add-to-cart-preview" class="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition-all flex items-center justify-center">
              <i class="fas fa-shopping-cart mr-2"></i>
              Add to Cart
            </button>
            
            <button id="add-to-wishlist-preview" class="w-full border border-primary text-primary hover:bg-primary hover:text-white py-2 px-4 rounded transition-all flex items-center justify-center">
              <i class="fas fa-heart mr-2"></i>
              <span id="wishlist-button-text">Add to Wishlist</span>
            </button>
            
            <button id="share-preview" class="w-full border border-primary text-primary hover:bg-primary hover:text-white py-2 px-4 rounded transition-all flex items-center justify-center">
              <i class="fas fa-share-alt mr-2"></i>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Get the canvas element
  previewCanvas = document.getElementById('preview-canvas');
  
  // If we still don't have the canvas, something went wrong
  if (!previewCanvas) {
    console.error('Failed to create preview canvas');
    return;
  }
  
  // Initialize the canvas context
  try {
    previewContext = previewCanvas.getContext('2d');
    if (!previewContext) {
      console.error('Failed to get 2D context from canvas');
    } else {
      console.log('Canvas context initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing canvas context:', error);
  }
  
  // Set up event listeners for the preview controls
  setupEventListeners();
}

/**
 * Add preview buttons to all product cards with retry logic
 * @param {number} retryCount - Number of retries if no products are found
 * @param {boolean} silent - Whether to suppress console logs
 */
function addPreviewButtonsToProducts(retryCount = 1, silent = false) {
  if (!silent) {
    console.log('Adding virtual try-on buttons to products');
  }
  
  // Use multiple selectors to find product cards in different page layouts
  const productCards = document.querySelectorAll(
    '.group.relative.bg-white, ' + // Products page cards
    '.product-card, ' + // Alternative product cards
    '.flex-shrink-0.w-64.group, ' + // Related products
    '.product-detail-container' // Single product page
  );
  
  if (!silent) {
    console.log(`Found ${productCards.length} product cards`);
  }
  
  // Also check for single product view on product.html
  const singleProductContainer = document.querySelector('.product-detail-container, .product-main-image');
  if (singleProductContainer && !singleProductContainer.querySelector('button[aria-label="Virtual Try-On"]')) {
    addTryOnButtonToSingleProduct(singleProductContainer);
  }
  
  if (productCards.length === 0 && retryCount > 0) {
    // If no products found yet, try again after a short delay with one less retry
    setTimeout(() => addPreviewButtonsToProducts(retryCount - 1, silent), 1000);
    return;
  }
  
  productCards.forEach(card => {
    // Skip if card already has a try-on button
    if (card.querySelector('button[aria-label="Virtual Try-On"]')) {
      return;
    }
    
    // Get the product ID from the quick view button or add to cart button
    let productId = null;
    const quickViewButton = card.querySelector('button[aria-label="Quick view"]');
    const addToCartButton = card.querySelector('button.add-to-cart');
    
    if (quickViewButton && quickViewButton.dataset.productId) {
      productId = quickViewButton.dataset.productId;
    } else if (addToCartButton && addToCartButton.dataset.productId) {
      productId = addToCartButton.dataset.productId;
    }
    
    if (!productId) {
      console.warn('Product ID not found for a product card');
      return;
    }
    
    // Create the preview button
    const previewButton = document.createElement('button');
    previewButton.className = 'absolute bottom-3 right-14 z-10 p-2 bg-white bg-opacity-80 rounded-full text-primary hover:text-white hover:bg-primary transition-all';
    previewButton.setAttribute('aria-label', 'Virtual Try-On');
    previewButton.setAttribute('data-product-id', productId);
    previewButton.innerHTML = '<i class="fas fa-eye text-sm"></i>';
    
    // Add tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200';
    tooltip.textContent = 'Virtual Try-On';
    previewButton.appendChild(tooltip);
    
    // Add click event listener
    previewButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPreview(productId);
    });
    
    // Add the button to the card
    card.appendChild(previewButton);
    console.log(`Added try-on button to product: ${productId}`);
  });
  
  // Set up a mutation observer to watch for new product cards
  setupProductObserver();
}

/**
 * Add try-on button to single product view
 * @param {HTMLElement} container - The product container element
 */
function addTryOnButtonToSingleProduct(container) {
  console.log('Adding try-on button to single product view');
  
  // Try to find the product ID
  let productId = null;
  
  // Check URL parameters first (product.html?id=xyz)
  const urlParams = new URLSearchParams(window.location.search);
  productId = urlParams.get('id');
  
  // If not in URL, try to find it in the add to cart button
  if (!productId) {
    const addToCartButton = container.querySelector('.add-to-cart, button[data-product-id]');
    if (addToCartButton && addToCartButton.dataset.productId) {
      productId = addToCartButton.dataset.productId;
    }
  }
  
  // If still no product ID, try to extract from the page title or breadcrumbs
  if (!productId) {
    const productTitle = document.querySelector('h1, .product-title');
    if (productTitle) {
      // Generate a pseudo-ID from the title
      const titleText = productTitle.textContent.trim();
      productId = 'product-' + titleText.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
  }
  
  if (!productId) {
    console.warn('Could not determine product ID for single product view');
    return;
  }
  
  // Find the best location to add the button
  let buttonContainer = container.querySelector('.product-actions, .product-buttons');
  if (!buttonContainer) {
    // If no dedicated container, find the add to cart button and use its parent
    const addToCartButton = container.querySelector('.add-to-cart');
    if (addToCartButton) {
      buttonContainer = addToCartButton.parentElement;
    }
  }
  
  if (!buttonContainer) {
    console.warn('Could not find a suitable container for the try-on button');
    return;
  }
  
  // Create the try-on button
  const tryOnButton = document.createElement('button');
  tryOnButton.className = 'bg-secondary hover:bg-secondary-dark text-primary hover:text-white transition-all px-4 py-2 rounded flex items-center justify-center space-x-2 mt-4 w-full';
  tryOnButton.setAttribute('aria-label', 'Virtual Try-On');
  tryOnButton.setAttribute('data-product-id', productId);
  tryOnButton.innerHTML = '<i class="fas fa-eye mr-2"></i> Virtual Try-On';
  
  // Add click event listener
  tryOnButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPreview(productId);
  });
  
  // Add the button to the container
  buttonContainer.appendChild(tryOnButton);
  console.log(`Added try-on button to single product: ${productId}`);
}

/**
 * Set up a mutation observer to watch for new product cards
 */
function setupProductObserver() {
  // Create a mutation observer to watch for new product cards
  const observer = new MutationObserver((mutations) => {
    let shouldAddButtons = false;
    
    // Check if any new product cards were added
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any of the added nodes are product cards or contain product cards
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node is a product card
            if (node.classList && (node.classList.contains('group') || node.classList.contains('product-card'))) {
              shouldAddButtons = true;
            }
            
            // Check if the node contains product cards
            const productCards = node.querySelectorAll('.group.relative.bg-white, .product-card');
            if (productCards.length > 0) {
              shouldAddButtons = true;
            }
          }
        });
      }
    });
    
    // If new product cards were added, add buttons to all products
    if (shouldAddButtons) {
      console.log('New product cards detected, adding try-on buttons');
      addPreviewButtonsToProducts();
    }
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('Product observer set up');
}

/**
 * Open the preview for a specific product
 * @param {string} productId - The ID of the product to preview
 */
function openPreview(productId) {
  console.log(`Opening preview for product ID: ${productId}`);
  
  // Initialize if not already done
  if (!isInitialized) {
    initVirtualPreview();
  }
  
  try {
    // Get the product data using our reliable function
    currentProduct = getProductData(productId);
    console.log('Current product:', currentProduct);
    
    // Make sure preview container exists
    if (!previewContainer) {
      console.log('Preview container not found, creating elements');
      createPreviewElements();
    }
    
    // Update preview title
    const previewTitle = document.getElementById('preview-title');
    if (previewTitle) {
      previewTitle.textContent = `Virtual Try-On: ${currentProduct.name || 'Jewelry Item'}`;
    }
    
    // Update wishlist button state
    try {
      const wishlistButtonText = document.getElementById('wishlist-button-text');
      if (wishlistButtonText && typeof isInWishlist === 'function') {
        const inWishlist = isInWishlist(productId);
        wishlistButtonText.textContent = inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
      }
    } catch (error) {
      console.error('Error updating wishlist button state:', error);
    }
    
    // Reset product position
    resetProductPosition();
    
    // Show the preview container
    if (previewContainer) {
      previewContainer.classList.remove('hidden');
      previewActive = true;
    }
    
    // Load images and render preview
    loadImages();
    
  } catch (error) {
    console.error('Error in openPreview:', error);
    showToast('Error opening preview', 'error');
    return;
  }
}

// Make openPreview available globally for direct script tag usage
window.openPreview = openPreview;

/**
 * Reset the product position to default
 */
function resetProductPosition() {
  if (!currentProduct) return;
  
  // Get the default position for this product category
  const defaultPos = previewConfig.defaultPositions[currentProduct.category] || {
    x: previewConfig.canvasWidth / 2,
    y: previewConfig.canvasHeight / 2,
    scale: 1,
    rotation: 0
  };
  
  // Set the position
  productPosition = { ...defaultPos };
  
  // Reset the controls
  const scaleControl = document.getElementById('scale-control');
  if (scaleControl) {
    scaleControl.value = productPosition.scale;
  }
  
  const rotationControl = document.getElementById('rotation-control');
  if (rotationControl) {
    rotationControl.value = productPosition.rotation;
  }
}

/**
 * Load the required images for the preview
 */
function loadImages() {
  console.log('Loading images for preview');
  
  try {
    // Make sure we have a current product
    if (!currentProduct || !currentProduct.category) {
      console.error('No valid product data for loading images');
      return;
    }
    
    // Make sure preview canvas and context exist
    if (!previewCanvas || !previewContext) {
      console.error('Canvas or context not initialized');
      createPreviewElements();
      if (!previewCanvas || !previewContext) {
        console.error('Failed to initialize canvas or context');
        return;
      }
    }
    
    // Load the model image based on the product category
    const modelSrc = getModelImageForCategory(currentProduct.category);
    console.log('Loading model image from:', modelSrc);
    
    // Create a new image for the model
    modelImage = new Image();
    modelImage.crossOrigin = 'anonymous';
    modelImage.onload = function() {
      console.log('Model image loaded successfully');
      renderPreview();
    };
    modelImage.onerror = function() {
      console.error('Error loading model image from:', modelSrc);
      renderPlaceholderModel();
    };
    modelImage.src = modelSrc;
    
    // Load the product image
    if (currentProduct.image) {
      console.log('Loading product image from:', currentProduct.image);
      productImage = new Image();
      productImage.crossOrigin = 'anonymous';
      productImage.onload = function() {
        console.log('Product image loaded successfully');
        processProductImage();
        renderPreview();
      };
      productImage.onerror = function() {
        console.error('Error loading product image from:', currentProduct.image);
        // Try to load a placeholder product image based on category
        const placeholderSrc = getPlaceholderProductImage(currentProduct.category);
        if (placeholderSrc) {
          console.log('Loading placeholder product image from:', placeholderSrc);
          productImage.src = placeholderSrc;
        } else {
          console.log('No placeholder available, rendering without product image');
          renderPreview();
        }
      };
      productImage.src = currentProduct.image;
    } else {
      // Try to load a placeholder product image based on category
      const placeholderSrc = getPlaceholderProductImage(currentProduct.category);
      if (placeholderSrc) {
        console.log('Loading placeholder product image from:', placeholderSrc);
        productImage = new Image();
        productImage.crossOrigin = 'anonymous';
        productImage.onload = function() {
          console.log('Placeholder product image loaded successfully');
          renderPreview();
        };
        productImage.src = placeholderSrc;
      } else {
        console.log('No product image available');
        renderPreview();
      }
    }
  } catch (error) {
    console.error('Error in loadImages:', error);
    showToast('Error loading images for preview', 'error');
  }
}

/**
 * Get a placeholder product image based on category
 * @param {string} category - The product category
 * @returns {string} URL to a placeholder image
 */
function getPlaceholderProductImage(category) {
  // Default placeholder images by category
  const placeholders = {
    'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&w=200&h=200&fit=crop',
    'necklaces': 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&w=200&h=200&fit=crop',
    'bracelets': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&w=200&h=200&fit=crop',
    'earrings': 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&w=200&h=200&fit=crop'
  };
  
  // Normalize category name (remove 's' if present)
  let normalizedCategory = category.toLowerCase();
  if (normalizedCategory.endsWith('s')) {
    normalizedCategory = normalizedCategory.slice(0, -1);
  }
  normalizedCategory += 's'; // Add 's' back to ensure consistent format
  
  return placeholders[normalizedCategory] || null;
};

/**
 * Create a placeholder product image
 */
function createPlaceholderProductImage() {
  // Create a canvas to generate a placeholder product image
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  // Fill with a light background
  ctx.fillStyle = '#f6f1e6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a simple jewelry shape based on the product category
  ctx.strokeStyle = '#a39a7e';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#d9d4c6';
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  if (currentProduct && currentProduct.category) {
    switch(currentProduct.category) {
      case 'rings':
        // Draw a ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#f6f1e6';
        ctx.fill();
        break;
        
      case 'necklaces':
        // Draw a necklace
        ctx.beginPath();
        ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
        ctx.stroke();
        // Draw pendant
        ctx.beginPath();
        ctx.arc(centerX, centerY + 50, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'earrings':
        // Draw earrings
        ctx.beginPath();
        ctx.arc(centerX - 40, centerY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + 40, centerY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'bracelets':
        // Draw a bracelet
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 70, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 50, 25, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#f6f1e6';
        ctx.fill();
        break;
        
      default:
        // Draw a generic jewelry item
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  } else {
    // Draw a generic jewelry item
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  
  // Convert to data URL and set as the product image source
  const dataUrl = canvas.toDataURL('image/png');
  if (productImage) {
    productImage.src = dataUrl;
  }
  
  return dataUrl;
}

/**
 * Load the model image for the preview
 */
function loadModelImage() {
  return new Promise((resolve, reject) => {
    console.log(`Loading model for category: ${currentProduct.category}`);
    
    // Get the model image for this product category
    const modelSrc = previewConfig.modelImages[currentProduct.category] || previewConfig.modelImages.fallback;
    console.log(`Loading model image: ${modelSrc} for category: ${currentProduct.category}`);
    
    // Load the model image
    modelImage.onload = () => {
      console.log('Model image loaded');
      resolve();
    };
    
    // Handle model image loading errors
    modelImage.onerror = () => {
      console.warn(`Failed to load model image: ${modelSrc}, creating placeholder`);
      // Create a placeholder model image
      createPlaceholderImageDataUrl();
      setTimeout(resolve, 100); // Give a little time for the new image to load
    };
    
    // Set the model image source
    modelImage.src = modelSrc;
  });
}

/**
 * Process the product image for better blending with the model
 */
function processProductImage() {
  // Create a temporary canvas for image processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions to match the product image
  canvas.width = productImage.width;
  canvas.height = productImage.height;
  
  // Draw the product image on the canvas
  ctx.drawImage(productImage, 0, 0);
  
  // Get the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Process the image data
  for (let i = 0; i < data.length; i += 4) {
    // Skip transparent pixels
    if (data[i + 3] < 10) continue;
    
    // Enhance contrast slightly
    data[i] = Math.min(255, data[i] * 1.1);     // Red
    data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
    data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
    
    // Add slight transparency for better blending
    if (data[i + 3] > 240) {
      data[i + 3] = 240; // Alpha
    }
  }
  
  // Put the modified image data back on the canvas
  ctx.putImageData(imageData, 0, 0);
  
  // Update the product image with the processed version
  productImage.src = canvas.toDataURL('image/png');
}

/**
 * Draw the product on the canvas
 */
function drawProductOnCanvas() {
  if (!previewContext || !previewCanvas || !productImage || !productImage.complete) return;
  
  // Set default position if not set
  if (!productPosition.x && !productPosition.y) {
    productPosition.x = previewCanvas.width / 2;
    productPosition.y = previewCanvas.height / 2;
  }
  
  // Calculate the position based on the current state
  const productWidth = productImage.width * productPosition.scale;
  const productHeight = productImage.height * productPosition.scale;
  
  // Save the current context state
  previewContext.save();
  
  // Translate to the position where we want to draw the product
  previewContext.translate(productPosition.x, productPosition.y);
  
  // Rotate around the center point
  previewContext.rotate(productPosition.rotation * Math.PI / 180);
  
  // Apply blending mode based on category
  if (currentProduct && (currentProduct.category === 'rings' || currentProduct.category === 'bracelets')) {
    previewContext.globalCompositeOperation = 'multiply';
  } else {
    previewContext.globalCompositeOperation = 'source-over';
  }
  
  // Draw the product image
  previewContext.drawImage(productImage, -productWidth / 2, -productHeight / 2, productWidth, productHeight);
  
  // Add a subtle highlight effect for metallic jewelry
  if (currentProduct.material === 'gold' || 
      currentProduct.material === 'silver' || 
      currentProduct.material === 'platinum' || 
      currentProduct.material === 'white-gold' || 
      currentProduct.material === 'rose-gold') {
    
    previewContext.globalCompositeOperation = 'lighter';
    previewContext.globalAlpha = 0.2;
    previewContext.drawImage(productImage, -productWidth / 2, -productHeight / 2, productWidth, productHeight);
  }
  
  // Restore the state
  previewContext.restore();
  
  // Add a watermark
  previewContext.save();
  previewContext.globalAlpha = 0.5;
  previewContext.font = '12px Arial';
  previewContext.fillStyle = '#ffffff';
  previewContext.fillText('ShilpoKotha Virtual Try-On', 10, previewCanvas.height - 10);
  previewContext.restore();
}

/**
 * Close the preview
 */
function closePreview() {
  // Check if container exists
  if (!previewContainer) {
    return;
  }
  
  // Hide the preview container
  previewContainer.classList.add('hidden');
  previewActive = false;
  
  // Reset variables
  currentProduct = null;
  modelImage = null;
  productImage = null;
  
  // Reset product position
  productPosition = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  };
}

/**
 * Render a placeholder model when images fail to load
 */
function renderPlaceholderModel() {
  if (!previewContext) return;
  
  // Clear the canvas
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  
  // Draw a colored rectangle as a placeholder
  previewContext.fillStyle = '#f6f1e6';
  previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  
  // Add text instructions
  previewContext.fillStyle = '#a39a7e';
  previewContext.font = '18px Arial';
  previewContext.textAlign = 'center';
  previewContext.fillText('Model image not available', previewCanvas.width / 2, previewCanvas.height / 2 - 20);
  previewContext.fillText('Try moving your product here', previewCanvas.width / 2, previewCanvas.height / 2 + 20);
  
  // Draw a silhouette based on product category
  if (currentProduct && currentProduct.category) {
    drawCategorySilhouette(currentProduct.category);
  }
  
  // Continue with product rendering
  if (productImage && productImage.complete) {
    drawProductOnCanvas();
  }
}

/**
 * Draw a silhouette based on product category
 * @param {string} category - The product category
 */
function drawCategorySilhouette(category) {
  const centerX = previewCanvas.width / 2;
  const centerY = previewCanvas.height / 2;
  
  previewContext.strokeStyle = '#a39a7e';
  previewContext.lineWidth = 2;
  
  switch(category) {
    case 'rings':
      // Draw a hand silhouette
      previewContext.beginPath();
      previewContext.ellipse(centerX, centerY + 50, 60, 100, 0, 0, Math.PI * 2);
      previewContext.stroke();
      // Draw finger
      previewContext.beginPath();
      previewContext.ellipse(centerX, centerY - 30, 20, 80, 0, 0, Math.PI * 2);
      previewContext.stroke();
      break;
      
    case 'necklaces':
      // Draw a neck silhouette
      previewContext.beginPath();
      previewContext.ellipse(centerX, centerY - 50, 70, 40, 0, 0, Math.PI * 2);
      previewContext.stroke();
      // Draw shoulders
      previewContext.beginPath();
      previewContext.moveTo(centerX - 70, centerY + 20);
      previewContext.lineTo(centerX + 70, centerY + 20);
      previewContext.stroke();
      break;
      
    case 'earrings':
      // Draw an ear silhouette
      previewContext.beginPath();
      previewContext.ellipse(centerX, centerY, 30, 60, 0, 0, Math.PI * 2);
      previewContext.stroke();
      break;
      
    case 'bracelets':
      // Draw a wrist silhouette
      previewContext.beginPath();
      previewContext.ellipse(centerX, centerY, 50, 30, 0, 0, Math.PI * 2);
      previewContext.stroke();
      // Draw arm
      previewContext.beginPath();
      previewContext.moveTo(centerX - 100, centerY);
      previewContext.lineTo(centerX + 100, centerY);
      previewContext.stroke();
      break;
      
    default:
      // Draw a generic silhouette
      previewContext.beginPath();
      previewContext.arc(centerX, centerY, 80, 0, Math.PI * 2);
      previewContext.stroke();
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `bg-white rounded-lg shadow-lg p-4 mb-3 flex items-center transition-all transform translate-y-0 opacity-100`;
  
  // Set icon based on type
  let icon = 'info-circle';
  let color = 'blue';
  
  if (type === 'success') {
    icon = 'check-circle';
    color = 'green';
  } else if (type === 'error') {
    icon = 'exclamation-circle';
    color = 'red';
  } else if (type === 'warning') {
    icon = 'exclamation-triangle';
    color = 'yellow';
  }
  
  toast.innerHTML = `
    <i class="fas fa-${icon} text-${color}-500 mr-3"></i>
    <span>${message}</span>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Render the preview
 */
function renderPreview() {
  if (!previewContext || !previewCanvas) return;
  
  // Clear the canvas
  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  
  // Draw the model image if available
  if (modelImage && modelImage.complete) {
    previewContext.drawImage(modelImage, 0, 0, previewCanvas.width, previewCanvas.height);
  } else {
    // If model image is not available, draw a placeholder
    renderPlaceholderModel();
    return; // Skip the rest of the rendering since we're using the placeholder
  }
  
  // Draw the product image if available
  if (productImage && productImage.complete) {
    drawProductOnCanvas();
  }
  
  // Request the next animation frame
  if (previewActive) {
    requestAnimationFrame(renderPreview);
  }
}

/**
 * Create a placeholder image data URL when no model images are available
 */
function createPlaceholderImageDataUrl() {
  // Create a canvas to generate the data URL
  const canvas = document.createElement('canvas');
  canvas.width = previewConfig.canvasWidth;
  canvas.height = previewConfig.canvasHeight;
  const ctx = canvas.getContext('2d');
  
  // Fill with a light background
  ctx.fillStyle = '#f6f1e6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a simple silhouette based on the product category
  ctx.strokeStyle = '#a39a7e';
  ctx.lineWidth = 3;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Draw a generic silhouette for any category
  if (currentProduct && currentProduct.category) {
    switch(currentProduct.category) {
      case 'rings':
        // Hand silhouette
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY + 100);
        ctx.lineTo(centerX + 100, centerY + 100);
        ctx.lineTo(centerX + 80, centerY - 100);
        ctx.lineTo(centerX - 80, centerY - 100);
        ctx.closePath();
        ctx.stroke();
        break;
        
      case 'necklaces':
        // Neck silhouette
        ctx.beginPath();
        ctx.arc(centerX, centerY - 50, 70, 0, Math.PI * 2);
        ctx.moveTo(centerX - 100, centerY + 50);
        ctx.lineTo(centerX + 100, centerY + 50);
        ctx.stroke();
        break;
      
      case 'earrings':
        // Ear silhouette
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX - 40, centerY + 30);
        ctx.stroke();
        break;
        
      case 'bracelets':
        // Wrist silhouette
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 50, 30, 0, 0, Math.PI * 2);
        ctx.moveTo(centerX - 100, centerY);
        ctx.lineTo(centerX + 100, centerY);
        ctx.stroke();
        break;
        
      default:
        // Generic jewelry display area
        ctx.beginPath();
        ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        ctx.stroke();
    }
  } else {
    // Generic jewelry display area
    ctx.beginPath();
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Add text
  ctx.fillStyle = '#a39a7e';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Virtual Try-On', centerX, 50);
  ctx.font = '16px Arial';
  ctx.fillText('Model image not available', centerX, centerY - 120);
  
  // Convert to data URL and set as the model image source
  const dataUrl = canvas.toDataURL('image/png');
  if (modelImage) {
    modelImage.src = dataUrl;
  }
  
  return dataUrl;
}

// Initialize the virtual preview feature when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing virtual preview');
  initVirtualPreview();
  
  // Add try-on buttons to product cards
  addPreviewButtonsToProducts();
  
  // Set up a periodic check for new products
  setupProductObserver();
  
  // Set up direct event listeners
  setupDirectEventListeners();
  
  // Make sure openPreview is available globally
  if (typeof window.openPreview !== 'function') {
    window.openPreview = openPreview;
    console.log('openPreview function made available globally');
  }
});

// Export functions for use in other modules
export { openPreview, initVirtualPreview };

// Also listen for the custom event from display-all-products.js
document.addEventListener('productsDisplayed', () => {
  console.log('Products displayed event received, initializing virtual preview');
  initVirtualPreview();
});

// Listen for dynamic content changes (for single-page applications)
let lastCheckTime = Date.now();
setInterval(() => {
  // Don't check too frequently
  if (Date.now() - lastCheckTime < 2000) return;
  lastCheckTime = Date.now();
  
  // Look for new try-on buttons that might have been added
  if (document.querySelectorAll('.virtual-try-on:not([data-event-attached="true"])').length > 0) {
    console.log('Found new try-on buttons, setting up event listeners');
    setupDirectEventListeners();
  }
}, 2000);

/**
 * Set up direct event listeners for try-on buttons
 */
function setupDirectEventListeners() {
  console.log('Setting up direct event listeners for try-on buttons');
  
  // Handle the main try-on button on product.html
  const mainTryOnButton = document.getElementById('virtual-try-on-button');
  if (mainTryOnButton && mainTryOnButton.getAttribute('data-event-attached') !== 'true') {
    console.log('Found main try-on button, adding event listener');
    mainTryOnButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = mainTryOnButton.getAttribute('data-product-id');
      console.log(`Main try-on button clicked for product: ${productId}`);
      openPreview(productId);
    });
    mainTryOnButton.setAttribute('data-event-attached', 'true');
  }
  
  // Handle all buttons with Virtual Try-On aria-label
  const allTryOnButtons = document.querySelectorAll('.virtual-try-on, button[aria-label="Virtual try-on"]');
  console.log(`Found ${allTryOnButtons.length} try-on buttons`);
  
  allTryOnButtons.forEach(button => {
    if (button.getAttribute('data-event-attached') !== 'true') {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = button.getAttribute('data-product-id');
        console.log(`Try-on button clicked for product: ${productId}`);
        try {
          openPreview(productId);
        } catch (error) {
          console.error('Error in openPreview:', error);
          // Try using the global function as fallback
          if (typeof window.openPreview === 'function') {
            window.openPreview(productId);
          }
        }
      });
      button.setAttribute('data-event-attached', 'true');
    }
  });
}
