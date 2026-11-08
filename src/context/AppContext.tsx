import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CatalogItem, CartItem, ReceiptRecord } from '../types';
import { StorageService } from '../services/StorageService';
import { useAppTheme } from './ThemeContext';

interface AppContextType {
  // Catalog / Inventory State
  catalogItems: CatalogItem[];
  isLoadingCatalog: boolean;
  refreshCatalog: () => Promise<void>;
  addCatalogItem: (item: Omit<CatalogItem, 'id' | 'updatedAt' | 'lastPriceDate'>) => Promise<CatalogItem>;
  updateCatalogItem: (item: CatalogItem) => Promise<void>;
  deleteCatalogItem: (id: string) => Promise<void>;
  resetCatalog: () => Promise<void>;

  // Active Procurement Sheet State
  cartItems: CartItem[];
  supplierName: string;
  setSupplierName: (name: string) => void;
  addToCart: (item: CatalogItem | { name: string; unitPrice: number; unit?: string; id?: string; icon?: string; imageUri?: string }) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQty: (id: string, quantity: number) => void;
  incrementCartItem: (id: string, step?: number) => void;
  decrementCartItem: (id: string, step?: number) => void;
  updateCartItemPrice: (id: string, unitPrice: number) => void; // Remembers last price set!
  clearCart: () => void;
  loadReceiptToCart: (receipt: ReceiptRecord) => void;

  // Pricing & Cash Calculations (No Discounts)
  totalProcurement: number;
  cashPaid: number;
  setCashPaid: (amount: number) => void;
  changeReceived: number;

  // Procurement Logs / History
  receipts: ReceiptRecord[];
  isLoadingReceipts: boolean;
  refreshReceipts: () => Promise<void>;
  finalizeAndSaveReceipt: (notes?: string) => Promise<ReceiptRecord>;
  deleteReceipt: (id: string) => Promise<void>;
  clearAllReceipts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { triggerHapticFeedback } = useAppTheme();

  // Catalog state
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Active Procurement Sheet state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [supplierName, setSupplierName] = useState<string>('');
  const [cashPaid, setCashPaidState] = useState<number>(0);

  // Procurement Logs state
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(true);

