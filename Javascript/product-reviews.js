/**
 * ShilpoKotha Product Reviews System
 * This script handles the product review functionality
 */

import { auth, db, getCurrentUser } from './firebase-config.js';
import { collection, query, where, getDocs, addDoc, orderBy, limit, doc, getDoc } from 'firebase/firestore';

// DOM Elements
let reviewsTab;
let reviewsContent;
let writeReviewButton;
let reviewFormContainer;
let reviewForm;
let ratingInput;
let ratingValue;
let cancelReviewButton;
let reviewsList;
let loadMoreReviewsButton;
let productAvgRating;
let productReviewCount;

// State
let currentProductId = null;
let currentUser = null;
let currentPage = 1;
let reviewsPerPage = 5;
let hasMoreReviews = false;

/**
 * Initialize the reviews system
 */
export async function initReviewsSystem() {
  // Get current product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  currentProductId = urlParams.get('id');
  
  if (!currentProductId) {
    console.error('No product ID found in URL');
    return;
  }
  
  // Get current user
  currentUser = await getCurrentUser();
  
  // Create reviews tab and content if they don't exist
  createReviewsTabIfNeeded();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load reviews for this product
  loadProductReviews();
}

/**
 * Create reviews tab and content if they don't exist
 */
function createReviewsTabIfNeeded() {
  const tabsContainer = document.querySelector('.flex.flex-wrap.-mb-px');
  const tabContentContainer = document.querySelector('.py-8');
  
  if (!tabsContainer || !tabContentContainer) {
    console.error('Tab containers not found');
    return;
  }
  
  // Check if reviews tab already exists
  reviewsTab = document.getElementById('tab-reviews');
  
  if (!reviewsTab) {
    // Create reviews tab
    reviewsTab = document.createElement('button');
    reviewsTab.id = 'tab-reviews';
    reviewsTab.className = 'inline-block py-4 px-6 text-center border-b-2 border-transparent text-text-light hover:text-primary hover:border-primary font-medium';
    reviewsTab.textContent = 'Reviews';
    
    // Add tab to container
    tabsContainer.appendChild(reviewsTab);
  }
  
  // Check if reviews content already exists
  reviewsContent = document.getElementById('content-reviews');
  
  if (!reviewsContent) {
    // Create reviews content
    reviewsContent = document.createElement('div');
    reviewsContent.id = 'content-reviews';
    reviewsContent.className = 'hidden';
    
    // Create content HTML
    reviewsContent.innerHTML = `
      <div class="max-w-3xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="playfair text-2xl font-semibold">Customer Reviews</h2>
          <button id="write-review-button" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-all">
            <i class="fas fa-pen mr-1"></i> Write a Review
          </button>
        </div>
        
        <!-- Review Summary -->
        <div class="bg-secondary rounded-lg p-6 mb-8">
          <div class="flex flex-col md:flex-row items-center justify-between">
            <div class="text-center md:text-left mb-4 md:mb-0">
              <div class="text-4xl font-bold text-primary mb-1 product-avg-rating">0.0</div>
              <div class="flex items-center justify-center md:justify-start text-yellow-400 mb-1 product-stars">
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
              </div>
              <div class="text-sm text-text-light"><span class="product-review-count">0</span> reviews</div>
            </div>
            
            <div class="w-full md:w-2/3">
              <!-- Star ratings distribution will be added dynamically -->
              <div id="ratings-distribution"></div>
            </div>
          </div>
        </div>
        
        <!-- Review Form (Hidden by default) -->
        <div id="review-form-container" class="hidden bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 class="text-lg font-semibold mb-4">Write Your Review</h3>
          <form id="review-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-text-dark mb-1">Rating</label>
              <div class="flex text-2xl text-gray-300 rating-input">
                <i class="fas fa-star cursor-pointer hover:text-yellow-400 transition-all" data-rating="1"></i>
                <i class="fas fa-star cursor-pointer hover:text-yellow-400 transition-all" data-rating="2"></i>
                <i class="fas fa-star cursor-pointer hover:text-yellow-400 transition-all" data-rating="3"></i>
                <i class="fas fa-star cursor-pointer hover:text-yellow-400 transition-all" data-rating="4"></i>
                <i class="fas fa-star cursor-pointer hover:text-yellow-400 transition-all" data-rating="5"></i>
              </div>
              <input type="hidden" name="rating" id="rating-value" value="0">
            </div>
            
            <div>
              <label for="review-title" class="block text-sm font-medium text-text-dark mb-1">Review Title</label>
              <input type="text" id="review-title" name="title" class="w-full border border-secondary-dark rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Summarize your experience">
            </div>
            
            <div>
              <label for="review-content" class="block text-sm font-medium text-text-dark mb-1">Review</label>
              <textarea id="review-content" name="content" rows="4" class="w-full border border-secondary-dark rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Share your experience with this product"></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button type="button" id="cancel-review" class="px-4 py-2 border border-secondary-dark text-text-dark rounded-md text-sm hover:bg-secondary transition-all">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm transition-all">Submit Review</button>
            </div>
          </form>
        </div>
        
        <!-- Reviews List -->
        <div id="reviews-list" class="space-y-6">
          <!-- Review items will be dynamically inserted here -->
          <div id="no-reviews" class="text-center py-8">
            <p class="text-gray-500 mb-2">No reviews yet</p>
            <p class="text-sm text-gray-400">Be the first to review this product</p>
          </div>
        </div>
        
        <!-- Load More Reviews Button -->
        <div class="text-center pt-4 hidden" id="load-more-container">
          <button id="load-more-reviews" class="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-md text-sm font-medium transition-all">
            Load More Reviews
          </button>
        </div>
      </div>
    `;
    
    // Add content to container
    tabContentContainer.appendChild(reviewsContent);
  }
  
  // Get DOM elements
  writeReviewButton = document.getElementById('write-review-button');
  reviewFormContainer = document.getElementById('review-form-container');
  reviewForm = document.getElementById('review-form');
  ratingInput = document.querySelector('.rating-input');
  ratingValue = document.getElementById('rating-value');
  cancelReviewButton = document.getElementById('cancel-review');
  reviewsList = document.getElementById('reviews-list');
  loadMoreReviewsButton = document.getElementById('load-more-reviews');
  productAvgRating = document.querySelector('.product-avg-rating');
  productReviewCount = document.querySelector('.product-review-count');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Tab click event
  if (reviewsTab) {
    reviewsTab.addEventListener('click', () => {
      // Hide all tab contents
      const allContents = document.querySelectorAll('[id^="content-"]');
      allContents.forEach(content => {
        content.classList.add('hidden');
      });
      
      // Remove active class from all tabs
      const allTabs = document.querySelectorAll('[id^="tab-"]');
      allTabs.forEach(tab => {
        tab.classList.remove('border-primary', 'text-primary');
        tab.classList.add('border-transparent', 'text-text-light', 'hover:text-primary', 'hover:border-primary');
      });
      
      // Show reviews content and set tab as active
      reviewsContent.classList.remove('hidden');
      reviewsTab.classList.remove('border-transparent', 'text-text-light', 'hover:text-primary', 'hover:border-primary');
      reviewsTab.classList.add('border-primary', 'text-primary');
    });
  }
  
  // Write review button click
  if (writeReviewButton) {
    writeReviewButton.addEventListener('click', () => {
      if (!currentUser) {
        showLoginPrompt();
        return;
      }
      
      reviewFormContainer.classList.remove('hidden');
      writeReviewButton.classList.add('hidden');
    });
  }
  
  // Cancel review button click
  if (cancelReviewButton) {
    cancelReviewButton.addEventListener('click', () => {
      reviewFormContainer.classList.add('hidden');
      writeReviewButton.classList.remove('hidden');
      resetReviewForm();
    });
  }
  
  // Star rating click
  if (ratingInput) {
    const stars = ratingInput.querySelectorAll('i');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        setRating(rating);
      });
    });
  }
  
  // Review form submit
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const rating = parseInt(ratingValue.value);
      const title = document.getElementById('review-title').value.trim();
      const content = document.getElementById('review-content').value.trim();
      
      if (rating === 0) {
        showNotification('Please select a rating', 'error');
        return;
      }
      
      if (!title) {
        showNotification('Please enter a review title', 'error');
        return;
      }
      
      if (!content) {
        showNotification('Please enter your review', 'error');
        return;
      }
      
      await submitReview(rating, title, content);
    });
  }
  
  // Load more reviews button click
  if (loadMoreReviewsButton) {
    loadMoreReviewsButton.addEventListener('click', () => {
      currentPage++;
      loadProductReviews(false);
    });
  }
}

