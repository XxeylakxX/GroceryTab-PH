import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatalogItem, CartItem, ReceiptRecord, AccessibilitySettings } from '../types';
import { INITIAL_CATALOG_ITEMS } from './seedData';

const STORAGE_KEYS = {
  CATALOG: '@grocerytab_catalog_v3',
  RECEIPTS: '@grocerytab_receipts_v2',
  ACTIVE_CART: '@grocerytab_active_cart_v2',
  ACCESSIBILITY: '@grocerytab_accessibility_v2'
} as const;

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontScale: 'normal',
  theme: 'light',
  highContrast: true,
  hapticFeedback: true,
  viewMode: 'visual-grid'
};

export const StorageService = {
  // ==========================================
  // CATALOG MANAGEMENT
  // ==========================================
  async getCatalogItems(): Promise<CatalogItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CATALOG);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(INITIAL_CATALOG_ITEMS));
        return INITIAL_CATALOG_ITEMS;
      }
      const parsed: CatalogItem[] = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATALOG_ITEMS;
    } catch (error) {
      console.error('[StorageService] Error reading catalog:', error);
      return INITIAL_CATALOG_ITEMS;
    }
  },

  async saveCatalogItems(items: CatalogItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
    } catch (error) {
      console.error('[StorageService] Error saving catalog:', error);
      throw new Error('Failed to save catalog items.');
    }
  },

  async addCatalogItem(itemData: Omit<CatalogItem, 'id' | 'updatedAt'>): Promise<CatalogItem> {
    try {
      const current = await this.getCatalogItems();
      const newItem: CatalogItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lastPriceDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [newItem, ...current];
      await this.saveCatalogItems(updated);
      return newItem;
    } catch (error) {
      console.error('[StorageService] Error adding catalog item:', error);
      throw error;
    }
  },

  async updateCatalogItem(updatedItem: CatalogItem): Promise<void> {
    try {
      const current = await this.getCatalogItems();
      const index = current.findIndex(i => i.id === updatedItem.id);
      if (index === -1) {
        throw new Error('Item not found in catalog.');
      }
      const updatedList = [...current];
      updatedList[index] = {
        ...updatedItem,
        lastPriceDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await this.saveCatalogItems(updatedList);
    } catch (error) {
      console.error('[StorageService] Error updating catalog item:', error);
      throw error;
    }
  },

  /**
   * Automatically remember last price set for an item
   */
  async rememberLastPrice(itemId: string, newUnitPrice: number): Promise<void> {
    try {
      const current = await this.getCatalogItems();
      const index = current.findIndex(i => i.id === itemId);
      if (index !== -1) {
        current[index] = {
          ...current[index],
          unitPrice: newUnitPrice,
          lastPriceDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await this.saveCatalogItems(current);
      }
    } catch (error) {
      console.error('[StorageService] Error remembering last price:', error);
    }
  },

  async deleteCatalogItem(id: string): Promise<void> {
    try {
      const current = await this.getCatalogItems();
      const filtered = current.filter(i => i.id !== id);
      await this.saveCatalogItems(filtered);
    } catch (error) {
      console.error('[StorageService] Error deleting catalog item:', error);
      throw error;
    }
  },

  async resetCatalogToDefaults(): Promise<CatalogItem[]> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(INITIAL_CATALOG_ITEMS));
      return INITIAL_CATALOG_ITEMS;
    } catch (error) {
      console.error('[StorageService] Error resetting catalog:', error);
      throw error;
    }
  },

  // ==========================================
  // ACTIVE PROCUREMENT CART
  // ==========================================
  async getActiveCart(): Promise<CartItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CART);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('[StorageService] Error reading active cart:', error);
      return [];
    }
  },

  async saveActiveCart(cart: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_CART, JSON.stringify(cart));
    } catch (error) {
      console.error('[StorageService] Error saving active cart:', error);
    }
  },

  async clearActiveCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_CART);
    } catch (error) {
      console.error('[StorageService] Error clearing active cart:', error);
    }
  },

  // ==========================================
  // PROCUREMENT HISTORY
  // ==========================================
  async getReceipts(): Promise<ReceiptRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (!raw) return [];
      const parsed: ReceiptRecord[] = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : [];
    } catch (error) {
      console.error('[StorageService] Error reading receipts history:', error);
      return [];
    }
  },

  async saveReceipt(receipt: ReceiptRecord): Promise<void> {
    try {
      const current = await this.getReceipts();
      const updated = [receipt, ...current];
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
    } catch (error) {
      console.error('[StorageService] Error saving procurement sheet:', error);
      throw new Error('Failed to save procurement record.');
    }
  },

  async deleteReceipt(id: string): Promise<void> {
    try {
      const current = await this.getReceipts();
      const filtered = current.filter(r => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('[StorageService] Error deleting receipt:', error);
      throw error;
    }
  },

  async clearAllReceipts(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
    } catch (error) {
      console.error('[StorageService] Error clearing history:', error);
      throw error;
    }
  },

  // ==========================================
  // ACCESSIBILITY & VIEW MODE SETTINGS
  // ==========================================
  async getAccessibilitySettings(): Promise<AccessibilitySettings> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCESSIBILITY);
      if (!raw) return DEFAULT_ACCESSIBILITY_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ACCESSIBILITY_SETTINGS,
        ...parsed
      };
    } catch (error) {
      console.error('[StorageService] Error reading accessibility settings:', error);
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }
  },

  async saveAccessibilitySettings(settings: AccessibilitySettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(settings));
    } catch (error) {
      console.error('[StorageService] Error saving accessibility settings:', error);
    }
  }
};
