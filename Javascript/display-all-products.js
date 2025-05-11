/**
 * ShilpoKotha Display All Products
 * This script displays all products from our database in the existing product grid
 * with filtering functionality
 */

import { getAllProducts } from './products-data-additional.js';
import { categories, materials, priceRanges } from './products-data.js';

// Debug flag - set to true to see console logs
const DEBUG = true;

// State variables
let currentFilters = {
  categories: [],
  materials: [],
  priceMin: 0,
  priceMax: 5000,
  gemstones: [],
  searchQuery: ''
};

// Current sort option
let currentSortOption = 'Featured';

let allProducts = [];
let filteredProducts = [];
let template = null;
let productsContainer = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing product display');
  
  // Get the products container
  productsContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
  
  if (!productsContainer) {
    console.error('Product container not found!');
    return;
  }
  
  // Get all products
  allProducts = getAllProducts();
  if (DEBUG) console.log(`Loaded ${allProducts.length} products`);
  filteredProducts = [...allProducts];
  
  // Clear existing product cards (keep the first one as template)
  if (productsContainer.children.length > 0) {
    template = productsContainer.children[0].cloneNode(true);
    productsContainer.innerHTML = '';
  } else {
    console.error('No product template found in the container');
    return;
  }
  
  // Set up event listeners for filters
  setupFilterListeners();
  
  // Display all products
  displayProducts(filteredProducts);
});

/**
 * Update the product count display
 */
function updateProductCount(count) {
  const productCountElement = document.querySelector('.text-text-light span');
  if (productCountElement) {
    productCountElement.textContent = count;
  }
}

/**
 * Set up event listeners for filters
 */
