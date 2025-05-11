/**
 * ShilpoKotha Header Updater
 * This script updates all HTML pages to include the header-manager.js script
 * and adds the cart and wishlist count badges to the header
 */

// Get all HTML files in the project directory
const fs = require('fs');
const path = require('path');

// Directory to search
const projectDir = __dirname.replace('Javascript', '');

// Find all HTML files
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith('.html'));
}

// Update a single HTML file
function updateHtmlFile(filePath) {
  console.log(`Updating ${filePath}...`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if header-manager.js is already included
  if (!content.includes('header-manager.js')) {
    // Add header-manager.js script after auth-state.js
    content = content.replace(
      /<script type="module" src="\.\/Javascript\/auth-state\.js"><\/script>/,
      '<script type="module" src="./Javascript/auth-state.js"></script>\n  <script type="module" src="./Javascript/header-manager.js"></script>'
    );
  }
  
  // Check if wishlist badge is already added
  if (!content.includes('wishlist-badge')) {
    // Add wishlist badge
    content = content.replace(
      /<a href="wishlist\.html"[^>]*>\s*<i class="fas fa-heart[^>]*><\/i>/g,
      match => match + '\n          <span class="wishlist-badge wishlist-count absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>'
    );
  }
  
  // Check if cart badge is already added
  if (!content.includes('cart-badge')) {
    // Add cart badge
    content = content.replace(
      /<a href="cart\.html"[^>]*>\s*<i class="fas fa-shopping-bag[^>]*><\/i>/g,
      match => match + '\n          <span class="cart-badge cart-count absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>'
    );
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

// Main function
function main() {
  try {
    // Find all HTML files
    const htmlFiles = findHtmlFiles(projectDir);
    console.log(`Found ${htmlFiles.length} HTML files`);
    
    // Update each HTML file
    htmlFiles.forEach(file => {
      const filePath = path.join(projectDir, file);
      updateHtmlFile(filePath);
    });
    
    console.log('All HTML files updated successfully!');
  } catch (error) {
    console.error('Error updating HTML files:', error);
  }
}

// Run the main function
main();
