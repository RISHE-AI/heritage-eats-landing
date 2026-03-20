import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product";

const RECENTLY_VIEWED_KEY = "homemade_delights_recently_viewed";
const MAX_RECENT_ITEMS = 8;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to front
      const updated = [product, ...filtered];
      // Limit to max items
      return updated.slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  };
};