function setupFilterListeners() {
  if (DEBUG) console.log('Setting up filter listeners');
  
  // Product search bar
  const productSearch = document.getElementById('product-search');
  if (productSearch) {
    if (DEBUG) console.log('Found product search bar');
    
    // Add input event listener with debounce for better performance
    let searchTimeout;
    productSearch.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchQuery = productSearch.value.trim().toLowerCase();
        if (DEBUG) console.log(`Search query: "${searchQuery}"`);
        
        currentFilters.searchQuery = searchQuery;
        applyFilters();
      }, 300); // 300ms debounce
    });
    
    // Add keydown event listener for Enter key
    productSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const searchQuery = productSearch.value.trim().toLowerCase();
        if (DEBUG) console.log(`Search query (Enter pressed): "${searchQuery}"`);
        
        currentFilters.searchQuery = searchQuery;
        applyFilters();
      }
    });
  } else {
    console.error('Product search bar not found');
  }
  
  // Sort-by dropdown
  const sortByDropdown = document.getElementById('sort-by');
  if (sortByDropdown) {
    if (DEBUG) console.log('Found sort-by dropdown');
    
    sortByDropdown.addEventListener('change', () => {
      currentSortOption = sortByDropdown.value;
      if (DEBUG) console.log(`Sort option changed to: ${currentSortOption}`);
      
      // Apply sorting to current filtered products
      sortProducts();
      displayProducts(filteredProducts);
    });
  } else {
    console.error('Sort-by dropdown not found');
  }
  
  // Category filters - target all checkboxes in the first filter section
  const categorySection = document.querySelector('.mb-6:nth-of-type(1)');
  if (categorySection) {
    const categoryCheckboxes = categorySection.querySelectorAll('input[type="checkbox"]');
    if (DEBUG) console.log(`Found ${categoryCheckboxes.length} category checkboxes`);
    
    categoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (DEBUG) console.log(`Category checkbox changed: ${checkbox.nextElementSibling.textContent.trim()}`);
        updateCategoryFilters();
        applyFilters();
      });
    });
  } else {
    console.error('Category filter section not found');
  }
  
  // Find the price range section by its heading text
  const priceHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Price Range');
  if (!priceHeading) {
    console.error('Price Range heading not found');
  } else {
    const priceSection = priceHeading.closest('.mb-6');
    if (!priceSection) {
      console.error('Price Range section not found');
    } else {
      if (DEBUG) console.log('Found price range section');
      
      // Price range slider
      const priceRangeSlider = priceSection.querySelector('input[type="range"]');
      if (priceRangeSlider) {
        if (DEBUG) console.log('Found price range slider');
        
        priceRangeSlider.addEventListener('input', (e) => {
          const maxPrice = parseInt(e.target.value);
          currentFilters.priceMax = maxPrice;
          if (DEBUG) console.log(`Price slider changed: max price = ${maxPrice}`);
          
          // Update the displayed max price
          const maxPriceDisplay = priceSection.querySelector('.flex.justify-between.text-xs.text-text-light.mt-2 span:last-child');
          if (maxPriceDisplay) {
            maxPriceDisplay.textContent = `$${maxPrice}`;
          }
          applyFilters();
        });
      } else {
        console.error('Price range slider not found');
      }
      
      // Min/Max price inputs
      const minPriceInput = priceSection.querySelector('input[placeholder="Min"]');
      const maxPriceInput = priceSection.querySelector('input[placeholder="Max"]');
      
      if (minPriceInput && maxPriceInput) {
        if (DEBUG) console.log('Found min/max price inputs');
      } else {
        console.error('Min/Max price inputs not found');
      }
      
      // Apply Filters button
      const applyFiltersBtn = document.querySelector('button.w-full.bg-primary');
      if (applyFiltersBtn) {
        if (DEBUG) console.log('Found Apply Filters button');
        
        applyFiltersBtn.addEventListener('click', () => {
          if (DEBUG) console.log('Apply Filters button clicked');
          
          const min = parseInt(minPriceInput?.value) || 0;
          const max = parseInt(maxPriceInput?.value) || 1000;
          currentFilters.priceMin = min;
          currentFilters.priceMax = max;
          
          if (DEBUG) console.log(`Apply price range: min=${min}, max=${max}`);
          
          // Update the slider if it exists
          if (priceRangeSlider) {
            priceRangeSlider.value = max;
            // Update the displayed max price
            const maxPriceDisplay = priceSection.querySelector('.flex.justify-between.text-xs.text-text-light.mt-2 span:last-child');
            if (maxPriceDisplay) {
              maxPriceDisplay.textContent = `$${max}`;
            }
          }
          
          applyFilters();
        });
      } else {
        console.error('Apply filters button not found');
      }
    }
  }
  
  // Material filters - target all checkboxes in the third filter section
  const materialSection = document.querySelector('.mb-6:nth-of-type(3)');
  if (materialSection) {
    const materialCheckboxes = materialSection.querySelectorAll('input[type="checkbox"]');
    if (DEBUG) console.log(`Found ${materialCheckboxes.length} material checkboxes`);
    
    materialCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (DEBUG) console.log(`Material checkbox changed: ${checkbox.nextElementSibling.textContent.trim()}`);
        updateMaterialFilters();
        applyFilters();
      });
    });
  } else {
    console.error('Material filter section not found');
  }
  
  // Gemstone filters - target all checkboxes in the fourth filter section
  const gemstoneSection = document.querySelector('.mb-6:nth-of-type(4)');
  if (gemstoneSection) {
    const gemstoneCheckboxes = gemstoneSection.querySelectorAll('input[type="checkbox"]');
    if (DEBUG) console.log(`Found ${gemstoneCheckboxes.length} gemstone checkboxes`);
    
    gemstoneCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (DEBUG) console.log(`Gemstone checkbox changed: ${checkbox.nextElementSibling.textContent.trim()}`);
        updateGemstoneFilters();
        applyFilters();
      });
    });
  } else {
    console.error('Gemstone filter section not found');
  }
  
  // Clear filters button
  const clearFiltersBtn = document.querySelector('button.w-full.text-text-light');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      if (DEBUG) console.log('Clear filters button clicked');
      clearAllFilters();
    });
  } else {
    console.error('Clear filters button not found');
  }
}

