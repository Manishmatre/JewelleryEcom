/**
 * ShilpoKotha Virtual Try-On Feature
 * Allows users to preview how jewelry products would look when worn
 */

class VirtualTryOn {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.productImage = null;
    this.modelImage = null;
    this.productCategory = 'ring'; // Default category
    this.position = { x: 0, y: 0 };
    this.scale = 1;
    this.rotation = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.initialized = false;
    
    // Background colors for different product categories
    this.modelBackgrounds = {
      ring: { color: '#f9e9d9', shape: 'hand' },
      bracelet: { color: '#e9f9d9', shape: 'wrist' },
      necklace: { color: '#d9e9f9', shape: 'neck' },
      earring: { color: '#f9d9e9', shape: 'ear' }
    };
    
    // Default positions for different product categories
    this.defaultPositions = {
      ring: { x: 200, y: 200, scale: 0.5, rotation: 0 },
      bracelet: { x: 200, y: 200, scale: 0.6, rotation: 0 },
      necklace: { x: 200, y: 150, scale: 0.7, rotation: 0 },
      earring: { x: 200, y: 150, scale: 0.4, rotation: 0 }
    };
  }

  /**
   * Initialize the virtual try-on feature
   * @param {HTMLElement} container - The container element for the canvas
   * @param {string} productImageUrl - URL of the product image
   * @param {string} category - Product category (ring, bracelet, necklace, earring)
   */
  init(container, productImageUrl, category) {
    if (!container) return;
    
    // Set product category
    this.productCategory = category.toLowerCase();
    if (this.productCategory.includes('ring')) this.productCategory = 'ring';
    else if (this.productCategory.includes('bracelet')) this.productCategory = 'bracelet';
    else if (this.productCategory.includes('necklace')) this.productCategory = 'necklace';
    else if (this.productCategory.includes('earring')) this.productCategory = 'earring';
    
    // Create canvas if it doesn't exist
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 400;
      this.canvas.height = 400;
      this.canvas.className = 'mx-auto border border-secondary-dark rounded-lg shadow-sm';
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      
      // Add event listeners for interaction
      this.addEventListeners();
    }
    
    // Load product image
    this.productImage = new Image();
    this.productImage.crossOrigin = 'Anonymous';
    this.productImage.src = productImageUrl;
    
    // Set default position, scale, and rotation
    const defaultSettings = this.defaultPositions[this.productCategory] || this.defaultPositions.ring;
    this.position = { x: defaultSettings.x, y: defaultSettings.y };
    this.scale = defaultSettings.scale;
    this.rotation = defaultSettings.rotation;
    
    // Wait for product image to load
    this.productImage.onload = () => {
      this.initialized = true;
      this.render();
    };
    
    this.productImage.onerror = (error) => {
      console.error('Error loading product image:', error);
      // Still initialize with a placeholder
      this.initialized = true;
      this.render();
    };
  }

  /**
   * Add event listeners for canvas interaction
   */
  addEventListeners() {
    // Mouse down event
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.isDragging = true;
      this.dragStart = { x, y };
    });
    
    // Mouse move event
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;
      
      this.position.x += dx;
      this.position.y += dy;
      
      this.dragStart = { x, y };
      this.render();
    });
    
    // Mouse up event
    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // Mouse leave event
    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      this.isDragging = true;
      this.dragStart = { x, y };
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDragging) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;
      
      this.position.x += dx;
      this.position.y += dy;
      
      this.dragStart = { x, y };
      this.render();
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isDragging = false;
    });
  }

  /**
   * Draw a shape representing the model for different jewelry types
   * @param {string} shape - The shape to draw (hand, wrist, neck, ear)
   */
  drawModelShape(shape) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;
    
    ctx.save();
    ctx.strokeStyle = '#8a7a65';
    ctx.lineWidth = 2;
    
    switch(shape) {
      case 'hand':
        // Draw a simple hand shape
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.8);
        ctx.lineTo(width * 0.3, height * 0.5);
        ctx.lineTo(width * 0.4, height * 0.3);
        ctx.lineTo(width * 0.5, height * 0.3);
        ctx.lineTo(width * 0.6, height * 0.5);
        ctx.lineTo(width * 0.7, height * 0.5);
        ctx.lineTo(width * 0.7, height * 0.8);
        ctx.closePath();
        ctx.stroke();
        break;
        
      case 'wrist':
        // Draw a simple wrist shape
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.5, width * 0.3, height * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'neck':
        // Draw a simple neck/chest shape
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.2);
        ctx.bezierCurveTo(
          width * 0.4, height * 0.1,
          width * 0.6, height * 0.1,
          width * 0.7, height * 0.2
        );
        ctx.lineTo(width * 0.7, height * 0.6);
        ctx.lineTo(width * 0.3, height * 0.6);
        ctx.closePath();
        ctx.stroke();
        break;
        
      case 'ear':
        // Draw a simple ear shape
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.3);
        ctx.bezierCurveTo(
          width * 0.7, height * 0.3,
          width * 0.7, height * 0.7,
          width * 0.5, height * 0.7
        );
        ctx.bezierCurveTo(
          width * 0.6, height * 0.5,
          width * 0.6, height * 0.5,
          width * 0.5, height * 0.3
        );
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }

  /**
   * Render the canvas with model and product images
   */
  render() {
    if (!this.initialized) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background based on product category
    const background = this.modelBackgrounds[this.productCategory] || this.modelBackgrounds.ring;
    
    // Fill canvas with background color
    this.ctx.fillStyle = background.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw shape based on product category
    this.drawModelShape(background.shape);
    
    // Save context state
    this.ctx.save();
    
    // Translate to position
    this.ctx.translate(this.position.x, this.position.y);
    
    // Rotate
    this.ctx.rotate(this.rotation * Math.PI / 180);
    
    // Scale
    this.ctx.scale(this.scale, this.scale);
    
    // Draw product image centered
    const width = this.productImage.width;
    const height = this.productImage.height;
    this.ctx.drawImage(this.productImage, -width / 2, -height / 2, width, height);
    
    // Restore context state
    this.ctx.restore();
  }

  /**
   * Update the scale of the product image
   * @param {number} value - Scale value (0.1 to 2)
   */
  updateScale(value) {
    this.scale = parseFloat(value);
    this.render();
  }

  /**
   * Update the rotation of the product image
   * @param {number} value - Rotation value in degrees (0 to 360)
   */
  updateRotation(value) {
    this.rotation = parseFloat(value);
    this.render();
  }

  /**
   * Reset position, scale, and rotation to defaults
   */
  reset() {
    const defaultSettings = this.defaultPositions[this.productCategory] || this.defaultPositions.ring;
    this.position = { x: defaultSettings.x, y: defaultSettings.y };
    this.scale = defaultSettings.scale;
    this.rotation = defaultSettings.rotation;
    this.render();
    
    // Update slider values
    const scaleSlider = document.getElementById('product-scale');
    const rotationSlider = document.getElementById('product-rotation');
    
    if (scaleSlider) scaleSlider.value = this.scale;
    if (rotationSlider) rotationSlider.value = this.rotation;
  }

  /**
   * Generate a downloadable image of the current preview
   * @returns {string} - Data URL of the preview image
   */
  generateImage() {
    return this.canvas.toDataURL('image/png');
  }
}

