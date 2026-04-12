import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  addItem: (item: CartItem, resId: number, resName: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("bfc_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.restaurantId) setRestaurantId(parsed.restaurantId);
        if (parsed.restaurantName) setRestaurantName(parsed.restaurantName);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        "bfc_cart",
        JSON.stringify({ items, restaurantId, restaurantName })
      );
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [items, restaurantId, restaurantName]);

  const addItem = (item: CartItem, resId: number, resName: string) => {
    if (restaurantId !== null && restaurantId !== resId) {
      // Trying to add from a different restaurant
      if (confirm("Adding this item will clear your current cart from another restaurant. Continue?")) {
        setItems([item]);
        setRestaurantId(resId);
        setRestaurantName(resName);
        toast.success(`Added ${item.name} from ${resName}`);
      }
      return;
    }

    setRestaurantId(resId);
    setRestaurantName(resName);

    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        toast.success(`Updated ${item.name} quantity`);
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prev, item];
    });
  };

  const removeItem = (menuItemId: number) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.menuItemId !== menuItemId);
      if (filtered.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return filtered;
    });
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