/**
 * Update category filters based on checkbox state
 */
function updateCategoryFilters() {
  currentFilters.categories = [];
  
  if (DEBUG) console.log('Updating category filters');
  
  // Find the category filter section by its heading text
  const categoryHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Category');
  if (!categoryHeading) {
    console.error('Category heading not found');
    return;
  }
  
  const categorySection = categoryHeading.closest('.mb-6');
  if (!categorySection) {
    console.error('Category section not found');
    return;
  }
  
  if (DEBUG) console.log('Found category section:', categorySection);
  
  // Get all category checkboxes except "All Categories"
  const allCategoriesCheckbox = categorySection.querySelector('input[type="checkbox"]:first-of-type');
  const categoryCheckboxes = categorySection.querySelectorAll('input[type="checkbox"]:not(:first-of-type)');
  
  if (DEBUG) console.log(`Found ${categoryCheckboxes.length} category checkboxes`);
  
  // If "All Categories" is checked, clear the categories filter
  if (allCategoriesCheckbox && allCategoriesCheckbox.checked) {
    if (DEBUG) console.log('All Categories is checked, clearing category filters');
    currentFilters.categories = [];
    return;
  }
  
  // Otherwise, add each checked category to the filter
  categoryCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      // Extract category name from the label text
      const label = checkbox.nextElementSibling.textContent.trim().toLowerCase();
      
      if (DEBUG) console.log(`Category checkbox checked: ${label}`);
      
      // Map UI category names to database category names
      let categoryValue = label;
      if (label === 'necklaces') categoryValue = 'necklaces';
      else if (label === 'earrings') categoryValue = 'earrings';
      else if (label === 'bracelets') categoryValue = 'bracelets';
      else if (label === 'rings') categoryValue = 'rings';
      else if (label === 'jewelry sets') categoryValue = 'sets';
      
      currentFilters.categories.push(categoryValue);
    }
  });
  
  if (DEBUG) console.log('Updated category filters:', currentFilters.categories);
}

/**
 * Update material filters based on checkbox state
 */
function updateMaterialFilters() {
  currentFilters.materials = [];
  
  if (DEBUG) console.log('Updating material filters');
  
  // Find the material filter section by its heading text
  const materialHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Material');
  if (!materialHeading) {
    console.error('Material heading not found');
    return;
  }
  
  const materialSection = materialHeading.closest('.mb-6');
  if (!materialSection) {
    console.error('Material section not found');
    return;
  }
  
  if (DEBUG) console.log('Found material section:', materialSection);
  
  const materialCheckboxes = materialSection.querySelectorAll('input[type="checkbox"]');
  if (DEBUG) console.log(`Found ${materialCheckboxes.length} material checkboxes`);
  
  materialCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      // Extract material name from the label text and convert to lowercase with hyphens
      const label = checkbox.nextElementSibling.textContent.trim().toLowerCase();
      if (DEBUG) console.log(`Material checkbox checked: ${label}`);
      
      // Convert spaces to hyphens for matching with our data model
      const materialValue = label.replace(/\s+/g, '-');
      currentFilters.materials.push(materialValue);
    }
  });
  
  if (DEBUG) console.log('Updated material filters:', currentFilters.materials);
}

/**
 * Update gemstone filters based on checkbox state
 */