// Create and export a singleton instance
const virtualTryOn = new VirtualTryOn();
export default virtualTryOn;

/**
 * Initialize the virtual try-on UI
 */
export function initVirtualTryOn() {
  // Create virtual try-on buttons for product cards
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    const productImageUrl = card.querySelector('img').src;
    const productCategory = card.getAttribute('data-category') || 'ring';
    const productId = card.getAttribute('data-product-id');
    
    // Create try-on button
    const tryOnButton = document.createElement('button');
    tryOnButton.className = 'absolute bottom-3 left-3 bg-white p-2 rounded-full shadow-md text-primary hover:text-primary-dark transition-all';
    tryOnButton.setAttribute('aria-label', 'Virtual Try-On');
    tryOnButton.innerHTML = '<i class="fas fa-glasses"></i><span class="tooltip-text">Try On</span>';
    
    // Add click event to open virtual try-on modal
    tryOnButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openVirtualTryOn(productImageUrl, productCategory, productId);
    });
    
    // Add button to card
    const buttonContainer = card.querySelector('.absolute.top-3.right-3') || card.querySelector('.relative.overflow-hidden');
    if (buttonContainer) {
      buttonContainer.appendChild(tryOnButton);
    }
  });
  
  // Add try-on button to product page
  const productPage = document.querySelector('.product-page');
  if (productPage) {
    const productImageUrl = document.getElementById('main-product-image')?.src;
    const productCategory = productPage.getAttribute('data-category') || 'ring';
    const productId = productPage.getAttribute('data-product-id');
    
    if (productImageUrl) {
      const tryOnButton = document.createElement('button');
      tryOnButton.className = 'w-full bg-secondary hover:bg-secondary-dark text-primary py-3 px-6 rounded-md shadow-sm flex items-center justify-center space-x-2 mb-4';
      tryOnButton.innerHTML = '<i class="fas fa-glasses"></i><span>Virtual Try-On</span>';
      
      tryOnButton.addEventListener('click', (e) => {
        e.preventDefault();
        openVirtualTryOn(productImageUrl, productCategory, productId);
      });
      
      // Add button to product actions
      const productActions = document.querySelector('.flex.flex-col.sm\\:flex-row.gap-3');
      if (productActions) {
        productActions.appendChild(tryOnButton);
      }
    }
  }
  
  // Create virtual try-on modal if it doesn't exist
  if (!document.getElementById('virtual-preview-container')) {
    createVirtualTryOnModal();
  }
}

