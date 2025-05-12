/**
 * ShilpoKotha Cart Page Functionality
 * This file manages cart page UI interactions
 */

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const closeMobileMenuButton = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuContent = mobileMenu.querySelector('div');

mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.remove('hidden');
  setTimeout(() => {
    mobileMenuContent.style.transform = 'translateX(0)';
  }, 10);
});

closeMobileMenuButton.addEventListener('click', () => {
  mobileMenuContent.style.transform = 'translateX(-100%)';
  setTimeout(() => {
    mobileMenu.classList.add('hidden');
  }, 300);
});

// Mobile collections dropdown
const mobileCollectionsButton = document.getElementById('mobile-collections-button');
const mobileCollectionsMenu = document.getElementById('mobile-collections-menu');
const mobileCollectionsIcon = document.getElementById('mobile-collections-icon');

mobileCollectionsButton.addEventListener('click', () => {
  mobileCollectionsMenu.classList.toggle('hidden');
  mobileCollectionsIcon.classList.toggle('rotate-180');
});

// Mobile search toggle
const mobileSearchButton = document.getElementById('mobile-search-button');
const mobileSearch = document.getElementById('mobile-search');

mobileSearchButton.addEventListener('click', () => {
  mobileSearch.classList.toggle('hidden');
});

// Quantity input validation
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('change', () => {
    if (input.value < 1) input.value = 1;
  });
});
