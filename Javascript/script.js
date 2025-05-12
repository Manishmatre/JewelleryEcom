
  document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const closeMobileMenuButton = document.getElementById('close-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && closeMobileMenuButton && mobileMenu) {
    const mobileMenuContent = mobileMenu.querySelector('div');
    
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        mobileMenuContent.classList.remove('-translate-x-full');
      }, 10);
    });
    
    closeMobileMenuButton.addEventListener('click', () => {
      mobileMenuContent.classList.add('-translate-x-full');
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }, 500);
    });
  }
  
  // Mobile Collections Dropdown
  const mobileCollectionsButton = document.getElementById('mobile-collections-button');
  const mobileCollectionsMenu = document.getElementById('mobile-collections-menu');
  const mobileCollectionsIcon = document.getElementById('mobile-collections-icon');
  
  if (mobileCollectionsButton && mobileCollectionsMenu && mobileCollectionsIcon) {
    mobileCollectionsButton.addEventListener('click', () => {
      mobileCollectionsMenu.classList.toggle('hidden');
      mobileCollectionsIcon.classList.toggle('rotate-180');
    });
  }
  
  // Mobile Search Toggle
  const mobileSearchButton = document.getElementById('mobile-search-button');
  const mobileSearch = document.getElementById('mobile-search');
  
  if (mobileSearchButton && mobileSearch) {
    mobileSearchButton.addEventListener('click', () => {
      mobileSearch.classList.toggle('hidden');
    });
  }
  
  // Header Scroll Effect
  const header = document.getElementById('main-header');
  if (header) {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 100) {
        header.classList.add('py-0', 'shadow-lg');
      } else {
        header.classList.remove('py-0', 'shadow-lg');
      }
      
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
  }
  
  // Animate announcement bar
  const marquee = document.querySelector('.animate-marquee');
  if (marquee) {
    // Duplicate content for seamless scrolling
    marquee.innerHTML = marquee.innerHTML + marquee.innerHTML;
  }
  
  // Category Carousel Navigation
  const prevCategoryButton = document.getElementById('prev-category');
  const nextCategoryButton = document.getElementById('next-category');
  const categoriesContainer = document.getElementById('categories-container');
  const categoryDots = document.querySelectorAll('#category-dots button');
  
  if (prevCategoryButton && nextCategoryButton && categoriesContainer) {
    let currentCategorySlide = 0;
    const totalCategorySlides = 3; // Adjust based on your content
    
    function updateCategoryDots(index) {
      categoryDots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.remove('bg-secondary-dark');
          dot.classList.add('bg-primary');
        } else {
          dot.classList.remove('bg-primary');
          dot.classList.add('bg-secondary-dark');
        }
      });
    }
    
    function slideCategoryTo(index) {
      if (index < 0) index = 0;
      if (index >= totalCategorySlides) index = totalCategorySlides - 1;
      
      currentCategorySlide = index;
      const slideWidth = categoriesContainer.clientWidth;
      categoriesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
      updateCategoryDots(index);
    }
    
    prevCategoryButton.addEventListener('click', () => {
      slideCategoryTo(currentCategorySlide - 1);
    });
    
    nextCategoryButton.addEventListener('click', () => {
      slideCategoryTo(currentCategorySlide + 1);
    });
    
    // Initialize category dots
    categoryDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        slideCategoryTo(index);
      });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      slideCategoryTo(currentCategorySlide);
    });
    
    // Initialize
    slideCategoryTo(0);
  }
  
  // Featured Products Carousel Navigation
  const prevProductButton = document.getElementById('prev-product');
  const nextProductButton = document.getElementById('next-product');
  const featuredProducts = document.getElementById('featured-products');
  
  if (prevProductButton && nextProductButton && featuredProducts) {
    prevProductButton.addEventListener('click', () => {
      featuredProducts.scrollBy({ left: -300, behavior: 'smooth' });
    });
    
    nextProductButton.addEventListener('click', () => {
      featuredProducts.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
  
  // Add to Cart functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = button.getAttribute('data-product-id');
      const productName = button.getAttribute('data-product-name');
      const productPrice = button.getAttribute('data-product-price');
      
      // Here you would typically add the product to the cart in localStorage or send to a server
      console.log(`Added to cart: ${productName} (ID: ${productId}) - ₹${productPrice}`);
      
      // Show confirmation message
      const confirmationMessage = document.createElement('div');
      confirmationMessage.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-lg z-50';
      confirmationMessage.textContent = `${productName} added to cart!`;
      document.body.appendChild(confirmationMessage);
      
      setTimeout(() => {
        confirmationMessage.remove();
      }, 3000);
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
});
