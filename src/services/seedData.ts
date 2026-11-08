import { CatalogItem } from '../types';

export const PRESET_ICONS = [
  '🍚', '🌾', '🥚', '🧄', '🧅', '🍅', '🥔', '🥕',
  '🌶️', '🥬', '🥒', '🌽', '🍗', '🥩', '🥓', '🐟',
  '🦐', '🛢️', '🧂', '🥫', '☕', '🥛', '🥤', '🍞',
  '🍌', '🍎', '🍋', '🧼', '🧹', '📦', '🏷️', '🛒'
];

export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  // Rice & Grains
  {
    id: 'cat-rice-sinandomeng',
    name: 'Rice (Sinandomeng)',
    category: 'Rice & Grains',
    unitPrice: 52.00,
    unit: 'kg',
    icon: '🍚',
    supplier: 'Bagsakan Central',
    notes: 'Well-milled everyday white rice',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-rice-dinorado',
    name: 'Rice (Dinorado)',
    category: 'Rice & Grains',
    unitPrice: 60.00,
    unit: 'kg',
    icon: '🌾',
    supplier: 'Bulacan Rice Mill',
    notes: 'Fragrant premium soft rice',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-rice-sack-50kg',
    name: 'Rice (1 Sack - 50kg)',
    category: 'Rice & Grains',
    unitPrice: 2450.00,
    unit: 'sack (50kg)',
    icon: '📦',
    supplier: 'Intercity Grain Center',
    notes: 'Wholesale sack for stall retail repack',
    updatedAt: new Date().toISOString()
  },

  // Eggs & Dairy
  {
    id: 'cat-egg-tray',
    name: 'Eggs (Medium Tray)',
    category: 'Eggs & Dairy',
    unitPrice: 235.00,
    unit: 'tray (30 pcs)',
    icon: '🥚',
    supplier: 'Batangas Egg Farm',
    notes: 'Fresh farm eggs, 30-egg tray',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-egg-large-tray',
    name: 'Eggs (Large Tray)',
    category: 'Eggs & Dairy',
    unitPrice: 260.00,
    unit: 'tray (30 pcs)',
    icon: '🥚',
    supplier: 'Batangas Egg Farm',
    notes: 'Large size table eggs',
    updatedAt: new Date().toISOString()
  },

  // Vegetables & Spices
  {
    id: 'cat-garlic',
    name: 'Garlic (Bawang)',
    category: 'Vegetables & Spices',
    unitPrice: 135.00,
    unit: 'kg',
    icon: '🧄',
    supplier: 'Divisoria Veggie Section',
    notes: 'Native whole garlic heads',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-red-onion',
    name: 'Red Onion (Sibuyas Pula)',
    category: 'Vegetables & Spices',
    unitPrice: 125.00,
    unit: 'kg',
    icon: '🧅',
    supplier: 'Divisoria Veggie Section',
    notes: 'Fresh local red onions',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-tomatoes',
    name: 'Tomatoes (Kamatis)',
    category: 'Vegetables & Spices',
    unitPrice: 75.00,
    unit: 'kg',
    icon: '🍅',
    supplier: 'Balintawak Bagsakan',
    notes: 'Plump ripe red tomatoes',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-ginger',
    name: 'Ginger (Luya)',
    category: 'Vegetables & Spices',
    unitPrice: 105.00,
    unit: 'kg',
    icon: '🥔',
    supplier: 'Balintawak Bagsakan',
    notes: 'Fresh ginger root',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-chili',
    name: 'Chili Labuyo (Sili)',
    category: 'Vegetables & Spices',
    unitPrice: 220.00,
    unit: 'kg',
    icon: '🌶️',
    supplier: 'Balintawak Bagsakan',
    notes: 'Hot native chili peppers',
    updatedAt: new Date().toISOString()
  },

  // Meat & Seafood
  {
    id: 'cat-whole-chicken',
    name: 'Whole Dressed Chicken',
    category: 'Meat & Seafood',
    unitPrice: 185.00,
    unit: 'kg',
    icon: '🍗',
    supplier: 'Poultry Wholesaler',
    notes: 'Dressed fresh broiler chicken',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-pork-kasim',
    name: 'Pork Shoulder (Kasim)',
    category: 'Meat & Seafood',
    unitPrice: 310.00,
    unit: 'kg',
    icon: '🥩',
    supplier: 'Stall Meat Dealer',
    notes: 'Lean fresh pork shoulder',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-pork-liempo',
    name: 'Pork Belly (Liempo)',
    category: 'Meat & Seafood',
    unitPrice: 370.00,
    unit: 'kg',
    icon: '🥓',
    supplier: 'Stall Meat Dealer',
    notes: 'Choice pork belly cuts',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-bangus',
    name: 'Bangus (Dagupan Milkfish)',
    category: 'Meat & Seafood',
    unitPrice: 210.00,
    unit: 'kg',
    icon: '🐟',
    supplier: 'Navotas Fish Port',
    notes: 'Fresh medium Dagupan bangus',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-tilapia',
    name: 'Tilapia (Freshwater Fish)',
    category: 'Meat & Seafood',
    unitPrice: 145.00,
    unit: 'kg',
    icon: '🐟',
    supplier: 'Navotas Fish Port',
    notes: 'Fresh medium tilapia',
    updatedAt: new Date().toISOString()
  },

  // Cooking Oil & Pantry
  {
    id: 'cat-cooking-oil',
    name: 'Cooking Oil (Mantika 1L)',
    category: 'Pantry & Canned',
    unitPrice: 78.00,
    unit: 'pouch (1L)',
    icon: '🛢️',
    supplier: 'Grocery Distributor',
    notes: 'Refined palm cooking oil',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-white-sugar',
    name: 'Refined White Sugar (Asukal)',
    category: 'Pantry & Canned',
    unitPrice: 74.00,
    unit: 'kg',
    icon: '🧂',
    supplier: 'Grocery Distributor',
    notes: 'Pure white cane sugar',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-brown-sugar',
    name: 'Brown Sugar (Asukal Pula)',
    category: 'Pantry & Canned',
    unitPrice: 65.00,
    unit: 'kg',
    icon: '🧂',
    supplier: 'Grocery Distributor',
    notes: 'Washed brown cane sugar',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-sardines-box',
    name: 'Sardines (Box of 100 cans)',
    category: 'Pantry & Canned',
    unitPrice: 2250.00,
    unit: 'box (100 cans)',
    icon: '🥫',
    supplier: 'Wholesale Depot',
    notes: 'Red tomato sauce canned sardines',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-instant-noodles-box',
    name: 'Pancit Canton (Box of 72)',
    category: 'Pantry & Canned',
    unitPrice: 1080.00,
    unit: 'box (72 packs)',
    icon: '🥫',
    supplier: 'Wholesale Depot',
    notes: 'Kalamansi instant noodles box',
    updatedAt: new Date().toISOString()
  },

  // Beverages & Coffee
  {
    id: 'cat-coffee-box',
    name: 'Coffee 3-in-1 (Box of 240)',
    category: 'Beverages & Coffee',
    unitPrice: 2880.00,
    unit: 'box (240 sachets)',
    icon: '☕',
    supplier: 'Direct Distributor',
    notes: 'Instant coffee mix wholesale box',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-evap-case',
    name: 'Evaporated Milk (Case of 48)',
    category: 'Beverages & Coffee',
    unitPrice: 1480.00,
    unit: 'case (48 cans)',
    icon: '🥛',
    supplier: 'Direct Distributor',
    notes: 'Culinary canned milk case',
    updatedAt: new Date().toISOString()
  },

  // Cleaning Supplies
  {
    id: 'cat-laundry-powder-sack',
    name: 'Laundry Powder (10kg Sack)',
    category: 'Cleaning Supplies',
    unitPrice: 850.00,
    unit: 'sack (10kg)',
    icon: '🧼',
    supplier: 'Palengke Chem Wholesaler',
    notes: 'Detergent powder for retail repack',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-dishwashing-gallon',
    name: 'Dishwashing Liquid (1 Gallon)',
    category: 'Cleaning Supplies',
    unitPrice: 240.00,
    unit: 'gallon',
    icon: '🧼',
    supplier: 'Palengke Chem Wholesaler',
    notes: 'Concentrated lemon dish soap',
    updatedAt: new Date().toISOString()
  }
];

export const CATEGORIES = [
  'All Items',
  'Rice & Grains',
  'Vegetables & Spices',
  'Meat & Seafood',
  'Eggs & Dairy',
  'Pantry & Canned',
  'Beverages & Coffee',
  'Cleaning Supplies'
];
