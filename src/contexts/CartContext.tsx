import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Product, CartItem } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCart, syncCartAPI, clearCartAPI } from "@/services/api";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedWeight: string, unitPrice: number, customMessage?: string) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  updateWeight: (productId: string, oldWeight: string, newWeight: string, newPrice: number) => void;
  updateCustomMessage: (productId: string, weight: string, message: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  cartAnimation: boolean;
  deliveryCharge: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "homemade_delights_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [cartAnimation, setCartAnimation] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  // Persist cart to localStorage always
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Sync to backend (debounced)
  const syncToBackend = useCallback((cartItems: CartItem[]) => {
    if (!user) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const apiItems = cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.nameEn,
          nameTa: item.product.nameTa || '',
          image: item.product.images?.[0] || '',
          weight: item.selectedWeight,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customMessage: item.customMessage || ''
        }));
        await syncCartAPI(apiItems);
      } catch (err) {
        console.error('Failed to sync cart to backend:', err);
      }
    }, 500);
  }, [user]);

  // Load cart from backend on login
  useEffect(() => {
    if (!user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    const loadCart = async () => {
      try {
        const result = await fetchCart();
        if (result.success && result.data && result.data.length > 0) {
          // Backend has cart data — use it (rebuild CartItem format)
          const backendItems: CartItem[] = result.data.map((item: any) => ({
            product: {
              id: item.productId,
              nameEn: item.name,
              nameTa: item.nameTa || '',
              images: item.image ? [item.image] : ['/placeholder.svg'],
              category: 'sweets' as const,
              price: item.unitPrice,
              descriptionEn: '',
              descriptionTa: '',
              ingredientsEn: [],
              ingredientsTa: [],
              benefitsEn: [],
              benefitsTa: [],
              storageEn: '',
              storageTa: '',
              shelfLife: '',
              available: true,
              totalSold: 0,
              weightOptions: []
            },
            quantity: item.quantity,
            selectedWeight: item.weight,
            unitPrice: item.unitPrice,
            customMessage: item.customMessage || ''
          }));
          // Merge: prefer backend, add any localStorage items not in backend
          const localItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
          const mergedItems = [...backendItems];
          localItems.forEach((localItem: CartItem) => {
            const exists = mergedItems.find(
              bi => bi.product.id === localItem.product.id && bi.selectedWeight === localItem.selectedWeight
            );
            if (!exists) mergedItems.push(localItem);
          });
          setItems(mergedItems);
        } else {
          // Backend empty but localStorage has items — sync to backend
          const localItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
          if (localItems.length > 0) {
            syncToBackend(localItems);
          }
        }
      } catch (err) {
        console.error('Failed to load cart from backend:', err);
      } finally {
        isLoadingRef.current = false;
      }
    };
    loadCart();
  }, [user]);

  // Clear cart on logout
  useEffect(() => {
    if (!user) {
      // Only clear if we previously had a user (logout scenario)
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, [user]);

  const triggerAnimation = useCallback(() => {
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 300);
  }, []);

  const addToCart = useCallback((product: Product, quantity: number, selectedWeight: string, unitPrice: number, customMessage?: string) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.product.id === product.id && item.selectedWeight === selectedWeight
      );
      let newItems: CartItem[];
      if (existingItem) {
        newItems = prev.map(item =>
          item.product.id === product.id && item.selectedWeight === selectedWeight
            ? { ...item, quantity: item.quantity + quantity, customMessage: customMessage || item.customMessage }
            : item
        );
      } else {
        newItems = [...prev, { product, quantity, selectedWeight, unitPrice, customMessage: customMessage || '' }];
      }
      syncToBackend(newItems);
      return newItems;
    });
    triggerAnimation();
    toast.success(
      <div>
        <p className="font-medium">Added to cart! / கார்ட்டில் சேர்க்கப்பட்டது!</p>
        <p className="text-sm text-muted-foreground">{product.nameEn} ({selectedWeight}) x {quantity}</p>
      </div>
    );
  }, [triggerAnimation, syncToBackend]);

  const removeFromCart = useCallback((productId: string, weight: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => !(item.product.id === productId && item.selectedWeight === weight));
      syncToBackend(newItems);
      return newItems;
    });
    toast.info("Item removed from cart / பொருள் கார்ட்டிலிருந்து அகற்றப்பட்டது");
  }, [syncToBackend]);

  const updateQuantity = useCallback((productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId && item.selectedWeight === weight
          ? { ...item, quantity }
          : item
      );
      syncToBackend(newItems);
      return newItems;
    });
  }, [removeFromCart, syncToBackend]);

  const updateWeight = useCallback((productId: string, oldWeight: string, newWeight: string, newPrice: number) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.product.id === productId && item.selectedWeight === newWeight
      );

      let newItems: CartItem[];
      if (existingItem) {
        const oldItem = prev.find(
          item => item.product.id === productId && item.selectedWeight === oldWeight
        );
        if (oldItem) {
          newItems = prev
            .map(item =>
              item.product.id === productId && item.selectedWeight === newWeight
                ? { ...item, quantity: item.quantity + oldItem.quantity }
                : item
            )
            .filter(item => !(item.product.id === productId && item.selectedWeight === oldWeight));
        } else {
          newItems = prev;
        }
      } else {
        newItems = prev.map(item =>
          item.product.id === productId && item.selectedWeight === oldWeight
            ? { ...item, selectedWeight: newWeight, unitPrice: newPrice }
            : item
        );
      }
      syncToBackend(newItems);
      return newItems;
    });
    toast.success("Weight updated! / எடை புதுப்பிக்கப்பட்டது!");
  }, [syncToBackend]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    if (user) {
      clearCartAPI().catch(err => console.error('Failed to clear cart on backend:', err));
    }
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const totalWeightKg = items.reduce((sum, item) => {
    const weightMatch = item.selectedWeight.match(/(\d+)/);
    const weightValue = weightMatch ? parseInt(weightMatch[1]) : 250;
    const weightInKg = item.selectedWeight.includes('kg') ? weightValue : weightValue / 1000;
    return sum + (weightInKg * item.quantity);
  }, 0);


  const updateCustomMessage = useCallback((productId: string, weight: string, message: string) => {
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId && item.selectedWeight === weight
          ? { ...item, customMessage: message }
          : item
      );
      syncToBackend(newItems);
      return newItems;
    });
  }, [syncToBackend]);

  const deliveryCharge = Math.round(totalWeightKg * 60);
  const grandTotal = totalPrice + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateWeight,
        updateCustomMessage,
        clearCart,
        totalItems,
        totalPrice,
        cartAnimation,
        deliveryCharge,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