function updateGemstoneFilters() {
  currentFilters.gemstones = [];
  
  if (DEBUG) console.log('Updating gemstone filters');
  
  // Find the gemstone filter section by its heading text
  const gemstoneHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Gemstone');
  if (!gemstoneHeading) {
    console.error('Gemstone heading not found');
    return;
  }
  
  const gemstoneSection = gemstoneHeading.closest('.mb-6');
  if (!gemstoneSection) {
    console.error('Gemstone section not found');
    return;
  }
  
  if (DEBUG) console.log('Found gemstone section:', gemstoneSection);
  
  const gemstoneCheckboxes = gemstoneSection.querySelectorAll('input[type="checkbox"]');
  if (DEBUG) console.log(`Found ${gemstoneCheckboxes.length} gemstone checkboxes`);
  
  gemstoneCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      // Extract gemstone name from the label text
      const label = checkbox.nextElementSibling.textContent.trim().toLowerCase();
      if (DEBUG) console.log(`Gemstone checkbox checked: ${label}`);
      currentFilters.gemstones.push(label);
    }
  });
  
  if (DEBUG) console.log('Updated gemstone filters:', currentFilters.gemstones);
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  if (DEBUG) console.log('Clearing all filters');
  
  // Reset category checkboxes
  const categoryHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Category');
  if (categoryHeading) {
    const categorySection = categoryHeading.closest('.mb-6');
    if (categorySection) {
      const allCategoriesCheckbox = categorySection.querySelector('input[type="checkbox"]:first-of-type');
      const otherCategoryCheckboxes = categorySection.querySelectorAll('input[type="checkbox"]:not(:first-of-type)');
      
      // Set "All Categories" to checked
      if (allCategoriesCheckbox) {
        allCategoriesCheckbox.checked = true;
      }
      
      // Set all other category checkboxes to unchecked
      otherCategoryCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    }
  }
  
  // Reset material checkboxes
  const materialHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Material');
  if (materialHeading) {
    const materialSection = materialHeading.closest('.mb-6');
    if (materialSection) {
      const materialCheckboxes = materialSection.querySelectorAll('input[type="checkbox"]');
      materialCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    }
  }
  
  // Reset gemstone checkboxes
  const gemstoneHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Gemstone');
  if (gemstoneHeading) {
    const gemstoneSection = gemstoneHeading.closest('.mb-6');
    if (gemstoneSection) {
      const gemstoneCheckboxes = gemstoneSection.querySelectorAll('input[type="checkbox"]');
      gemstoneCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    }
  }
  
  // Reset price range slider
  const priceHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === 'Price Range');
  if (priceHeading) {
    const priceSection = priceHeading.closest('.mb-6');
    if (priceSection) {
      // Reset price range slider
      const priceRangeSlider = priceSection.querySelector('input[type="range"]');
      if (priceRangeSlider) {
        priceRangeSlider.value = 1000;
      }
      
      // Reset min/max price inputs
      const minPriceInput = priceSection.querySelector('input[placeholder="Min"]');
      const maxPriceInput = priceSection.querySelector('input[placeholder="Max"]');
      if (minPriceInput) minPriceInput.value = '';
      if (maxPriceInput) maxPriceInput.value = '';
      
      // Update the displayed max price
      const maxPriceDisplay = priceSection.querySelector('.flex.justify-between.text-xs.text-text-light.mt-2 span:last-child');
      if (maxPriceDisplay) {
        maxPriceDisplay.textContent = `$1000`;
      }
    }
  }
  
  // Clear search bar
  const productSearch = document.getElementById('product-search');
  if (productSearch) {
    productSearch.value = '';
  }
  
  // Reset filter state
  currentFilters = {
    categories: [],
    materials: [],
    priceMin: 0,
    priceMax: 1000,
    gemstones: [],
    searchQuery: ''
  };
  
  if (DEBUG) console.log('Filters reset to defaults');
  
  // Re-apply filters (which will show all products)
  applyFilters();
}

/**
 * Sort products based on the selected sort option
 */
