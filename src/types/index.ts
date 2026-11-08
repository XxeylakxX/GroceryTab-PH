export type FontScale = 'normal' | 'large' | 'extra-large';

export type AppTheme = 'light' | 'warm' | 'dark';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number; // in Philippine Pesos (₱) - remembers last price set
  lastPriceDate?: string;
  unit: string; // e.g. "kg", "tray", "sack", "box", "can", "bottle", "pack"
  icon: string; // Emoji icon e.g. "🍚", "🥚", "🧄"
  imageUri?: string; // Optional custom photo picked from gallery/camera
  supplier?: string; // e.g. "Divisoria", "Balintawak", "Suki Wholesaler"
  notes?: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number; // in Philippine Pesos (₱)
  quantity: number;
  unit: string;
  subtotal: number;
  icon?: string;
  imageUri?: string;
}

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  timestamp: string; // ISO string
  items: CartItem[];
  totalProcurement: number; // in ₱ (gross = final total, no discounts)
  cashPaid?: number; // Cash handed to supplier/wholesaler in ₱
  changeReceived?: number; // Sukli from supplier in ₱
  supplierName?: string; // Wholesaler / Market source
  notes?: string;
}

export interface AccessibilitySettings {
  fontScale: FontScale;
  theme: AppTheme;
  highContrast: boolean;
  hapticFeedback: boolean;
  viewMode: 'visual-grid' | 'list'; // Visual-first picture mode vs list mode
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHighlight: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  danger: string;
  dangerSurface: string;
  success: string;
  successSurface: string;
  warning: string;
  border: string;
  receiptPaper: string;
  receiptBorder: string;
  receiptText: string;
  receiptSubtext: string;
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;
}
