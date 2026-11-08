import { CatalogItem } from '../types';

export const PRESET_ICONS = [
  '🧄', '🧅', '🍅', '🥔', '🥕', '🌶️', '🥬', '🍆',
  '🥒', '🎃', '🌽', '🌿', '🍐', '🥦', '🍄', '🌱',
  '📦', '🧺', '⚖️', '🛒', '🏷️', '🚚'
];

export const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  // Root & Bulb Crops
  {
    id: 'veg-garlic',
    name: 'Garlic (Bawang)',
    category: 'Root & Bulb Crops',
    unitPrice: 130.00,
    unit: 'kg',
    icon: '🧄',
    supplier: '',
    notes: 'Whole native garlic heads',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-red-onion',
    name: 'Red Onion (Sibuyas Pula)',
    category: 'Root & Bulb Crops',
    unitPrice: 120.00,
    unit: 'kg',
    icon: '🧅',
    supplier: '',
    notes: 'Medium fresh local red onions',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-white-onion',
    name: 'White Onion (Sibuyas Puti)',
    category: 'Root & Bulb Crops',
    unitPrice: 140.00,
    unit: 'kg',
    icon: '🧅',
    supplier: '',
    notes: 'Sweet yellow/white onions',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-potatoes',
    name: 'Potatoes (Patatas)',
    category: 'Root & Bulb Crops',
    unitPrice: 85.00,
    unit: 'kg',
    icon: '🥔',
    supplier: '',
    notes: 'Benguet medium table potatoes',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-carrots',
    name: 'Carrots',
    category: 'Root & Bulb Crops',
    unitPrice: 90.00,
    unit: 'kg',
    icon: '🥕',
    supplier: '',
    notes: 'Fresh washed Benguet carrots',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-ginger',
    name: 'Ginger (Luya)',
    category: 'Root & Bulb Crops',
    unitPrice: 110.00,
    unit: 'kg',
    icon: '🥔',
    supplier: '',
    notes: 'Native fresh yellow ginger root',
    updatedAt: new Date().toISOString()
  },

  // Fruiting Vegetables
  {
    id: 'veg-tomatoes',
    name: 'Tomatoes (Kamatis)',
    category: 'Fruiting Vegetables',
    unitPrice: 70.00,
    unit: 'kg',
    icon: '🍅',
    supplier: '',
    notes: 'Plump ripe red salad tomatoes',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-eggplant',
    name: 'Eggplant (Talong)',
    category: 'Fruiting Vegetables',
    unitPrice: 65.00,
    unit: 'kg',
    icon: '🍆',
    supplier: '',
    notes: 'Long purple native eggplant',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-squash',
    name: 'Squash (Kalabasa)',
    category: 'Fruiting Vegetables',
    unitPrice: 45.00,
    unit: 'kg',
    icon: '🎃',
    supplier: '',
    notes: 'Sweet creamy native squash',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-chayote',
    name: 'Chayote (Sayote)',
    category: 'Fruiting Vegetables',
    unitPrice: 40.00,
    unit: 'kg',
    icon: '🍐',
    supplier: '',
    notes: 'Firm fresh green sayote',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-ampalaya',
    name: 'Bitter Gourd (Ampalaya)',
    category: 'Fruiting Vegetables',
    unitPrice: 95.00,
    unit: 'kg',
    icon: '🥒',
    supplier: '',
    notes: 'Crisp green bitter melon',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-cucumber',
    name: 'Cucumber (Pipino)',
    category: 'Fruiting Vegetables',
    unitPrice: 50.00,
    unit: 'kg',
    icon: '🥒',
    supplier: '',
    notes: 'Crunchy green salad cucumber',
    updatedAt: new Date().toISOString()
  },

  // Leafy Greens
  {
    id: 'veg-cabbage',
    name: 'Cabbage (Repolyo)',
    category: 'Leafy Greens',
    unitPrice: 75.00,
    unit: 'kg',
    icon: '🥬',
    supplier: '',
    notes: 'Tight round green cabbage head',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-pechay-baguio',
    name: 'Wombok (Pechay Baguio)',
    category: 'Leafy Greens',
    unitPrice: 65.00,
    unit: 'kg',
    icon: '🥬',
    supplier: '',
    notes: 'Chinese cabbage for chopsuey/soup',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-pechay-native',
    name: 'Native Pechay',
    category: 'Leafy Greens',
    unitPrice: 50.00,
    unit: 'bundle',
    icon: '🥬',
    supplier: '',
    notes: 'Fresh leafy native bok choy bundle',
    updatedAt: new Date().toISOString()
  },

  // Peppers & Spices
  {
    id: 'veg-chili-labuyo',
    name: 'Chili Labuyo (Siling Labuyo)',
    category: 'Peppers & Spices',
    unitPrice: 220.00,
    unit: 'kg',
    icon: '🌶️',
    supplier: '',
    notes: 'Fiery native small red hot peppers',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-chili-finger',
    name: 'Chili Finger (Siling Haba / Sigang)',
    category: 'Peppers & Spices',
    unitPrice: 110.00,
    unit: 'kg',
    icon: '🌶️',
    supplier: '',
    notes: 'Long green chili for sinigang',
    updatedAt: new Date().toISOString()
  },

  // Pod & Legume Vegetables
  {
    id: 'veg-sitaw',
    name: 'String Beans (Sitaw)',
    category: 'Pod & Legumes',
    unitPrice: 60.00,
    unit: 'bundle',
    icon: '🌿',
    supplier: '',
    notes: 'Tender yardlong green beans bundle',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'veg-okra',
    name: 'Okra',
    category: 'Pod & Legumes',
    unitPrice: 45.00,
    unit: 'bundle (500g)',
    icon: '🌿',
    supplier: '',
    notes: 'Young tender lady finger pods',
    updatedAt: new Date().toISOString()
  }
];

export const CATEGORIES = [
  'All Vegetables',
  'Root & Bulb Crops',
  'Fruiting Vegetables',
  'Leafy Greens',
  'Peppers & Spices',
  'Pod & Legumes'
];
