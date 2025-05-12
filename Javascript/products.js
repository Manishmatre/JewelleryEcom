/**
 * ShilpoKotha Products Page Functionality
 * This file contains all JavaScript functionality specific to the products listing page
 */

// Mobile Menu Functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const closeMobileMenuButton = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuContent = mobileMenu.querySelector('div');

mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.remove('hidden');
  setTimeout(() => {
    mobileMenuContent.classList.remove('-translate-x-full');
  }, 10);
});

closeMobileMenuButton.addEventListener('click', () => {
  mobileMenuContent.classList.add('-translate-x-full');
  setTimeout(() => {
    mobileMenu.classList.add('hidden');
  }, 300);
});

// Mobile Collections Dropdown
const mobileCollectionsButton = document.getElementById('mobile-collections-button');
const mobileCollectionsMenu = document.getElementById('mobile-collections-menu');

if (mobileCollectionsButton && mobileCollectionsMenu) {
  mobileCollectionsButton.addEventListener('click', () => {
    mobileCollectionsMenu.classList.toggle('hidden');
  });
}

// Filter functionality
const priceRange = document.querySelector('input[type="range"]');
const minPriceInput = document.querySelector('input[placeholder="Min"]');
const maxPriceInput = document.querySelector('input[placeholder="Max"]');
const applyFiltersButton = document.querySelector('button.bg-primary');
const clearFiltersButton = document.querySelector('button.text-text-light');
const categoryCheckboxes = document.querySelectorAll('.mb-6:first-child input[type="checkbox"]');

// Update min/max inputs when range slider changes
if (priceRange) {
  priceRange.addEventListener('input', (e) => {
    const value = e.target.value;
    maxPriceInput.value = value;
  });
}

// Apply filters
if (applyFiltersButton) {
  applyFiltersButton.addEventListener('click', () => {
    // Get selected categories
    const selectedCategories = [];
    categoryCheckboxes.forEach(checkbox => {
      if (checkbox.checked && checkbox.nextElementSibling.textContent.trim() !== 'All Categories') {
        selectedCategories.push(checkbox.nextElementSibling.textContent.trim());
      }
    });
    // Get price range
    const minPrice = minPriceInput.value || 0;
    const maxPrice = maxPriceInput.value || 75000;
    
    // Here you would typically filter products based on these criteria
    console.log('Filtering products with:');
    console.log('Categories:', selectedCategories.length ? selectedCategories : 'All');
    console.log('Price range:', `₹${minPrice} - ₹${maxPrice}`);
    
    // Show confirmation message
    const confirmationMessage = document.createElement('div');
    confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
    confirmationMessage.textContent = 'Filters applied!';
    document.body.appendChild(confirmationMessage);
    
    setTimeout(() => {
      confirmationMessage.remove();
    }, 3000);
  });
}

// Clear filters
if (clearFiltersButton) {
  clearFiltersButton.addEventListener('click', () => {
    // Reset checkboxes
    categoryCheckboxes.forEach((checkbox, index) => {
      checkbox.checked = index === 0; // Only check 'All Categories'
    });
    // Reset price inputs
    if (priceRange) priceRange.value = 37500;
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    
    // Show confirmation message
    const confirmationMessage = document.createElement('div');
    confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
    confirmationMessage.textContent = 'Filters cleared!';
    document.body.appendChild(confirmationMessage);
    
    setTimeout(() => {
      confirmationMessage.remove();
    }, 3000);
  });
}

// Sort functionality
const sortSelect = document.getElementById('sort-by');

if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    const sortOption = sortSelect.value;
    console.log('Sorting products by:', sortOption);
    
    // Here you would typically sort products based on the selected option
    // For now, we'll just show a message
    const confirmationMessage = document.createElement('div');
    confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
    confirmationMessage.textContent = `Products sorted by: ${sortOption}`;
    document.body.appendChild(confirmationMessage);
    
    setTimeout(() => {
      confirmationMessage.remove();
    }, 3000);
  });
}

// View toggle functionality
const gridViewButton = document.querySelector('button[aria-label="Grid view"]');
const listViewButton = document.querySelector('button[aria-label="List view"]');
const productsGrid = document.querySelector('.grid.grid-cols-1');

if (gridViewButton && listViewButton && productsGrid) {
  gridViewButton.addEventListener('click', () => {
    gridViewButton.classList.add('text-primary');
    gridViewButton.classList.remove('text-text-light');
    listViewButton.classList.add('text-text-light');
    listViewButton.classList.remove('text-primary');
    
    productsGrid.classList.remove('grid-cols-1');
    productsGrid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });
  
  listViewButton.addEventListener('click', () => {
    listViewButton.classList.add('text-primary');
    listViewButton.classList.remove('text-text-light');
    gridViewButton.classList.add('text-text-light');
    gridViewButton.classList.remove('text-primary');
    
    productsGrid.classList.remove('sm:grid-cols-2', 'lg:grid-cols-3');
    productsGrid.classList.add('grid-cols-1');
  });
}

