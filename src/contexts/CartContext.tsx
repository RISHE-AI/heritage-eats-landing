import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, CartItem } from "@/types/product";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedWeight: string, unitPrice: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
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
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [cartAnimation, setCartAnimation] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const triggerAnimation = useCallback(() => {
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 300);
  }, []);

  const addToCart = useCallback((product: Product, quantity: number, selectedWeight: string, unitPrice: number) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.product.id === product.id && item.selectedWeight === selectedWeight
      );
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedWeight === selectedWeight
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedWeight, unitPrice }];
    });
    triggerAnimation();
    toast.success(
      <div>
        <p className="font-medium">Added to cart! / கார்ட்டில் சேர்க்கப்பட்டது!</p>
        <p className="text-sm text-muted-foreground">{product.nameEn} ({selectedWeight}) x {quantity}</p>
      </div>
    );
  }, [triggerAnimation]);

  const removeFromCart = useCallback((productId: string, weight: string) => {
    setItems(prev => prev.filter(item => !(item.product.id === productId && item.selectedWeight === weight)));
    toast.info("Item removed from cart / பொருள் கார்ட்டிலிருந்து அகற்றப்பட்டது");
  }, []);

  const updateQuantity = useCallback((productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedWeight === weight
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
  // Calculate weight in kg for delivery charge
  const totalWeightKg = items.reduce((sum, item) => {
    const weightMatch = item.selectedWeight.match(/(\d+)/);
    const weightValue = weightMatch ? parseInt(weightMatch[1]) : 250;
    const weightInKg = item.selectedWeight.includes('kg') ? weightValue : weightValue / 1000;
    return sum + (weightInKg * item.quantity);
  }, 0);
  
  // ₹60 per kg delivery, FREE for orders above ₹1000
  const deliveryCharge = totalPrice >= 1000 ? 0 : Math.ceil(totalWeightKg) * 60;
  const grandTotal = totalPrice + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
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
