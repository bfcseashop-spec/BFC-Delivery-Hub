import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  cartKey: string;
  menuItemId: number;
  optionId?: number;
  optionName?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, "cartKey">, resId: number, resName: string) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function makeCartKey(menuItemId: number, optionId?: number): string {
  return optionId != null ? `${menuItemId}-${optionId}` : `${menuItemId}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bfc_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.restaurantId) setRestaurantId(parsed.restaurantId);
        if (parsed.restaurantName) setRestaurantName(parsed.restaurantName);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bfc_cart", JSON.stringify({ items, restaurantId, restaurantName }));
    } catch { /* ignore */ }
  }, [items, restaurantId, restaurantName]);

  const addItem = (item: Omit<CartItem, "cartKey">, resId: number, resName: string) => {
    const cartKey = makeCartKey(item.menuItemId, item.optionId);

    if (restaurantId !== null && restaurantId !== resId) {
      if (!confirm("Adding this item will clear your current cart from another restaurant. Continue?")) return;
      const label = item.optionName ? `${item.name} (${item.optionName})` : item.name;
      setItems([{ ...item, cartKey, quantity: 1 }]);
      setRestaurantId(resId);
      setRestaurantName(resName);
      toast.success(`Added ${label} from ${resName}`);
      return;
    }

    setRestaurantId(resId);
    setRestaurantName(resName);

    setItems(prev => {
      const existing = prev.find(i => i.cartKey === cartKey);
      const label = item.optionName ? `${item.name} (${item.optionName})` : item.name;
      if (existing) {
        toast.success(`Updated ${label} quantity`);
        return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`Added ${label} to cart`);
      return [...prev, { ...item, cartKey, quantity: 1 }];
    });
  };

  const removeItem = (cartKey: string) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.cartKey !== cartKey);
      if (filtered.length === 0) { setRestaurantId(null); setRestaurantName(null); }
      return filtered;
    });
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) { removeItem(cartKey); return; }
    setItems(prev => prev.map(i => i.cartKey === cartKey ? { ...i, quantity } : i));
  };

  const clearCart = () => { setItems([]); setRestaurantId(null); setRestaurantName(null); };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