/**
 * Load product reviews
 * @param {boolean} resetList - Whether to reset the reviews list
 */
async function loadProductReviews(resetList = true) {
  if (!currentProductId) return;
  
  try {
    // Create query for reviews
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', currentProductId),
      orderBy('createdAt', 'desc'),
      limit(reviewsPerPage * currentPage)
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    
    // Reset list if needed
    if (resetList) {
      reviewsList.innerHTML = '';
      currentPage = 1;
    }
    
    // Check if there are reviews
    if (querySnapshot.empty && resetList) {
      reviewsList.innerHTML = `
        <div id="no-reviews" class="text-center py-8">
          <p class="text-gray-500 mb-2">No reviews yet</p>
          <p class="text-sm text-gray-400">Be the first to review this product</p>
        </div>
      `;
      
      document.getElementById('load-more-container').classList.add('hidden');
      updateReviewSummary(0, 0);
      return;
    }
    
    // Remove no reviews message if it exists
    const noReviews = document.getElementById('no-reviews');
    if (noReviews) {
      noReviews.remove();
    }
    
    // Process reviews
    const reviews = [];
    querySnapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Check if there are more reviews to load
    hasMoreReviews = reviews.length >= reviewsPerPage * currentPage;
    
    // Update load more button visibility
    document.getElementById('load-more-container').classList.toggle('hidden', !hasMoreReviews);
    
    // Update review summary
    if (resetList && reviews.length > 0) {
      updateReviewSummary(reviews);
    }
    
    // Add reviews to list
    for (const review of reviews) {
      // Skip if this review is already in the list
      if (document.getElementById(`review-${review.id}`)) {
        continue;
      }
      
      // Add review to list
      addReviewToList(review);
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
    showNotification('Failed to load reviews', 'error');
  }
}

/**
 * Add a review to the reviews list
 * @param {Object} review - The review object
 */
async function addReviewToList(review) {
  // Create review element
  const reviewElement = document.createElement('div');
  reviewElement.id = `review-${review.id}`;
  reviewElement.className = 'bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-all';
  
  // Format date
  const reviewDate = review.createdAt ? new Date(review.createdAt.seconds * 1000) : new Date();
  const timeAgo = getTimeAgo(reviewDate);
  
  // Get user info
  let userName = 'Anonymous';
  let userInitials = 'A';
  
  if (review.userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', review.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData.displayName || 'User';
        userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }
  
  // Create stars HTML
  const starsHtml = createStarsHtml(review.rating);
  
  // Set review HTML
  reviewElement.innerHTML = `
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="font-medium text-text-dark">${review.title}</h3>
        <div class="flex items-center text-yellow-400 text-sm mt-1">
          ${starsHtml}
          <span class="ml-2 text-text-light">${review.rating.toFixed(1)}</span>
        </div>
      </div>
      <div class="text-xs text-text-light">${timeAgo}</div>
    </div>
    
    <p class="text-text-light mb-3">${review.content}</p>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-primary-dark text-white flex items-center justify-center mr-2">
          <span class="text-xs font-medium">${userInitials}</span>
        </div>
        <span class="text-sm font-medium">${userName}</span>
        ${review.verified ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Verified Purchase</span>' : ''}
      </div>
      
      <div class="flex items-center space-x-3 text-sm text-text-light">
        <button class="helpful-button hover:text-primary transition-all flex items-center" data-review-id="${review.id}">
          <i class="far fa-thumbs-up mr-1"></i>
          <span>${review.helpfulCount || 0}</span>
        </button>
      </div>
    </div>
  `;
  
  // Add seller response if it exists
  if (review.sellerResponse) {
    const responseElement = document.createElement('div');
    responseElement.className = 'mt-4 pt-4 border-t border-secondary-dark';
    responseElement.innerHTML = `
      <div class="flex items-start">
        <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2 flex-shrink-0">
          <i class="fas fa-store text-xs"></i>
        </div>
        <div>
          <div class="flex items-center">
            <span class="text-sm font-medium">ShilpoKotha</span>
            <span class="text-xs text-primary ml-2">Seller</span>
          </div>
          <p class="text-sm text-text-light mt-1">${review.sellerResponse}</p>
        </div>
      </div>
    `;
    
    reviewElement.appendChild(responseElement);
  }
  
  // Add helpful button event listener
  const helpfulButton = reviewElement.querySelector('.helpful-button');
  if (helpfulButton) {
    helpfulButton.addEventListener('click', () => {
      markReviewAsHelpful(review.id);
    });
  }
  
  // Add to reviews list
  reviewsList.appendChild(reviewElement);
}

/**
 * Submit a new review
 * @param {number} rating - The rating (1-5)
 * @param {string} title - The review title
 * @param {string} content - The review content
 */
async function submitReview(rating, title, content) {
  if (!currentUser || !currentProductId) {
    showNotification('You must be logged in to submit a review', 'error');
    return;
  }
  
  try {
    // Check if user has already reviewed this product
    const existingReviewQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', currentProductId),
      where('userId', '==', currentUser.uid)
    );
    
    const existingReviewSnapshot = await getDocs(existingReviewQuery);
    
    if (!existingReviewSnapshot.empty) {
      showNotification('You have already reviewed this product', 'error');
      return;
    }
    
    // Create review object
    const reviewData = {
      productId: currentProductId,
      userId: currentUser.uid,
      rating,
      title,
      content,
      createdAt: new Date(),
      helpfulCount: 0,
      verified: false // This would be set to true if we can verify the user purchased the product
    };
    
    // Add review to Firestore
    await addDoc(collection(db, 'reviews'), reviewData);
    
    // Reset form and hide it
    resetReviewForm();
    reviewFormContainer.classList.add('hidden');
    writeReviewButton.classList.remove('hidden');
    
    // Reload reviews
    loadProductReviews();
    
    showNotification('Your review has been submitted', 'success');
  } catch (error) {
    console.error('Error submitting review:', error);
    showNotification('Failed to submit review', 'error');
  }
}

