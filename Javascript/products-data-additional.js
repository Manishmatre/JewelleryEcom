/**
 * ShilpoKotha Additional Products Data
 * This file contains additional product data for the jewelry e-commerce site
 */

// Import the existing products array
import { products } from './products-data.js';

// Additional products to add to the main products array
const additionalProducts = [
  // BRACELETS
  {
    id: "bracelet-001",
    name: "Diamond Tennis Bracelet",
    price: 47999.20,
    originalPrice: 63999.20,
    discount: 25,
    category: "bracelets",
    subcategory: "tennis",
    material: "white-gold",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg"
    ],
    description: "Stunning 2.0 carat total weight diamond tennis bracelet in 14K white gold. A timeless piece of luxury.",
    details: {
      weight: "12.5g",
      length: "7 inches",
      closureType: "Box clasp with safety",
      stones: "2.0ct total, VS clarity"
    },
    reviews: 36,
    rating: 4.9,
    stock: 4
  },
  {
    id: "bracelet-002",
    name: "Gold Bangle Bracelet",
    price: 27999.20,
    originalPrice: 31999.20,
    discount: 13,
    category: "bracelets",
    subcategory: "bangle",
    material: "gold",
    featured: false,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg"
    ],
    description: "Classic 14K gold bangle bracelet. Simple, elegant, and perfect for everyday wear.",
    details: {
      weight: "15.8g",
      diameter: "2.5 inches",
      width: "4mm",
      stones: "None"
    },
    reviews: 22,
    rating: 4.7,
    stock: 8
  },
  {
    id: "bracelet-003",
    name: "Charm Bracelet",
    price: 10399.20,
    originalPrice: 11999.20,
    discount: 13,
    category: "bracelets",
    subcategory: "charm",
    material: "silver",
    featured: true,
    new: false,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg"
    ],
    description: "Sterling silver charm bracelet with 5 included charms. Add your own charms to create a personalized piece.",
    details: {
      weight: "18.2g",
      length: "7.5 inches adjustable",
      closureType: "Lobster clasp",
      stones: "Cubic zirconia accents"
    },
    reviews: 19,
    rating: 4.6,
    stock: 12
  },
  {
    id: "bracelet-004",
    name: "Pearl Strand Bracelet",
    price: 7999.20,
    originalPrice: 10399.20,
    discount: 23,
    category: "bracelets",
    subcategory: "strand",
    material: "pearl",
    featured: false,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg"
    ],
    description: "Elegant freshwater pearl bracelet with sterling silver clasp. A delicate addition to any outfit.",
    details: {
      weight: "8.5g",
      length: "7 inches",
      closureType: "Sterling silver clasp",
      stones: "Freshwater pearls"
    },
    reviews: 14,
    rating: 4.5,
    stock: 10
  },
  {
    id: "bracelet-005",
    name: "Rose Gold Cuff Bracelet",
    price: 15999.20,
    originalPrice: 19999.20,
    discount: 20,
    category: "bracelets",
    subcategory: "cuff",
    material: "rose-gold",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/0b027ee5-a43f-47b2-8cdb-2fa93ab7c766.jpg"
    ],
    description: "Stunning 14K rose gold cuff bracelet with hammered texture. A bold statement piece.",
    details: {
      weight: "22.5g",
      width: "15mm",
      adjustable: true,
      stones: "None"
    },
    reviews: 16,
    rating: 4.8,
    stock: 6
  },

  // RINGS
  {
    id: "ring-001",
    name: "Diamond Solitaire Ring",
    price: 79999.20,
    originalPrice: 103999.20,
    discount: 23,
    category: "rings",
    subcategory: "solitaire",
    material: "platinum",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Classic 1.0 carat diamond solitaire ring in platinum. The perfect engagement ring.",
    details: {
      weight: "5.2g",
      ringSize: "Available in sizes 4-10",
      stones: "1.0ct diamond, VS clarity, F color"
    },
    reviews: 48,
    rating: 4.9,
    stock: 5
  },
  {
    id: "ring-002",
    name: "Gold Wedding Band",
    price: 27999.20,
    originalPrice: 31999.20,
    discount: 13,
    category: "rings",
    subcategory: "wedding",
    material: "gold",
    featured: false,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Classic 14K gold wedding band. Timeless and comfortable for everyday wear.",
    details: {
      weight: "6.8g",
      width: "4mm",
      ringSize: "Available in sizes 5-13",
      stones: "None"
    },
    reviews: 32,
    rating: 4.8,
    stock: 15
  },
  {
    id: "ring-003",
    name: "Sapphire Halo Ring",
    price: 47999.20,
    originalPrice: 55999.20,
    discount: 14,
    category: "rings",
    subcategory: "halo",
    material: "white-gold",
    featured: true,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Stunning blue sapphire center stone surrounded by a halo of diamonds in 14K white gold.",
    details: {
      weight: "4.8g",
      ringSize: "Available in sizes 4-9",
      stones: "1.0ct blue sapphire, 0.25ct total diamond halo"
    },
    reviews: 18,
    rating: 4.7,
    stock: 7
  },
  {
    id: "ring-004",
    name: "Three-Stone Diamond Ring",
    price: 63999.20,
    originalPrice: 79999.20,
    discount: 20,
    category: "rings",
    subcategory: "three-stone",
    material: "platinum",
    featured: false,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Elegant three-stone diamond ring in platinum. Symbolize your past, present, and future.",
    details: {
      weight: "5.5g",
      ringSize: "Available in sizes 4-10",
      stones: "1.5ct total diamond weight, VS clarity"
    },
    reviews: 12,
    rating: 4.8,
    stock: 4
  },
  {
    id: "ring-005",
    name: "Rose Gold Eternity Band",
    price: 35999.20,
    originalPrice: 39999.20,
    discount: 10,
    category: "rings",
    subcategory: "eternity",
    material: "rose-gold",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Beautiful 14K rose gold eternity band with diamonds all around. Perfect as a wedding band or anniversary gift.",
    details: {
      weight: "4.2g",
      ringSize: "Available in sizes 4-9",
      stones: "0.75ct total diamond weight"
    },
    reviews: 24,
    rating: 4.9,
    stock: 8
  }
];

// Function to merge the additional products with the main products array
export function getAllProducts() {
  return [...products, ...additionalProducts];
}

// Export the additional products directly
export { additionalProducts };
