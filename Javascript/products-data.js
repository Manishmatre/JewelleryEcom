/**
 * ShilpoKotha Products Database
 * This file contains all product data for the jewelry e-commerce site
 */

// Export the products array
export const products = [
  // NECKLACES
  {
    id: "necklace-001",
    name: "Gold Pendant Necklace",
    price: 249.99,
    originalPrice: 299.99,
    discount: 17,
    category: "necklaces",
    subcategory: "pendant",
    material: "gold",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/a2027d10-c3aa-4ba1-8916-675d3f5754f2.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/a2027d10-c3aa-4ba1-8916-675d3f5754f2.jpg",
      "https://storage.googleapis.com/a1aa/image/cd76d727-e5a2-4e34-6252-e6ffab3c23ed.jpg"
    ],
    description: "Elegant 18K gold pendant necklace with a delicate chain. Perfect for both casual and formal occasions.",
    details: {
      weight: "3.5g",
      chainLength: "18 inches",
      closureType: "Lobster clasp",
      stones: "None"
    },
    reviews: 24,
    rating: 4.8,
    stock: 15
  },
  {
    id: "necklace-002",
    name: "Pearl Strand Necklace",
    price: 299.99,
    originalPrice: 349.99,
    discount: 14,
    category: "necklaces",
    subcategory: "strand",
    material: "pearl",
    featured: false,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/50bef913-927a-4ca0-8c2b-ca7c00cd8384.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/50bef913-927a-4ca0-8c2b-ca7c00cd8384.jpg"
    ],
    description: "Classic freshwater pearl strand necklace with sterling silver clasp. Timeless elegance for any occasion.",
    details: {
      weight: "25g",
      chainLength: "16 inches",
      closureType: "Sterling silver clasp",
      stones: "Freshwater pearls"
    },
    reviews: 18,
    rating: 4.7,
    stock: 8
  },
  {
    id: "necklace-003",
    name: "Diamond Solitaire Pendant",
    price: 599.99,
    originalPrice: 699.99,
    discount: 14,
    category: "necklaces",
    subcategory: "pendant",
    material: "white-gold",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/cd76d727-e5a2-4e34-6252-e6ffab3c23ed.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/cd76d727-e5a2-4e34-6252-e6ffab3c23ed.jpg"
    ],
    description: "Stunning 0.5 carat diamond solitaire pendant in 14K white gold. The perfect gift for that special someone.",
    details: {
      weight: "4g",
      chainLength: "18 inches",
      closureType: "Spring ring clasp",
      stones: "0.5ct diamond, VS clarity"
    },
    reviews: 32,
    rating: 4.9,
    stock: 5
  },
  {
    id: "necklace-004",
    name: "Rose Gold Chain Necklace",
    price: 179.99,
    originalPrice: 199.99,
    discount: 10,
    category: "necklaces",
    subcategory: "chain",
    material: "rose-gold",
    featured: false,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/50bef913-927a-4ca0-8c2b-ca7c00cd8384.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/50bef913-927a-4ca0-8c2b-ca7c00cd8384.jpg"
    ],
    description: "Delicate 14K rose gold chain necklace. Perfect for layering or wearing alone for a minimalist look.",
    details: {
      weight: "2.8g",
      chainLength: "20 inches",
      closureType: "Lobster clasp",
      stones: "None"
    },
    reviews: 15,
    rating: 4.6,
    stock: 12
  },
  {
    id: "necklace-005",
    name: "Emerald Pendant Necklace",
    price: 449.99,
    originalPrice: 499.99,
    discount: 10,
    category: "necklaces",
    subcategory: "pendant",
    material: "yellow-gold",
    featured: true,
    new: false,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/cd76d727-e5a2-4e34-6252-e6ffab3c23ed.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/cd76d727-e5a2-4e34-6252-e6ffab3c23ed.jpg"
    ],
    description: "Elegant emerald pendant surrounded by diamonds in 18K yellow gold. A stunning statement piece.",
    details: {
      weight: "5.2g",
      chainLength: "18 inches",
      closureType: "Lobster clasp",
      stones: "0.75ct emerald, diamond accents"
    },
    reviews: 9,
    rating: 4.5,
    stock: 3
  },

  // EARRINGS
  {
    id: "earring-001",
    name: "Diamond Stud Earrings",
    price: 399.99,
    originalPrice: 499.99,
    discount: 20,
    category: "earrings",
    subcategory: "stud",
    material: "white-gold",
    featured: true,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Classic 0.5 carat total weight diamond stud earrings in 14K white gold. A timeless addition to any jewelry collection.",
    details: {
      weight: "2.4g",
      backingType: "Push back",
      stones: "0.5ct total, VS clarity"
    },
    reviews: 42,
    rating: 4.9,
    stock: 10
  },
  {
    id: "earring-002",
    name: "Gold Hoop Earrings",
    price: 149.99,
    originalPrice: 179.99,
    discount: 17,
    category: "earrings",
    subcategory: "hoop",
    material: "gold",
    featured: false,
    new: false,
    bestSeller: true,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Classic 14K gold hoop earrings. Versatile and lightweight for everyday wear.",
    details: {
      weight: "3.8g",
      diameter: "1.5 inches",
      backingType: "Hinged snap closure",
      stones: "None"
    },
    reviews: 28,
    rating: 4.7,
    stock: 15
  },
  {
    id: "earring-003",
    name: "Pearl Drop Earrings",
    price: 129.99,
    originalPrice: 159.99,
    discount: 19,
    category: "earrings",
    subcategory: "drop",
    material: "silver",
    featured: true,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Elegant freshwater pearl drop earrings in sterling silver. Perfect for weddings and special occasions.",
    details: {
      weight: "4.2g",
      length: "1.25 inches",
      backingType: "Lever back",
      stones: "8mm freshwater pearls"
    },
    reviews: 16,
    rating: 4.6,
    stock: 8
  },
  {
    id: "earring-004",
    name: "Sapphire Stud Earrings",
    price: 349.99,
    originalPrice: 399.99,
    discount: 13,
    category: "earrings",
    subcategory: "stud",
    material: "white-gold",
    featured: false,
    new: true,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Beautiful blue sapphire stud earrings in 14K white gold. A colorful alternative to traditional diamond studs.",
    details: {
      weight: "2.6g",
      backingType: "Screw back",
      stones: "1.0ct total blue sapphires"
    },
    reviews: 12,
    rating: 4.8,
    stock: 6
  },
  {
    id: "earring-005",
    name: "Chandelier Earrings",
    price: 229.99,
    originalPrice: 279.99,
    discount: 18,
    category: "earrings",
    subcategory: "chandelier",
    material: "silver",
    featured: true,
    new: false,
    bestSeller: false,
    image: "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg",
    images: [
      "https://storage.googleapis.com/a1aa/image/344c663d-8fbe-4567-f1b2-f82a558b1a07.jpg"
    ],
    description: "Stunning sterling silver chandelier earrings with cubic zirconia accents. Make a statement at your next event.",
    details: {
      weight: "8.5g",
      length: "2.5 inches",
      backingType: "French wire",
      stones: "Cubic zirconia"
    },
    reviews: 8,
    rating: 4.4,
    stock: 4
  }
];

// Export categories with their subcategories
export const categories = {
  necklaces: {
    name: "Necklaces",
    subcategories: ["pendant", "strand", "chain", "choker", "statement"]
  },
  earrings: {
    name: "Earrings",
    subcategories: ["stud", "hoop", "drop", "chandelier", "climber"]
  },
  bracelets: {
    name: "Bracelets",
    subcategories: ["tennis", "bangle", "charm", "cuff", "link"]
  },
  rings: {
    name: "Rings",
    subcategories: ["solitaire", "halo", "three-stone", "eternity", "statement"]
  }
};

// Export materials
export const materials = [
  { id: "gold", name: "Gold" },
  { id: "silver", name: "Silver" },
  { id: "rose-gold", name: "Rose Gold" },
  { id: "white-gold", name: "White Gold" },
  { id: "platinum", name: "Platinum" },
  { id: "pearl", name: "Pearl" }
];

// Export price ranges
export const priceRanges = [
  { id: "under-100", name: "Under $100", min: 0, max: 99.99 },
  { id: "100-200", name: "$100 - $200", min: 100, max: 199.99 },
  { id: "200-500", name: "$200 - $500", min: 200, max: 499.99 },
  { id: "500-plus", name: "$500+", min: 500, max: Infinity }
];
