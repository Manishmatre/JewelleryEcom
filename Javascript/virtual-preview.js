/**
 * ShilpoKotha Virtual Preview
 * This script adds virtual try-on functionality for jewelry products
 */

// Import the product data
import { getAllProducts } from './products-data-additional.js';

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
    earrings: '/images/preview/ear-model.png'
  },
  // Default positions for different product categories
  defaultPositions: {
    rings: { x: 320, y: 240, scale: 0.5, rotation: 0 },
    bracelets: { x: 320, y: 240, scale: 0.6, rotation: 0 },
    necklaces: { x: 320, y: 180, scale: 0.7, rotation: 0 },
    earrings: { x: 320, y: 200, scale: 0.4, rotation: 0 }
  }
};

// State variables
let currentProduct = null;
let previewActive = false;
let previewContainer = null;
let previewCanvas = null;
let ctx = null;
let modelImage = null;
let productImage = null;
let dragActive = false;
let lastMousePos = { x: 0, y: 0 };
let productPosition = { x: 0, y: 0, scale: 1, rotation: 0 };

/**
 * Initialize the virtual preview feature
 */
export function initVirtualPreview() {
  // Make the function globally accessible
  window.initVirtualPreview = initVirtualPreview;
  
  // Track initialization state to prevent duplicate initialization
  if (window.virtualPreviewInitialized) {
    console.log('Virtual preview already initialized, updating buttons');
    addPreviewButtonsToProducts();
    return;
  }
  
  // Mark as initialized
  window.virtualPreviewInitialized = true;
  
  // Add preview buttons to all product cards with retry logic
  addPreviewButtonsToProducts(3); // Try up to 3 times
  
  // Create the preview container (hidden initially)
  createPreviewContainer();
  
  // Create the preview canvas
  createPreviewCanvas();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('Virtual preview initialized');
  
  // Schedule periodic checks for new products
  setInterval(() => {
    addPreviewButtonsToProducts(1, true);
  }, 2000);
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
 * Create the preview container
 */
function createPreviewContainer() {
  // Create the container
  previewContainer = document.createElement('div');
  previewContainer.id = 'virtual-preview-container';
  previewContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 hidden';
  
  // Add the container to the body
  document.body.appendChild(previewContainer);
  
  // Create the content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col';
  previewContainer.appendChild(contentWrapper);
  
  // Create the header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 border-b';
  contentWrapper.appendChild(header);
  
  // Add the title
  const title = document.createElement('h3');
  title.className = 'text-xl font-semibold text-gray-900 playfair';
  title.textContent = 'Virtual Try-On';
  header.appendChild(title);
  
  // Add the close button
  const closeButton = document.createElement('button');
  closeButton.className = 'text-gray-400 hover:text-gray-500 focus:outline-none';
  closeButton.innerHTML = '<i class="fas fa-times text-lg"></i>';
  closeButton.addEventListener('click', closePreview);
  header.appendChild(closeButton);
  
  // Create the body
  const body = document.createElement('div');
  body.className = 'p-6 flex-grow overflow-auto flex flex-col md:flex-row gap-6';
  contentWrapper.appendChild(body);
  
  // Create the canvas container
  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'flex-grow flex items-center justify-center bg-gray-100 rounded-lg relative';
  body.appendChild(canvasContainer);
  
  // Add canvas container ID for easy reference
  canvasContainer.id = 'preview-canvas-container';
  
  // Create the controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'w-full md:w-64 flex flex-col gap-4';
  body.appendChild(controlsContainer);
  
  // Add product info container
  const productInfo = document.createElement('div');
  productInfo.className = 'bg-secondary bg-opacity-20 p-4 rounded-lg';
  productInfo.innerHTML = `
    <h4 class="text-lg font-medium mb-2 playfair" id="preview-product-name"></h4>
    <p class="text-primary font-semibold" id="preview-product-price"></p>
    <p class="text-sm text-gray-600 mt-2" id="preview-product-description"></p>
  `;
  controlsContainer.appendChild(productInfo);
  
  // Add controls
  const controls = document.createElement('div');
  controls.className = 'bg-gray-50 p-4 rounded-lg';
  controls.innerHTML = `
    <h4 class="text-sm font-medium mb-3">Adjust Position</h4>
    
    <div class="mb-3">
      <label class="text-xs text-gray-500 block mb-1">Zoom</label>
      <input type="range" min="0.1" max="2" step="0.05" value="1" class="w-full" id="preview-scale-control">
    </div>
    
    <div class="mb-3">
      <label class="text-xs text-gray-500 block mb-1">Rotation</label>
      <input type="range" min="0" max="360" step="5" value="0" class="w-full" id="preview-rotation-control">
    </div>
    
    <p class="text-xs text-gray-500 mt-2">Drag the item to position it</p>
    
    <button class="mt-4 w-full py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors" id="preview-reset-button">
      Reset Position
    </button>
  `;
  controlsContainer.appendChild(controls);
  
  // Add footer with action buttons
  const footer = document.createElement('div');
  footer.className = 'border-t p-4 flex justify-between';
  contentWrapper.appendChild(footer);
  
  // Add the action buttons
  const actionButtons = document.createElement('div');
  actionButtons.className = 'flex gap-3';
  actionButtons.innerHTML = `
    <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors" id="preview-share-button">
      <i class="fas fa-share-alt mr-2"></i>Share
    </button>
    <button class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors" id="preview-add-to-cart-button">
      <i class="fas fa-shopping-bag mr-2"></i>Add to Cart
    </button>
  `;
  footer.appendChild(actionButtons);
}

/**
 * Create the preview canvas
 */
function createPreviewCanvas() {
  // Create the canvas element
  previewCanvas = document.createElement('canvas');
  previewCanvas.width = previewConfig.canvasWidth;
  previewCanvas.height = previewConfig.canvasHeight;
  previewCanvas.className = 'max-w-full max-h-full';
  
  // Add the canvas to the container
  const canvasContainer = document.getElementById('preview-canvas-container');
  canvasContainer.appendChild(previewCanvas);
  
  // Get the canvas context
  ctx = previewCanvas.getContext('2d');
}

/**
 * Set up event listeners for the preview feature
 */
function setupEventListeners() {
  // Scale control
  const scaleControl = document.getElementById('preview-scale-control');
  if (scaleControl) {
    scaleControl.addEventListener('input', (e) => {
      productPosition.scale = parseFloat(e.target.value);
      renderPreview();
    });
  }
  
  // Rotation control
  const rotationControl = document.getElementById('preview-rotation-control');
  if (rotationControl) {
    rotationControl.addEventListener('input', (e) => {
      productPosition.rotation = parseInt(e.target.value);
      renderPreview();
    });
  }
  
  // Reset button
  const resetButton = document.getElementById('preview-reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetProductPosition();
      renderPreview();
    });
  }
  
  // Add to cart button
  const addToCartButton = document.getElementById('preview-add-to-cart-button');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', () => {
      if (!currentProduct) return;
      
      // Import the addToCart function dynamically
      import('./cart-handler.js')
        .then(module => {
          const { addToCart } = module;
          addToCart(currentProduct.id);
          
          // Show confirmation message
          showToast('Added to cart!', 'success');
          
          // Close the preview
          closePreview();
        })
        .catch(error => {
          console.error('Error importing cart handler:', error);
        });
    });
  }
  
  // Share button
  const shareButton = document.getElementById('preview-share-button');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      // Capture the current preview as an image
      const imageData = previewCanvas.toDataURL('image/png');
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `shilpokotha-preview-${currentProduct?.id || 'product'}.png`;
      
      // Trigger the download
      link.click();
      
      // Show confirmation message
      showToast('Preview image saved!', 'success');
    });
  }
  
  // Canvas drag events
  previewCanvas.addEventListener('mousedown', (e) => {
    dragActive = true;
    const rect = previewCanvas.getBoundingClientRect();
    lastMousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  });
  
  previewCanvas.addEventListener('mousemove', (e) => {
    if (!dragActive) return;
    
    const rect = previewCanvas.getBoundingClientRect();
    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Calculate the difference
    const dx = mousePos.x - lastMousePos.x;
    const dy = mousePos.y - lastMousePos.y;
    
    // Update the product position
    productPosition.x += dx;
    productPosition.y += dy;
    
    // Update the last mouse position
    lastMousePos = mousePos;
    
    // Render the preview
    renderPreview();
  });
  
  previewCanvas.addEventListener('mouseup', () => {
    dragActive = false;
  });
  
  previewCanvas.addEventListener('mouseleave', () => {
    dragActive = false;
  });
  
  // Touch events for mobile
  previewCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dragActive = true;
    const rect = previewCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    lastMousePos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  });
  
  previewCanvas.addEventListener('touchmove', (e) => {
    if (!dragActive) return;
    e.preventDefault();
    
    const rect = previewCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mousePos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    
    // Calculate the difference
    const dx = mousePos.x - lastMousePos.x;
    const dy = mousePos.y - lastMousePos.y;
    
    // Update the product position
    productPosition.x += dx;
    productPosition.y += dy;
    
    // Update the last mouse position
    lastMousePos = mousePos;
    
    // Render the preview
    renderPreview();
  });
  
  previewCanvas.addEventListener('touchend', () => {
    dragActive = false;
  });
  
  previewCanvas.addEventListener('touchcancel', () => {
    dragActive = false;
  });
}