  // Load initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const [loadedCatalog, loadedCart, loadedReceipts] = await Promise.all([
          StorageService.getCatalogItems(),
          StorageService.getActiveCart(),
          StorageService.getReceipts()
        ]);
        setCatalogItems(loadedCatalog);
        setCartItems(loadedCart);
        setReceipts(loadedReceipts);
      } catch (err) {
        console.error('[AppContext] Error loading data:', err);
      } finally {
        setIsLoadingCatalog(false);
        setIsLoadingReceipts(false);
      }
    };
    initData();
  }, []);

  // Persist active procurement sheet
  useEffect(() => {
    StorageService.saveActiveCart(cartItems);
  }, [cartItems]);

  // ==========================================
  // CATALOG ACTIONS
  // ==========================================
  const refreshCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const items = await StorageService.getCatalogItems();
      setCatalogItems(items);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const addCatalogItem = async (item: Omit<CatalogItem, 'id' | 'updatedAt' | 'lastPriceDate'>) => {
    const newItem = await StorageService.addCatalogItem(item);
    await refreshCatalog();
    triggerHapticFeedback('success');
    return newItem;
  };

  const updateCatalogItem = async (item: CatalogItem) => {
    await StorageService.updateCatalogItem(item);
    await refreshCatalog();
    // Also sync active procurement item if present
    setCartItems(prev =>
      prev.map(cItem => {
        if (cItem.id === item.id) {
          const newUnitPrice = item.unitPrice;
          return {
            ...cItem,
            name: item.name,
            unit: item.unit,
            icon: item.icon,
            imageUri: item.imageUri,
            unitPrice: newUnitPrice,
            subtotal: parseFloat((newUnitPrice * cItem.quantity).toFixed(2))
          };
        }
        return cItem;
      })
    );
    triggerHapticFeedback('success');
  };

  const deleteCatalogItem = async (id: string) => {
    await StorageService.deleteCatalogItem(id);
    await refreshCatalog();
    triggerHapticFeedback('warning');
  };

  const resetCatalog = async () => {
    const defaultItems = await StorageService.resetCatalogToDefaults();
    setCatalogItems(defaultItems);
    triggerHapticFeedback('success');
  };

  // ==========================================
  // PROCUREMENT SHEET ACTIONS
  // ==========================================
  const addToCart = (
    item: CatalogItem | { name: string; unitPrice: number; unit?: string; id?: string; icon?: string; imageUri?: string }
  ) => {
    triggerHapticFeedback('light');
    setCartItems(prev => {
      const itemId = item.id || `custom-${Date.now()}`;
      const existingIndex = prev.findIndex(i => i.id === itemId);

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: parseFloat((existing.unitPrice * newQty).toFixed(2))
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemId,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: 1,
          unit: item.unit || 'pc',
          subtotal: parseFloat(item.unitPrice.toFixed(2)),
          icon: 'icon' in item ? item.icon : '🛒',
          imageUri: 'imageUri' in item ? item.imageUri : undefined
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    triggerHapticFeedback('warning');
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateCartItemQty = (id: string, quantity: number) => {
    const validQty = Math.max(0, quantity);
    if (validQty === 0) {
      removeFromCart(id);
      return;
    }
    triggerHapticFeedback('light');
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: validQty,
            subtotal: parseFloat((item.unitPrice * validQty).toFixed(2))
          };
        }
        return item;
      })
    );
  };

  const incrementCartItem = (id: string, step = 1) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + step;
          return {
            ...item,
            quantity: newQty,
            subtotal: parseFloat((item.unitPrice * newQty).toFixed(2))
          };
        }
        return item;
      })
    );
    triggerHapticFeedback('light');
  };

  const decrementCartItem = (id: string, step = 1) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    if (item.quantity - step <= 0) {
      removeFromCart(id);
    } else {
      setCartItems(prev =>
        prev.map(i => {
          if (i.id === id) {
            const newQty = i.quantity - step;
            return {
              ...i,
              quantity: newQty,
              subtotal: parseFloat((i.unitPrice * newQty).toFixed(2))
            };
          }
          return i;
        })
      );
      triggerHapticFeedback('light');
    }
  };

  /**
   * Updates cart item price AND remembers last price set in the Catalog!
   */
  const updateCartItemPrice = (id: string, unitPrice: number) => {
    const safePrice = Math.max(0, unitPrice);

    // 1. Update active procurement cart
    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            unitPrice: safePrice,
            subtotal: parseFloat((safePrice * item.quantity).toFixed(2))
          };
        }
        return item;
      })
    );

    // 2. Remember last price set in Catalog
    StorageService.rememberLastPrice(id, safePrice);
    setCatalogItems(prev =>
      prev.map(cat => {
        if (cat.id === id) {
          return {
            ...cat,
            unitPrice: safePrice,
            lastPriceDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return cat;
      })
    );

    triggerHapticFeedback('medium');
  };

  const clearCart = () => {
    setCartItems([]);
    setCashPaidState(0);
    StorageService.clearActiveCart();
    triggerHapticFeedback('warning');
  };

  const loadReceiptToCart = (receipt: ReceiptRecord) => {
    setCartItems(receipt.items.map(item => ({ ...item })));
    setSupplierName(receipt.supplierName || '');
    setCashPaidState(receipt.cashPaid || 0);
    triggerHapticFeedback('success');
  };

  // ==========================================
  // PRICING & PROCUREMENT CALCULATIONS (NO DISCOUNTS)
  // ==========================================
  const setCashPaid = (amount: number) => {
    setCashPaidState(Math.max(0, amount));
  };

  const totalProcurement = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [cartItems]);

  const changeReceived = useMemo(() => {
    if (cashPaid <= 0) return 0;
    return parseFloat(Math.max(0, cashPaid - totalProcurement).toFixed(2));
  }, [cashPaid, totalProcurement]);

  // ==========================================
  // PROCUREMENT LOGS & HISTORY
  // ==========================================
  const refreshReceipts = async () => {
    setIsLoadingReceipts(true);
    try {
      const list = await StorageService.getReceipts();
      setReceipts(list);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  const finalizeAndSaveReceipt = async (notes?: string): Promise<ReceiptRecord> => {
    if (cartItems.length === 0) {
      throw new Error('Procurement sheet is empty.');
    }

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `PROC-${dateFormatted}-${randomSuffix}`;

    const newReceipt: ReceiptRecord = {
      id: `proc-${Date.now()}`,
      receiptNumber,
      timestamp: now.toISOString(),
      items: [...cartItems],
      totalProcurement,
      cashPaid: cashPaid > 0 ? cashPaid : undefined,
      changeReceived: cashPaid > 0 ? changeReceived : undefined,
      supplierName: supplierName.trim() || undefined,
      notes
    };

    // Ensure all items in the cart remember their last procurement price in the catalog
    for (const item of cartItems) {
      await StorageService.rememberLastPrice(item.id, item.unitPrice);
    }
    await refreshCatalog();

    await StorageService.saveReceipt(newReceipt);
    await refreshReceipts();
    clearCart();
    triggerHapticFeedback('success');
    return newReceipt;
  };

  const deleteReceipt = async (id: string) => {
    await StorageService.deleteReceipt(id);
    await refreshReceipts();
    triggerHapticFeedback('warning');
  };

  const clearAllReceipts = async () => {
    await StorageService.clearAllReceipts();
    await refreshReceipts();
    triggerHapticFeedback('warning');
  };

  return (
    <AppContext.Provider
      value={{
        catalogItems,
        isLoadingCatalog,
        refreshCatalog,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
        resetCatalog,

        cartItems,
        supplierName,
        setSupplierName,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        incrementCartItem,
        decrementCartItem,
        updateCartItemPrice,
        clearCart,
        loadReceiptToCart,

        totalProcurement,
        cashPaid,
        setCashPaid,
        changeReceived,

        receipts,
        isLoadingReceipts,
        refreshReceipts,
        finalizeAndSaveReceipt,
        deleteReceipt,
        clearAllReceipts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
