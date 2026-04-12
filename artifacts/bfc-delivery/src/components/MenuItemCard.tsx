import { useState } from "react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/lib/CartContext";
import type { MenuItem, MenuItemOption } from "@workspace/api-client-react";
import fallbackImage from "@/assets/images/menu-fallback.png";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: number;
  restaurantName: string;
}

export function MenuItemCard({ item, restaurantId, restaurantName }: MenuItemCardProps) {
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart();
  const [sizeOpen, setSizeOpen] = useState(false);

  const hasOptions = Array.isArray(item.options) && item.options.length > 0;
  const options = (item.options ?? []) as MenuItemOption[];

  // Cart entries for this menu item (may have multiple sizes)
  const myCartEntries = cartItems.filter(i => i.menuItemId === item.id);

  // For items WITHOUT options: single cart entry
  const baseCartKey = `${item.id}`;
  const baseEntry = myCartEntries.find(i => i.cartKey === baseCartKey);
  const baseQty = baseEntry?.quantity ?? 0;

  // Total ordered across all sizes
  const totalOrdered = myCartEntries.reduce((s, i) => s + i.quantity, 0);

  function cartKeyForOption(opt: MenuItemOption) {
    return `${item.id}-${opt.id}`;
  }
  function entryForOption(opt: MenuItemOption) {
    return myCartEntries.find(i => i.cartKey === cartKeyForOption(opt));
  }

  function handleDirectAdd() {
    addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl }, restaurantId, restaurantName);
  }

  function handleAddOption(opt: MenuItemOption) {
    addItem({ menuItemId: item.id, optionId: opt.id, optionName: opt.name, name: item.name, price: opt.price, quantity: 1, imageUrl: item.imageUrl }, restaurantId, restaurantName);
  }

  const lowestPrice = options.length > 0 ? Math.min(...options.map(o => o.price)) : item.price;
  const priceLabel = hasOptions ? `from $${lowestPrice.toFixed(2)}` : `$${item.price.toFixed(2)}`;

  return (
    <div>
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
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{item.description}</p>
          <div className="font-bold text-lg text-primary mt-auto">{priceLabel}</div>

          {/* Show size summary under price if sizes are in cart */}
          {hasOptions && totalOrdered > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {myCartEntries.map(entry => (
                <span key={entry.cartKey} className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                  {entry.optionName} ×{entry.quantity}
                </span>
              ))}
              <button
                onClick={() => setSizeOpen(true)}
                className="text-xs text-primary underline underline-offset-2 font-semibold hover:opacity-70 flex items-center gap-0.5"
              >
                Edit <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm">
            <img
              src={item.imageUrl || fallbackImage}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = fallbackImage; }}
            />
          </div>

          {item.isAvailable ? (
            hasOptions ? (
              /* Items with size options */
              totalOrdered > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => setSizeOpen(true)}
                >
                  {totalOrdered} added
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full rounded-full font-bold shadow-sm"
                  onClick={() => setSizeOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Size
                </Button>
              )
            ) : (
              /* Items without options */
              baseQty > 0 ? (
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-border">
                  <button
                    onClick={() => baseQty === 1 ? removeItem(baseCartKey) : updateQuantity(baseCartKey, baseQty - 1)}
                    className="w-7 h-7 rounded-full bg-background flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-4 text-center font-bold text-sm">{baseQty}</span>
                  <button
                    onClick={() => updateQuantity(baseCartKey, baseQty + 1)}
                    className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button size="sm" className="w-full rounded-full font-bold shadow-sm" onClick={handleDirectAdd}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              )
            )
          ) : (
            <span className="text-xs font-bold uppercase text-muted-foreground mt-2">Sold Out</span>
          )}
        </div>
      </div>

      {/* ── Size Picker Dialog ── */}
      <Dialog open={sizeOpen} onOpenChange={setSizeOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b">
            <DialogTitle className="text-base font-black">{item.name}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your size</p>
          </DialogHeader>

          <div className="divide-y px-6">
            {options.map(opt => {
              const entry = entryForOption(opt);
              const qty = entry?.quantity ?? 0;
              const ck = cartKeyForOption(opt);
              return (
                <div key={opt.id} className="flex items-center justify-between py-4 gap-3">
                  <div>
                    <p className="font-semibold text-sm">{opt.name}</p>
                    <p className="text-primary font-bold text-sm">${opt.price.toFixed(2)}</p>
                  </div>
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-border">
                      <button
                        onClick={() => qty === 1 ? removeItem(ck) : updateQuantity(ck, qty - 1)}
                        className="w-7 h-7 rounded-full bg-background flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{qty}</span>
                      <button
                        onClick={() => updateQuantity(ck, qty + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1 border-primary text-primary hover:bg-primary hover:text-white font-bold"
                      onClick={() => handleAddOption(opt)}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t">
            <Button className="w-full font-bold h-11" onClick={() => setSizeOpen(false)}>
              {totalOrdered > 0 ? `Done · ${totalOrdered} item${totalOrdered !== 1 ? "s" : ""} added` : "Done"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