/**
 * Mark a review as helpful
 * @param {string} reviewId - The review ID
 */
function markReviewAsHelpful(reviewId) {
  // This would update the helpful count in Firestore
  // For now, just update the UI
  const helpfulButton = document.querySelector(`.helpful-button[data-review-id="${reviewId}"]`);
  if (helpfulButton) {
    const countElement = helpfulButton.querySelector('span');
    const currentCount = parseInt(countElement.textContent);
    countElement.textContent = currentCount + 1;
    
    // Disable button
    helpfulButton.disabled = true;
    helpfulButton.classList.add('opacity-50');
  }
}

/**
 * Update the review summary
 * @param {Array|number} reviews - Array of reviews or average rating
 * @param {number} count - Number of reviews (only used if first param is a number)
 */
function updateReviewSummary(reviews, count) {
  let avgRating = 0;
  let reviewCount = 0;
  let ratingDistribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  
  if (Array.isArray(reviews)) {
    // Calculate average rating
    reviewCount = reviews.length;
    
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      avgRating = totalRating / reviewCount;
      
      // Calculate rating distribution
      reviews.forEach(review => {
        ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
      });
    }
  } else {
    // Use provided values
    avgRating = reviews;
    reviewCount = count;
  }
  
  // Update average rating
  productAvgRating.textContent = avgRating.toFixed(1);
  
  // Update review count
  productReviewCount.textContent = reviewCount;
  
  // Update stars
  const starsContainer = document.querySelector('.product-stars');
  if (starsContainer) {
    starsContainer.innerHTML = createStarsHtml(avgRating);
  }
  
  // Update rating distribution
  const distributionContainer = document.getElementById('ratings-distribution');
  if (distributionContainer && Array.isArray(reviews)) {
    distributionContainer.innerHTML = '';
    
    for (let i = 5; i >= 1; i--) {
      const count = ratingDistribution[i] || 0;
      const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
      
      const ratingRow = document.createElement('div');
      ratingRow.className = 'flex items-center mb-2';
      ratingRow.innerHTML = `
        <div class="text-sm w-12 text-text-light">${i} stars</div>
        <div class="flex-grow mx-3 bg-gray-200 rounded-full h-2.5">
          <div class="bg-yellow-400 h-2.5 rounded-full" style="width: ${percentage}%"></div>
        </div>
        <div class="text-sm w-8 text-text-light">${percentage}%</div>
      `;
      
      distributionContainer.appendChild(ratingRow);
    }
  }
}

