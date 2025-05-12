/**
 * ShilpoKotha Shared Header
 * This script manages the shared header components across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
  // Header components to update
  updateLogoSection();
  
  // Function to update logo section with enhanced styling from index page
  function updateLogoSection() {
    const logoContainer = document.querySelector('header .flex.items-center.space-x-3 a');
    if (!logoContainer) return;
    
    // Check if the logo already has the enhanced styling
    if (logoContainer.querySelector('.relative.overflow-hidden.rounded-full')) return;
    
    // Get the existing logo image
    const existingLogo = logoContainer.querySelector('img');
    if (!existingLogo) return;
    
    // Create the enhanced logo HTML structure
    const enhancedLogo = `
      <div class="relative overflow-hidden rounded-full h-14 w-14 border-2 border-primary flex items-center justify-center bg-white shadow-md transition-transform duration-300 group-hover:scale-105">
        <img src="images/logo.png" alt="ShilpoKotha Logo" class="h-10 w-auto transition-all duration-300 group-hover:brightness-110">
        <div class="absolute inset-0 border-4 border-secondary opacity-0 rounded-full group-hover:opacity-30 transition-all duration-300"></div>
      </div>
      <div class="hidden sm:block">
        <span class="playfair font-semibold text-xl text-text-dark block group-hover:text-primary transition-all">ShilpoKotha</span>
        <span class="text-xs text-primary-dark italic">Handcrafted Elegance</span>
      </div>
    `;
    
    // Replace the existing logo content
    logoContainer.innerHTML = enhancedLogo;
    
    // Ensure the logo container has the proper class for animation effects
    logoContainer.classList.add('group', 'relative');
  }

  // Ensure consistent cart and wishlist badge display
  standardizeCounterBadges();
  
  function standardizeCounterBadges() {
    // Fix wishlist badges
    const wishlistBadges = document.querySelectorAll('.wishlist-count');
    wishlistBadges.forEach(badge => {
      if (badge.classList.contains('hidden')) {
        // Create secondary badge for animation effect if not exists
        const parent = badge.closest('a');
        if (parent && !parent.querySelector('.absolute.-top-2.-right-1')) {
          const animatedBadge = document.createElement('span');
          animatedBadge.classList.add('absolute', '-top-2', '-right-1', 'bg-primary', 'text-white', 'text-[10px]', 
                                     'font-semibold', 'rounded-full', 'w-5', 'h-5', 'flex', 'items-center', 
                                     'justify-center', 'transition-all', 'duration-300', 'transform', 
                                     'group-hover:scale-110', 'wishlist-count');
          animatedBadge.textContent = badge.textContent;
          parent.appendChild(animatedBadge);
        }
      }
    });
    
    // Fix cart badges
    const cartBadges = document.querySelectorAll('.cart-count');
    cartBadges.forEach(badge => {
      if (badge.classList.contains('hidden')) {
        // Create secondary badge for animation effect if not exists
        const parent = badge.closest('a');
        if (parent && !parent.querySelector('.absolute.-top-2.-right-1')) {
          const animatedBadge = document.createElement('span');
          animatedBadge.classList.add('absolute', '-top-2', '-right-1', 'bg-primary', 'text-white', 'text-[10px]', 
                                     'font-semibold', 'rounded-full', 'w-5', 'h-5', 'flex', 'items-center', 
                                     'justify-center', 'transition-all', 'duration-300', 'transform', 
                                     'group-hover:scale-110', 'cart-count');
          animatedBadge.textContent = badge.textContent;
          parent.appendChild(animatedBadge);
        }
      }
    });
  }
  
  // Add aria attributes for accessibility
  addAccessibilityAttributes();
  
  function addAccessibilityAttributes() {
    // Add aria labels to buttons that don't have them
    const searchButton = document.getElementById('mobile-search-button');
    if (searchButton && !searchButton.hasAttribute('aria-label')) {
      searchButton.setAttribute('aria-label', 'Search');
    }
    
    const menuButton = document.getElementById('mobile-menu-button');
    if (menuButton && !menuButton.hasAttribute('aria-label')) {
      menuButton.setAttribute('aria-label', 'Menu');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-controls', 'mobile-menu');
    }
    
    const closeMenuButton = document.getElementById('close-mobile-menu');
    if (closeMenuButton && !closeMenuButton.hasAttribute('aria-label')) {
      closeMenuButton.setAttribute('aria-label', 'Close menu');
    }
    
    // Add aria attributes to collections dropdown
    const collectionsButton = document.querySelector('button:has(.fa-chevron-down)');
    if (collectionsButton && !collectionsButton.hasAttribute('aria-expanded')) {
      collectionsButton.setAttribute('aria-expanded', 'false');
      collectionsButton.setAttribute('aria-haspopup', 'true');
    }
  }
});
