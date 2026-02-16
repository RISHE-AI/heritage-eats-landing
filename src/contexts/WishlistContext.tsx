import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWishlistAPI, addToWishlistAPI, removeFromWishlistAPI, syncWishlistAPI } from "@/services/api";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "homemade_delights_wishlist";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const isLoadingRef = useRef(false);

  // Persist to localStorage always
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Load wishlist from backend on login
  useEffect(() => {
    if (!user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    const loadWishlist = async () => {
      try {
        const result = await fetchWishlistAPI();
        if (result.success && result.data) {
          // Map backend snake_case to frontend camelCase
          const backendProducts: Product[] = result.data.map(transformProduct);
          setItems(backendProducts);
        }
      } catch (err) {
        console.error('Failed to load wishlist from backend:', err);
      } finally {
        isLoadingRef.current = false;
      }
    };
    loadWishlist();
  }, [user]);

  // Clear on logout
  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setItems([]);
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      }
    }
  }, [user]);

  const addToWishlist = useCallback((product: Product) => {
    // Optimistic update
    setItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });

    if (user) {
      addToWishlistAPI(product.id).then(res => {
        if (res.success && res.data) {
          setItems(res.data.map(transformProduct));
        }
      }).catch(console.error);
    }

    toast.success(
      <div>
        <p className="font-medium">Added to wishlist! ❤️</p>
        <p className="text-sm text-muted-foreground">{product.nameEn}</p>
      </div>
    );
  }, [user]);

  const removeFromWishlist = useCallback((productId: string) => {
    // Optimistic update
    setItems(prev => prev.filter(item => item.id !== productId));

    if (user) {
      removeFromWishlistAPI(productId).then(res => {
        if (res.success && res.data) {
          setItems(res.data.map(transformProduct));
        }
      }).catch(console.error);
    }
    toast.info("Removed from wishlist");
  }, [user]);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        totalItems
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