/**
 * Set the rating in the review form
 * @param {number} rating - The rating (1-5)
 */
function setRating(rating) {
  ratingValue.value = rating;
  
  const stars = ratingInput.querySelectorAll('i');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('text-yellow-400');
      star.classList.remove('text-gray-300');
    } else {
      star.classList.remove('text-yellow-400');
      star.classList.add('text-gray-300');
    }
  });
}

/**
 * Reset the review form
 */
function resetReviewForm() {
  reviewForm.reset();
  setRating(0);
}

/**
 * Show a notification
 * @param {string} message - The message to show
 * @param {string} type - The type of notification ('success' or 'error')
 */
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg text-white ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  } transition-all transform translate-y-0 opacity-100 z-50`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * Show login prompt
 */
function showLoginPrompt() {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
  
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
      <div class="bg-primary px-6 py-4">
        <h3 class="text-lg font-medium text-white">Sign In Required</h3>
      </div>
      <div class="px-6 py-4">
        <p class="mb-4">You need to be logged in to write a review.</p>
        <div class="flex justify-end space-x-3">
          <button class="cancel-login-prompt px-4 py-2 border border-secondary-dark text-text-dark rounded-md text-sm hover:bg-secondary transition-all">Cancel</button>
          <a href="login.html" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm transition-all">Sign In</a>
        </div>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(modal);
  
  // Add event listener to cancel button
  const cancelButton = modal.querySelector('.cancel-login-prompt');
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

/**
 * Create stars HTML based on rating
 * @param {number} rating - The rating (0-5)
 * @returns {string} HTML string with star icons
 */
function createStarsHtml(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let html = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  
  // Half star
  if (halfStar) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  
  return html;
}

/**
 * Get time ago string
 * @param {Date} date - The date
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'just now';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initReviewsSystem);
