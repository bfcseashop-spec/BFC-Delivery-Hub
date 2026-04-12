import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { ShoppingBag, Search, Menu, Clock, MapPin, User as UserIcon, LogOut, Package, Trash2, Plus, Minus, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import fallbackImage from "@/assets/images/menu-fallback.png";

export function Navbar() {
  const [location] = useLocation();
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart, restaurantName } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold flex justify-center items-center gap-4">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" /> 24 HOURS OPEN
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-secondary">
          <MapPin className="w-3.5 h-3.5" /> FREE DELIVERY ANYWHERE
        </span>
      </div>

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Mobile hamburger */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <span className="text-lg font-bold">Home</span>
                </Link>
                <Link href="/restaurants" onClick={() => setMenuOpen(false)}>
                  <span className="text-lg font-bold">All Restaurants</span>
                </Link>
                {user && (
                  <Link href="/my-orders" onClick={() => setMenuOpen(false)}>
                    <span className="text-lg font-bold">My Orders</span>
                  </Link>
                )}
                {!user && (
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <span className="text-lg font-bold">Sign In</span>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-display font-black text-xl leading-none">
              BFC
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline-block tracking-tight">
              Fast Delivery
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/restaurants">
              <span className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">Browse</span>
            </Link>
            {user && (
              <Link href="/my-orders">
                <span className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer uppercase tracking-wide">My Orders</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/restaurants">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-bold gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-bold truncate">{user.name}</div>
                <div className="px-2 text-xs text-muted-foreground truncate mb-2">{user.email}</div>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full cursor-pointer flex items-center">
                      <Search className="w-4 h-4 mr-2" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/my-orders" className="w-full cursor-pointer flex items-center">
                    <Package className="w-4 h-4 mr-2" /> My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer font-bold">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="font-bold hidden sm:flex">Sign In</Button>
            </Link>
          )}

          {/* ── Cart Sheet ── */}
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant={totalItems > 0 ? "default" : "secondary"}
                className="relative rounded-full px-4 font-bold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : "Cart"}
                </span>
                <span className="sm:hidden">
                  {totalItems > 0 ? `$${totalPrice.toFixed(2)}` : ""}
                </span>
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full border-2 border-background"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col p-0">
              <SheetHeader className="px-6 py-5 border-b shrink-0">
                <SheetTitle className="flex items-center gap-2 font-black text-xl">
                  <ShoppingCart className="w-5 h-5 text-primary" /> Your Cart
                  {totalItems > 0 && (
                    <Badge className="ml-1 bg-primary text-white font-bold text-xs px-2">{totalItems}</Badge>
                  )}
                </SheetTitle>
                {restaurantName && (
                  <p className="text-xs text-muted-foreground mt-0.5">From <span className="font-semibold text-foreground">{restaurantName}</span></p>
                )}
              </SheetHeader>

              {items.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-40" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground">Add items from a restaurant to get started</p>
                  </div>
                  <Link href="/restaurants" onClick={() => setCartOpen(false)}>
                    <Button className="font-bold mt-2">Browse Restaurants</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* ── Item list ── */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                    {items.map(item => (
                      <div key={item.cartKey} className="flex gap-3 py-4 border-b border-border/60 last:border-0">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <img
                            src={item.imageUrl || fallbackImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = fallbackImage; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm leading-tight">{item.name}</p>
                          {item.optionName && (
                            <span className="inline-block text-[11px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full mt-0.5">
                              {item.optionName}
                            </span>
                          )}
                          <p className="text-primary font-black text-sm mt-1">${item.price.toFixed(2)}</p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-muted rounded-full p-0.5 border border-border">
                              <button
                                onClick={() => item.quantity === 1 ? removeItem(item.cartKey) : updateQuantity(item.cartKey, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-background flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-sm"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              = ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          className="shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ── Footer ── */}
                  <div className="shrink-0 border-t bg-muted/30 px-6 py-5 space-y-4">
                    {/* Pricing breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span className="text-primary font-bold uppercase tracking-wide">Free</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-black text-lg pt-1">
                        <span>Total</span>
                        <span className="text-primary">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!user ? (
                      <div className="space-y-2">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                          <p className="text-sm font-semibold text-amber-800 mb-0.5">Sign in to place your order</p>
                          <p className="text-xs text-amber-600">Your cart will be saved while you log in</p>
                        </div>
                        <Link href="/login" onClick={() => setCartOpen(false)}>
                          <Button className="w-full h-12 text-base font-black rounded-xl">
                            Sign In to Order →
                          </Button>
                        </Link>
                      </div>
                    ) : user.role === "admin" ? (
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-zinc-700">Admin accounts cannot place orders</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Use a customer account to order</p>
                      </div>
                    ) : (
                      <Link href="/checkout" onClick={() => setCartOpen(false)}>
                        <Button className="w-full h-12 text-base font-black rounded-xl">
                          Proceed to Checkout →
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={() => { clearCart(); }}
                      className="w-full text-xs text-muted-foreground hover:text-destructive font-semibold flex items-center justify-center gap-1 py-1 transition"
                    >
                      <Trash2 className="w-3 h-3" /> Clear entire cart
                    </button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
