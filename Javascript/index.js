/**
 * ShilpoKotha Home Page Functionality
 * This file contains JavaScript functionality specific to the home page
 */

import { addToCart } from './local-storage.js';
import { updateCartCount } from './header-manager.js';

// Add event listeners to all Add to Cart buttons
document.addEventListener('DOMContentLoaded', function() {
    // Testimonial Carousel Functionality
  initTestimonialCarousel();
  
  function initTestimonialCarousel() {
    // Show initial loading state
    const testimonialsWrapper = document.querySelector('.testimonials-wrapper');
    if (!testimonialsWrapper) return;
    
    // Set a fallback for when JavaScript fails
    window.addEventListener('error', function(e) {
      if (e.target && (e.target.src || e.target.href)) {
        const testimonialContainer = document.querySelector('.testimonial-container');
        if (testimonialContainer) {
          testimonialContainer.classList.add('js-error');
        }
      }
    }, true);
    
    const prevButton = document.getElementById('testimonial-prev');
    const nextButton = document.getElementById('testimonial-next');
    const dotsContainer = document.getElementById('testimonial-dots');
    const dots = document.querySelectorAll('#testimonial-dots button');
    const slides = document.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;
    
    // Remove loading indicator
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
      testimonialCarousel.classList.remove('loading');
      testimonialCarousel.classList.add('loaded');
    }
    
    // Initialize all slides initially (fallback if JS fails)
    slides.forEach(slide => {
      slide.style.opacity = '1';
    });
    
    let currentSlide = 0;
    let slideInterval;
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;
    
    // Function to update the active slide appearance
    function updateSlideClasses(index) {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    }
      // Function to update the dots indicator
    function updateDots(index) {
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.remove('bg-secondary-dark');
          dot.classList.add('bg-primary');
          dot.setAttribute('aria-selected', 'true');
          dot.setAttribute('tabindex', '0');
        } else {
          dot.classList.remove('bg-primary');
          dot.classList.add('bg-secondary-dark');
          dot.setAttribute('aria-selected', 'false');
          dot.setAttribute('tabindex', '-1');
        }
      });
    }
    
    // Function to slide to a specific testimonial with animation
    function slideTo(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      
      currentSlide = index;
      
      // Apply smooth transition
      testimonialsWrapper.style.transition = 'transform 0.6s ease-in-out';
      testimonialsWrapper.style.transform = `translateX(-${index * 100}%)`;
      
      updateDots(index);
      updateSlideClasses(index);
      
      // Announce to screen readers (accessibility)
      const testimonialContainer = document.querySelector('.testimonial-container');
      if (testimonialContainer) {
        testimonialContainer.setAttribute('aria-live', 'polite');
      }
    }
    
    // Initialize click events for navigation buttons
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        slideTo(currentSlide - 1);
        resetAutoSlide();
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        slideTo(currentSlide + 1);
        resetAutoSlide();
      });
    }
    
    // Initialize click events for the dots
    if (dots) {
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          slideTo(index);
          resetAutoSlide();
        });
      });
    }
    
    // Touch events for mobile swipe
    if (testimonialsWrapper) {
      testimonialsWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      testimonialsWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }
    
    // Function to handle touch swipe
    function handleSwipe() {
      const distance = touchStartX - touchEndX;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          // Swipe left - go to next slide
          slideTo(currentSlide + 1);
        } else {
          // Swipe right - go to previous slide
          slideTo(currentSlide - 1);
        }
        resetAutoSlide();
      }
    }
    
    // Function to handle keyboard navigation
    function handleKeyboardNavigation(e) {
      if (e.key === 'ArrowLeft') {
        slideTo(currentSlide - 1);
        resetAutoSlide();
      } else if (e.key === 'ArrowRight') {
        slideTo(currentSlide + 1);
        resetAutoSlide();
      }
    }
    
    // Add keyboard navigation when testimonial section is in focus
    const testimonialSection = document.querySelector('.testimonial-carousel');
    if (testimonialSection) {
      testimonialSection.setAttribute('tabindex', '0');
      testimonialSection.addEventListener('keydown', handleKeyboardNavigation);
    }
    
    // Function to start auto sliding
    function startAutoSlide() {
      slideInterval = setInterval(() => {
        slideTo(currentSlide + 1);
      }, 5000); // Change slide every 5 seconds
    }
    
    // Function to reset auto sliding
    function resetAutoSlide() {
      clearInterval(slideInterval);
      startAutoSlide();
    }
    
    // Pause auto-sliding when user hovers over the carousel
    const carouselContainer = document.querySelector('.testimonial-carousel');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
      });
      
      carouselContainer.addEventListener('mouseleave', () => {
        startAutoSlide();
      });
    }
    
    // Initialize the carousel
    updateSlideClasses(0);
    slideTo(0);
    startAutoSlide();
  }
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      const productName = this.getAttribute('data-product-name');
      const productPrice = parseFloat(this.getAttribute('data-product-price'));
      const productImage = this.getAttribute('data-product-image');
      
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage
      };
      
      const result = addToCart(product, 1);
      
      if (result.success) {
        // Show success message
        alert(`${productName} added to cart!`);
        // Update cart count
        updateCartCount();
      } else {
        // Show error message
        alert(result.error || 'Failed to add item to cart. Please try again.');
      }
    });
  });
  
  // Countdown Timer Functionality
  function updateCountdown() {
    // Set the date we're counting down to (7 days from now)
    const now = new Date();
    const countdownDate = new Date(now);
    countdownDate.setDate(now.getDate() + 7); // Sale ends 7 days from now
    
    // Update the countdown every 1 second
    const countdownTimer = setInterval(function() {
      // Get current date and time
      const currentTime = new Date().getTime();
      
      // Find the distance between now and the countdown date
      const distance = countdownDate - currentTime;
      
      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Display the result with leading zeros
      document.getElementById('countdown-days').textContent = days < 10 ? '0' + days : days;
      document.getElementById('countdown-hours').textContent = hours < 10 ? '0' + hours : hours;
      document.getElementById('countdown-minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
      document.getElementById('countdown-seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
      
      // If the countdown is finished, display a message
      if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById('countdown-days').textContent = '00';
        document.getElementById('countdown-hours').textContent = '00';
        document.getElementById('countdown-minutes').textContent = '00';
        document.getElementById('countdown-seconds').textContent = '00';
      }
    }, 1000);
  }
  
  // Initialize countdown
  if (document.getElementById('countdown-timer')) {
    updateCountdown();
  }
});