/**
 * Open the preview for a specific product
 * @param {string} productId - The ID of the product to preview
 */
export function openPreview(productId) {
  console.log(`Opening preview for product ID: ${productId}`);
  
  try {
    // Get the product data
    let allProducts = [];
    try {
      allProducts = getAllProducts();
    } catch (error) {
      console.error('Error getting all products:', error);
      // Create a fallback product if getAllProducts fails
      allProducts = [];
    }
    
    currentProduct = allProducts.find(product => product.id === productId);
    
    // If product not found in data, create a fallback product object
    if (!currentProduct) {
      console.warn(`Product not found in data: ${productId}, creating fallback product`);
      
      // Extract category from product ID if possible
      let category = 'rings'; // Default category
      if (productId && productId.includes('-')) {
        category = productId.split('-')[0];
        // Make it plural if it's not already
        if (!category.endsWith('s')) {
          category += 's';
        }
      }
      
      // Create a fallback product
      currentProduct = {
        id: productId,
        name: 'Jewelry Item',
        price: 0,
        category: category,
        image: null, // Will use placeholder in loadImages
        description: 'Virtual preview of this jewelry item.'
      };
    }
  } catch (error) {
    console.error('Error in openPreview:', error);
    return;
  }
  
  console.log(`Opening preview for product: ${currentProduct.name}`);
  
  // Update product info
  document.getElementById('preview-product-name').textContent = currentProduct.name;
  document.getElementById('preview-product-price').textContent = `₹${currentProduct.price.toFixed(2)}`;
  document.getElementById('preview-product-description').textContent = currentProduct.description;
  
  // Reset product position
  resetProductPosition();
  
  // Load images
  loadImages()
    .then(() => {
      // Show the preview container
      previewContainer.classList.remove('hidden');
      previewActive = true;
      
      // Render the preview
      renderPreview();
    })
    .catch(error => {
      console.error('Error loading images:', error);
    });
}

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
  const scaleControl = document.getElementById('preview-scale-control');
  if (scaleControl) {
    scaleControl.value = productPosition.scale;
  }
  
  const rotationControl = document.getElementById('preview-rotation-control');
  if (rotationControl) {
    rotationControl.value = productPosition.rotation;
  }
}

