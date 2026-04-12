import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import type { MenuItem } from "@workspace/api-client-react";
import fallbackImage from "@/assets/images/menu-fallback.png";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: number;
  restaurantName: string;
}

export function MenuItemCard({ item, restaurantId, restaurantName }: MenuItemCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  
  const cartItem = items.find(i => i.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl
      },
      restaurantId,
      restaurantName
    );
  };

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-xl border border-border bg-card transition-all",
      !item.isAvailable && "opacity-60 grayscale-[0.5]"
    )}>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-bold text-lg leading-tight line-clamp-2">{item.name}</h4>
          {item.isPopular && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded text-secondary">
              Popular
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
          {item.description}
        </p>
        <div className="font-bold text-lg text-primary mt-auto">
          ${item.price.toFixed(2)}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm">
          <img 
            src={item.imageUrl || fallbackImage} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>
        
        {item.isAvailable ? (
          quantity > 0 ? (
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-border">
              <button 
                onClick={() => quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, quantity - 1)}
                className="w-7 h-7 rounded-full bg-background flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-4 text-center font-bold text-sm">{quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button 
              size="sm" 
              className="w-full rounded-full font-bold shadow-sm"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )
        ) : (
          <span className="text-xs font-bold uppercase text-muted-foreground mt-2">
            Sold Out
          </span>
        )}
      </div>
    </div>
  );
}