// Add to Cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Import the required functions from local-storage.js
import('./local-storage.js')
  .then(module => {
    const { addToCart } = module;
    
    // Import the updateCartCount function from header-manager.js
    import('./header-manager.js')
      .then(headerModule => {
        const { updateCartCount } = headerModule;
        
        addToCartButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            const productName = button.getAttribute('data-product-name');
            const productPrice = parseFloat(button.getAttribute('data-product-price'));
            const productImage = button.closest('.group').querySelector('img').src;
            
            const product = {
              id: productId,
              name: productName,
              price: productPrice,
              image: productImage
            };
            
            // Add the product to the cart using the local-storage function
            const result = addToCart(product, 1);
            
            if (result.success) {
              // Update cart count
              updateCartCount();
              
              // Show confirmation message
              const confirmationMessage = document.createElement('div');
              confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
              confirmationMessage.textContent = `${productName} added to cart!`;
              document.body.appendChild(confirmationMessage);
              
              setTimeout(() => {
                confirmationMessage.remove();
              }, 3000);
            } else {
              // Show error message
              const errorMessage = document.createElement('div');
              errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
              errorMessage.textContent = result.error || 'Failed to add item to cart. Please try again.';
              document.body.appendChild(errorMessage);
              
              setTimeout(() => {
                errorMessage.remove();
              }, 3000);
            }
          });
        });
      });
  });

// Quick view functionality
const quickViewButtons = document.querySelectorAll('button[aria-label="Quick view"]');

quickViewButtons.forEach(button => {
  button.addEventListener('click', () => {
    const productCard = button.closest('.group');
    const productImage = productCard.querySelector('img').src;
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('.text-primary').textContent;
    const productDescription = productCard.querySelector('p').textContent;
    
    // Create quick view modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="flex justify-end p-4">
          <button class="text-text-light hover:text-primary" id="close-modal">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        <div class="flex flex-col md:flex-row p-4 gap-6">
          <div class="md:w-1/2">
            <img src="${productImage}" alt="${productName}" class="w-full h-auto rounded-lg">
          </div>
          <div class="md:w-1/2">
            <h2 class="text-2xl font-semibold text-text-dark mb-2">${productName}</h2>
            <div class="text-yellow-400 text-sm mb-2">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star-half-alt"></i>
              <span class="text-text-light ml-1">(24 reviews)</span>
            </div>
            <p class="text-primary text-xl font-semibold mb-4">${productPrice}</p>
            <p class="text-text-light mb-6">${productDescription}</p>
            <div class="mb-4">
              <label class="block text-text-dark font-medium mb-2">Quantity</label>
              <div class="flex items-center">
                <button class="bg-secondary-dark text-text-dark px-3 py-1 rounded-l-md">-</button>
                <input type="number" value="1" min="1" class="w-16 text-center border-y border-secondary-dark py-1">
                <button class="bg-secondary-dark text-text-dark px-3 py-1 rounded-r-md">+</button>
              </div>
            </div>
            <button class="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md transition-all font-medium mb-2">Add to Cart</button>
            <button class="w-full border border-primary text-primary hover:bg-primary hover:text-white py-2 rounded-md transition-all font-medium">Buy Now</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal functionality
    const closeModal = modal.querySelector('#close-modal');
    closeModal.addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
      }
    });
  });
});

// Wishlist functionality
const wishlistButtons = document.querySelectorAll('button[aria-label="Add to wishlist"]');

wishlistButtons.forEach(button => {
  button.addEventListener('click', () => {
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('far')) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.color = '#e53e3e';
      
      // Show confirmation message
      const confirmationMessage = document.createElement('div');
      confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
      confirmationMessage.textContent = 'Added to wishlist!';
      document.body.appendChild(confirmationMessage);
      
      setTimeout(() => {
        confirmationMessage.remove();
      }, 3000);
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.style.color = '';
      
      // Show confirmation message
      const confirmationMessage = document.createElement('div');
      confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
      confirmationMessage.textContent = 'Removed from wishlist!';
      document.body.appendChild(confirmationMessage);
      
      setTimeout(() => {
        confirmationMessage.remove();
      }, 3000);
    }
  });
});

// Newsletter subscription
const newsletterForm = document.querySelector('form');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    if (email && email.includes('@')) {
      // Here you would typically send the email to your server
      console.log(`Newsletter subscription: ${email}`);
      
      // Show confirmation message
      const confirmationMessage = document.createElement('div');
      confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
      confirmationMessage.textContent = 'Thank you for subscribing to our newsletter!';
      document.body.appendChild(confirmationMessage);
      
      emailInput.value = '';
      
      setTimeout(() => {
        confirmationMessage.remove();
      }, 3000);
    } else {
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorMessage.textContent = 'Please enter a valid email address.';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    }
  });
}

// URL parameter handling for category filtering
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Check if category parameter exists and apply filter
const categoryParam = getUrlParameter('category');
if (categoryParam) {
  // Find the checkbox for this category and check it
  categoryCheckboxes.forEach(checkbox => {
    const categoryName = checkbox.nextElementSibling.textContent.trim().toLowerCase();
    if (categoryName === categoryParam.toLowerCase()) {
      checkbox.checked = true;
      // Uncheck 'All Categories'
      categoryCheckboxes[0].checked = false;
      
      // Apply filter automatically
      if (applyFiltersButton) {
        applyFiltersButton.click();
      }
    }
  });
}
