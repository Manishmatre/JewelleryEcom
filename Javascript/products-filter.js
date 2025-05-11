/**
 * ShilpoKotha Products Filter System
 * This file handles filtering products based on various criteria
 */

import { getAllProducts } from './products-data-additional.js';
import { categories, materials, priceRanges } from './products-data.js';

/**
 * Filter products based on specified criteria
 * @param {Object} filters - The filter criteria
 * @returns {Array} - Filtered products array
 */
export function filterProducts(filters = {}) {
  const allProducts = getAllProducts();
  
  return allProducts.filter(product => {
    // Category filter
    if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    
    // Subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all' && product.subcategory !== filters.subcategory) {
      return false;
    }
    
    // Material filter
    if (filters.material && filters.material !== 'all' && product.material !== filters.material) {
      return false;
    }
    
    // Price range filter
    if (filters.priceRange && filters.priceRange !== 'all') {
      const range = priceRanges.find(range => range.id === filters.priceRange);
      if (range && (product.price < range.min || product.price > range.max)) {
        return false;
      }
    }
    
    // Featured filter
    if (filters.featured === true && !product.featured) {
      return false;
    }
    
    // New arrivals filter
    if (filters.new === true && !product.new) {
      return false;
    }
    
    // Best sellers filter
    if (filters.bestSeller === true && !product.bestSeller) {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      const nameMatch = product.name.toLowerCase().includes(query);
      const descriptionMatch = product.description.toLowerCase().includes(query);
      const categoryMatch = product.category.toLowerCase().includes(query);
      
      if (!nameMatch && !descriptionMatch && !categoryMatch) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort products based on specified criteria
 * @param {Array} products - The products array to sort
 * @param {String} sortBy - The sort criteria
 * @returns {Array} - Sorted products array
 */
export function sortProducts(products, sortBy = 'featured') {
  const productsCopy = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
      return productsCopy.sort((a, b) => a.price - b.price);
    
    case 'price-high-low':
      return productsCopy.sort((a, b) => b.price - a.price);
    
    case 'newest':
      return productsCopy.sort((a, b) => a.new === b.new ? 0 : a.new ? -1 : 1);
    
    case 'best-selling':
      return productsCopy.sort((a, b) => a.bestSeller === b.bestSeller ? 0 : a.bestSeller ? -1 : 1);
    
    case 'rating':
      return productsCopy.sort((a, b) => b.rating - a.rating);
    
    case 'name-a-z':
      return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'name-z-a':
      return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
    
    case 'featured':
    default:
      return productsCopy.sort((a, b) => a.featured === b.featured ? 0 : a.featured ? -1 : 1);
  }
}

/**
 * Get filter options for the UI
 * @returns {Object} - Filter options
 */
export function getFilterOptions() {
  return {
    categories,
    materials,
    priceRanges,
    sortOptions: [
      { id: 'featured', name: 'Featured' },
      { id: 'price-low-high', name: 'Price: Low to High' },
      { id: 'price-high-low', name: 'Price: High to Low' },
      { id: 'newest', name: 'Newest Arrivals' },
      { id: 'best-selling', name: 'Best Selling' },
      { id: 'rating', name: 'Highest Rated' },
      { id: 'name-a-z', name: 'Name: A to Z' },
      { id: 'name-z-a', name: 'Name: Z to A' }
    ]
  };
}

/**
 * Get products with pagination
 * @param {Array} products - The filtered products array
 * @param {Number} page - The current page number (1-based)
 * @param {Number} perPage - The number of products per page
 * @returns {Object} - Paginated products and pagination info
 */
export function paginateProducts(products, page = 1, perPage = 12) {
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalProducts);
  
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    pagination: {
      currentPage,
      totalPages,
      totalProducts,
      perPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
}
