/**
 * Tailwind CSS Configuration for ShilpoKotha
 * This file contains the common color theme configuration used across the website
 */

// Initialize Tailwind configuration
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#a39a7e',
          'primary-dark': '#7a6f4e',
          secondary: '#f6f1e6',
          'secondary-dark': '#d9d4c6',
          'text-dark': '#1a1a1a',
          'text-light': '#4a4a4a'
        }
      }
    }
  };
}