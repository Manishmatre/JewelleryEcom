// Fix for the about page header to keep it always visible
document.addEventListener('DOMContentLoaded', function() {
  const header = document.getElementById('main-header');
  if (header) {
    // Override the transform style to ensure the header is always visible
    window.addEventListener('scroll', () => {
      // Always keep the header visible regardless of scroll direction
      header.style.transform = 'translateY(0)';
      
      // Add shadow when scrolling down
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 100) {
        header.classList.add('py-0', 'shadow-lg');
      } else {
        header.classList.remove('py-0', 'shadow-lg');
      }
    });
  }
});
