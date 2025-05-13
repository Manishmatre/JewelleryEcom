/**
 * Manage filter visibility on mobile devices
 */

// Constants
const FILTER_ANIMATION_DURATION = 300; // milliseconds

// DOM Elements
const filterToggle = document.getElementById('mobile-filter-toggle');
const filtersSidebar = document.getElementById('filters-sidebar');
const closeFilters = document.getElementById('close-filters');

// State
let isAnimating = false;

/**
 * Show filters sidebar with animation
 */
function showFilters() {
  if (isAnimating) return;
  isAnimating = true;
  
  filtersSidebar.classList.remove('hidden');
  // Add initial transform and opacity
  filtersSidebar.style.transform = 'translateX(-100%)';
  filtersSidebar.style.opacity = '0';
  
  // Force reflow
  filtersSidebar.offsetHeight;
  
  // Add transition class
  filtersSidebar.classList.add('transition-all', 'duration-300', 'ease-in-out');
  
  // Animate in
  filtersSidebar.style.transform = 'translateX(0)';
  filtersSidebar.style.opacity = '1';
  
  // Reset after animation
  setTimeout(() => {
    isAnimating = false;
  }, FILTER_ANIMATION_DURATION);
}

/**
 * Hide filters sidebar with animation
 */
function hideFilters() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Add transition class if not present
  filtersSidebar.classList.add('transition-all', 'duration-300', 'ease-in-out');
  
  // Animate out
  filtersSidebar.style.transform = 'translateX(-100%)';
  filtersSidebar.style.opacity = '0';
  
  // Hide after animation
  setTimeout(() => {
    filtersSidebar.classList.add('hidden');
    filtersSidebar.style.transform = '';
    filtersSidebar.style.opacity = '';
    isAnimating = false;
  }, FILTER_ANIMATION_DURATION);
}

/**
 * Initialize filter visibility handlers
 */
function initializeFilterVisibility() {
  // Add click handlers
  filterToggle?.addEventListener('click', showFilters);
  closeFilters?.addEventListener('click', hideFilters);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) { // md breakpoint
      filtersSidebar.classList.remove('hidden');
      filtersSidebar.style.transform = '';
      filtersSidebar.style.opacity = '';
    } else {
      filtersSidebar.classList.add('hidden');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeFilterVisibility);