/**
 * Load the required images for the preview
 */
async function loadImages() {
  return new Promise((resolve, reject) => {
    // Create model image element
    modelImage = new Image();
    
    // Determine product category if not available
    if (!currentProduct.category) {
      // Try to determine category from product ID or name
      if (currentProduct.id && currentProduct.id.includes('-')) {
        currentProduct.category = currentProduct.id.split('-')[0];
      } else if (currentProduct.name) {
        // Check name for category hints
        const name = currentProduct.name.toLowerCase();
        if (name.includes('ring')) {
          currentProduct.category = 'rings';
        } else if (name.includes('bracelet') || name.includes('bangle')) {
          currentProduct.category = 'bracelets';
        } else if (name.includes('necklace') || name.includes('pendant')) {
          currentProduct.category = 'necklaces';
        } else if (name.includes('earring')) {
          currentProduct.category = 'earrings';
        }
      }
      
      // Default to rings if still no category
      if (!currentProduct.category) {
        currentProduct.category = 'rings';
      }
    }
    
    console.log(`Loading model for category: ${currentProduct.category}`);
    
    // Get the model image for this product category
    const modelSrc = previewConfig.modelImages[currentProduct.category];
    
    // Load the model image
    modelImage.onload = () => {
      // Create product image element
      productImage = new Image();
      
      // Load the product image
      productImage.onload = () => {
        // Apply image processing for better blending
        try {
          processProductImage();
          resolve();
        } catch (error) {
          console.error('Error processing product image:', error);
          resolve(); // Continue anyway with unprocessed image
        }
      };
      
      productImage.onerror = () => {
        console.error(`Failed to load product image: ${currentProduct.image}`);
        // Try to use a fallback image
        productImage.src = 'https://i.imgur.com/placeholder-jewelry.png';
        resolve(); // Continue anyway
      };
      
      // Use the product image or a default if not available
      if (currentProduct.image) {
        productImage.src = currentProduct.image;
      } else if (currentProduct.images && currentProduct.images.length > 0) {
        productImage.src = currentProduct.images[0];
      } else {
        // Use a placeholder based on category
        productImage.src = `https://i.imgur.com/placeholder-${currentProduct.category}.png`;
      }
    };
    
    modelImage.onerror = () => {
      console.error(`Failed to load model image for ${currentProduct.category}`);
      // Use a default model image and continue
      modelImage.src = 'https://i.imgur.com/JQdjBtM.png';
      resolve();
    };
    
    // Use high-quality model images for different product categories
    if (currentProduct.category === 'rings') {
      modelImage.src = 'https://i.imgur.com/JQdjBtM.png'; // Hand model
    } else if (currentProduct.category === 'bracelets') {
      modelImage.src = 'https://i.imgur.com/7gN9GjF.png'; // Wrist model
    } else if (currentProduct.category === 'necklaces') {
      modelImage.src = 'https://i.imgur.com/LFwHJJ0.png'; // Neck model
    } else if (currentProduct.category === 'earrings') {
      modelImage.src = 'https://i.imgur.com/qQ7Lv8E.png'; // Ear model
    } else {
      // Default placeholder
      modelImage.src = 'https://i.imgur.com/JQdjBtM.png';
    }
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
 * Render the preview
 */
function renderPreview() {
  if (!ctx || !modelImage || !productImage) return;
  
  // Clear the canvas
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  
  // Draw the model image
  ctx.drawImage(modelImage, 0, 0, previewCanvas.width, previewCanvas.height);
  
  // Add a subtle shadow effect for depth
  if (currentProduct.category === 'rings' || currentProduct.category === 'bracelets') {
    ctx.save();
    ctx.translate(productPosition.x + 5, productPosition.y + 5);
    ctx.rotate(productPosition.rotation * Math.PI / 180);
    ctx.scale(productPosition.scale, productPosition.scale);
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(5px)';
    const width = productImage.width;
    const height = productImage.height;
    ctx.drawImage(productImage, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
  
  // Save the current state
  ctx.save();
  
  // Translate to the product position
  ctx.translate(productPosition.x, productPosition.y);
  
  // Rotate
  ctx.rotate(productPosition.rotation * Math.PI / 180);
  
  // Scale
  ctx.scale(productPosition.scale, productPosition.scale);
  
  // Apply blending mode based on category
  if (currentProduct.category === 'rings' || currentProduct.category === 'bracelets') {
    ctx.globalCompositeOperation = 'multiply';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
  
  // Draw the product image centered
  const width = productImage.width;
  const height = productImage.height;
  ctx.drawImage(productImage, -width / 2, -height / 2, width, height);
  
  // Add a subtle highlight effect for metallic jewelry
  if (currentProduct.material === 'gold' || 
      currentProduct.material === 'silver' || 
      currentProduct.material === 'platinum' || 
      currentProduct.material === 'white-gold' || 
      currentProduct.material === 'rose-gold') {
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.2;
    ctx.drawImage(productImage, -width / 2, -height / 2, width, height);
  }
  
  // Restore the state
  ctx.restore();
  
  // Add a watermark
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('ShilpoKotha Virtual Try-On', 10, previewCanvas.height - 10);
  ctx.restore();
}

/**
 * Close the preview
 */
function closePreview() {
  // Hide the preview container
  previewContainer.classList.add('hidden');
  previewActive = false;
  
  // Reset variables
  currentProduct = null;
  modelImage = null;
  productImage = null;
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  // Create the toast element
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${type === 'success' ? 'bg-primary text-white' : 'bg-red-500 text-white'}`;
  toast.textContent = message;
  
  // Add the toast to the body
  document.body.appendChild(toast);
  
  // Remove the toast after a delay
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Initialize the virtual preview feature when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing virtual preview');
  initVirtualPreview();
  
  // Add direct event listeners to any try-on buttons that might already exist
  setupDirectEventListeners();
});

// Also listen for the custom event from display-all-products.js
document.addEventListener('productsDisplayed', () => {
  console.log('Products displayed event received, initializing virtual preview');
  initVirtualPreview();
});

/**
 * Set up direct event listeners for try-on buttons
 */
function setupDirectEventListeners() {
  console.log('Setting up direct event listeners for try-on buttons');
  
  // Handle the main try-on button on product.html
  const mainTryOnButton = document.getElementById('virtual-try-on-button');
  if (mainTryOnButton) {
    console.log('Found main try-on button, adding event listener');
    mainTryOnButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = mainTryOnButton.getAttribute('data-product-id');
      console.log(`Main try-on button clicked for product: ${productId}`);
      openPreview(productId);
    });
  }
  
  // Handle all buttons with Virtual Try-On aria-label
  const allTryOnButtons = document.querySelectorAll('button[aria-label="Virtual Try-On"]');
  console.log(`Found ${allTryOnButtons.length} try-on buttons`);
  
  allTryOnButtons.forEach(button => {
    if (button.getAttribute('data-event-attached') !== 'true') {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = button.getAttribute('data-product-id');
        console.log(`Try-on button clicked for product: ${productId}`);
        openPreview(productId);
      });
      button.setAttribute('data-event-attached', 'true');
    }
  });
}