function sortProducts() {
  if (DEBUG) console.log(`Sorting products by: ${currentSortOption}`);
  
  switch(currentSortOption) {
    case 'Price: Low to High':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
      
    case 'Price: High to Low':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
      
    case 'Newest First':
      // Sort by date if available, otherwise keep original order
      filteredProducts.sort((a, b) => {
        if (a.dateAdded && b.dateAdded) {
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        }
        // If no date, assume newer products are at the end of the array
        return allProducts.indexOf(a) - allProducts.indexOf(b);
      });
      break;
      
    case 'Best Selling':
      // Sort by sales count if available
      filteredProducts.sort((a, b) => {
        const aSales = a.sales || 0;
        const bSales = b.sales || 0;
        return bSales - aSales;
      });
      break;
      
    case 'Featured':
    default:
      // For featured, we can prioritize products marked as featured
      filteredProducts.sort((a, b) => {
        const aFeatured = a.featured ? 1 : 0;
        const bFeatured = b.featured ? 1 : 0;
        return bFeatured - aFeatured;
      });
      break;
  }
  
  if (DEBUG) console.log('Products sorted successfully');
}

/**
 * Apply filters to products
 */
function applyFilters() {
  if (DEBUG) console.log('Applying filters:', currentFilters);
  
  filteredProducts = allProducts.filter(product => {
    // Filter by search query
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(query);
      const categoryMatch = product.category.toLowerCase().includes(query);
      const materialMatch = product.material?.toLowerCase().includes(query) || false;
      
      // Search in product details if available
      let descriptionMatch = false;
      if (product.details && product.details.description) {
        descriptionMatch = product.details.description.toLowerCase().includes(query);
      }
      
      // Search in gemstones if available
      let stonesMatch = false;
      if (product.details && product.details.stones) {
        stonesMatch = product.details.stones.toLowerCase().includes(query);
      }
      
      // If the query doesn't match any product field, exclude this product
      if (!(nameMatch || categoryMatch || materialMatch || descriptionMatch || stonesMatch)) {
        return false;
      }
    }
    
    // Filter by category
    if (currentFilters.categories.length > 0) {
      if (!currentFilters.categories.includes(product.category)) {
        return false;
      }
    }
    
    // Filter by material
    if (currentFilters.materials.length > 0) {
      if (!currentFilters.materials.includes(product.material)) {
        return false;
      }
    }
    
    // Filter by price
    if (product.price < currentFilters.priceMin || product.price > currentFilters.priceMax) {
      return false;
    }
    
    // Filter by gemstone
    if (currentFilters.gemstones.length > 0) {
      // Check if product has gemstone details
      if (!product.details || !product.details.stones) {
        return false;
      }
      
      // Check if any of the selected gemstones are in the product's stones
      const productStones = product.details.stones.toLowerCase();
      const hasSelectedGemstone = currentFilters.gemstones.some(gemstone => 
        productStones.includes(gemstone)
      );
      
      if (!hasSelectedGemstone) {
        return false;
      }
    }
    
    return true;
  });
  
  if (DEBUG) console.log(`Filtered products: ${filteredProducts.length} of ${allProducts.length}`);
  
  // Apply current sort option to filtered products
  sortProducts();
  
  // Display filtered products
  displayProducts(filteredProducts);
}

/**
 * Display products in the grid
 */
function displayProducts(products) {
  // Clear the container
  productsContainer.innerHTML = '';
  
  // Update product count
  updateProductCount(products.length);
  
  // If no products match the filters
  if (products.length === 0) {
    const noProductsMessage = document.createElement('div');
    noProductsMessage.className = 'col-span-full text-center py-12';
    noProductsMessage.innerHTML = `
      <i class="fas fa-search text-4xl text-secondary-dark mb-4"></i>
      <h3 class="text-xl font-medium mb-2">No products found</h3>
      <p class="text-text-light mb-4">Try adjusting your filters</p>
      <button id="reset-filters-btn" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-all">Reset Filters</button>
    `;
    productsContainer.appendChild(noProductsMessage);
    
    // Add event listener to reset filters button
    setTimeout(() => {
      const resetButton = document.getElementById('reset-filters-btn');
      if (resetButton) {
        resetButton.addEventListener('click', clearAllFilters);
      }
    }, 100);
    
    return;
  }
  
  // Display each product
  products.forEach(product => {
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
}