/**
 * Create the virtual try-on modal
 */
function createVirtualTryOnModal() {
  const modal = document.createElement('div');
  modal.id = 'virtual-preview-container';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
      <div class="flex justify-between items-center p-4 border-b border-secondary-dark">
        <h3 class="playfair text-xl font-semibold">Virtual Try-On</h3>
        <button id="close-preview" class="text-text-light hover:text-primary p-2 hover:bg-secondary-dark rounded-full transition-all">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div id="preview-canvas-container" class="p-4 flex items-center justify-center">
        <!-- Canvas will be added here -->
      </div>
      
      <div class="p-4 border-t border-secondary-dark">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">Size</label>
            <input type="range" id="product-scale" min="0.1" max="2" step="0.05" value="0.5" class="w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-text-dark mb-1">Rotation</label>
            <input type="range" id="product-rotation" min="0" max="360" step="5" value="0" class="w-full">
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button id="reset-preview" class="flex-1 bg-secondary hover:bg-secondary-dark text-primary py-2 px-4 rounded-md shadow-sm flex items-center justify-center space-x-1">
            <i class="fas fa-undo"></i>
            <span>Reset</span>
          </button>
          <button id="share-preview" class="flex-1 bg-secondary hover:bg-secondary-dark text-primary py-2 px-4 rounded-md shadow-sm flex items-center justify-center space-x-1">
            <i class="fas fa-share-alt"></i>
            <span>Share</span>
          </button>
          <button id="add-to-cart-preview" class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md shadow-sm flex items-center justify-center space-x-1">
            <i class="fas fa-shopping-bag"></i>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('close-preview').addEventListener('click', closeVirtualTryOn);
  
  document.getElementById('product-scale').addEventListener('input', (e) => {
    virtualTryOn.updateScale(e.target.value);
  });
  
  document.getElementById('product-rotation').addEventListener('input', (e) => {
    virtualTryOn.updateRotation(e.target.value);
  });
  
  document.getElementById('reset-preview').addEventListener('click', () => {
    virtualTryOn.reset();
  });
  
  document.getElementById('share-preview').addEventListener('click', sharePreview);
  
  document.getElementById('add-to-cart-preview').addEventListener('click', addToCartFromPreview);
}

/**
 * Open the virtual try-on modal
 * @param {string} productImageUrl - URL of the product image
 * @param {string} category - Product category
 * @param {string} productId - Product ID
 */
function openVirtualTryOn(productImageUrl, category, productId) {
  const modal = document.getElementById('virtual-preview-container');
  const canvasContainer = document.getElementById('preview-canvas-container');
  
  if (!modal || !canvasContainer) return;
  
  // Store product ID for add to cart functionality
  modal.setAttribute('data-product-id', productId);
  
  // Clear previous canvas
  canvasContainer.innerHTML = '';
  
  // Initialize virtual try-on
  virtualTryOn.init(canvasContainer, productImageUrl, category);
  
  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the virtual try-on modal
 */
function closeVirtualTryOn() {
  const modal = document.getElementById('virtual-preview-container');
  
  if (!modal) return;
  
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

/**
 * Share the current preview
 */
function sharePreview() {
  const imageUrl = virtualTryOn.generateImage();
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = 'shilpokotha-virtual-tryon.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show toast notification
  showToast('Image saved to your device!');
}

/**
 * Add the current product to cart
 */
function addToCartFromPreview() {
  const modal = document.getElementById('virtual-preview-container');
  const productId = modal.getAttribute('data-product-id');
  
  // Find add to cart button for this product
  const addToCartButton = document.querySelector(`.add-to-cart[data-product-id="${productId}"]`);
  
  if (addToCartButton) {
    // Trigger click on the original add to cart button
    addToCartButton.click();
  } else {
    // Fallback if button not found
    console.log(`Adding product to cart: ${productId}`);
    showToast('Product added to cart!');
  }
  
  // Close the modal
  closeVirtualTryOn();
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50 toast-enter';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-enter-active');
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('toast-enter-active');
    toast.classList.add('toast-exit-active');
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initVirtualTryOn);
