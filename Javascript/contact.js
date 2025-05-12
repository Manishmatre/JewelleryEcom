/**
 * ShilpoKotha Contact Page Functionality
 * This file contains JavaScript functionality specific to the contact page
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMobileMenu = document.getElementById('close-mobile-menu');
  const mobileMenuContent = mobileMenu.querySelector('.bg-white');
  
  mobileMenuButton.addEventListener('click', function() {
    mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      mobileMenuContent.classList.remove('-translate-x-full');
    }, 10);
  });
  
  closeMobileMenu.addEventListener('click', function() {
    mobileMenuContent.classList.add('-translate-x-full');
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 300);
  });
  
  // Mobile collections dropdown
  const mobileCollectionsButton = document.getElementById('mobile-collections-button');
  const mobileCollectionsMenu = document.getElementById('mobile-collections-menu');
  const mobileCollectionsIcon = document.getElementById('mobile-collections-icon');
  
  mobileCollectionsButton.addEventListener('click', function() {
    mobileCollectionsMenu.classList.toggle('hidden');
    mobileCollectionsIcon.classList.toggle('rotate-180');
  });
  
  // Mobile search toggle
  const mobileSearchButton = document.getElementById('mobile-search-button');
  const mobileSearch = document.getElementById('mobile-search');
  
  mobileSearchButton.addEventListener('click', function() {
    mobileSearch.classList.toggle('hidden');
  });
  
  // FAQ accordion functionality
  const faqButtons = document.querySelectorAll('[aria-controls^="faq-"]');
  
  faqButtons.forEach(button => {
    button.addEventListener('click', function() {
      const content = document.getElementById(this.getAttribute('aria-controls'));
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Toggle current FAQ item
      this.setAttribute('aria-expanded', !isExpanded);
      content.classList.toggle('hidden');
      this.querySelector('.fa-chevron-down').classList.toggle('rotate-180');
    });
  });
});
