import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { ShoppingBag, Search, Menu, Clock, MapPin, User as UserIcon, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
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

export function Navbar() {
  const [location] = useLocation();
  const { totalItems, totalPrice } = useCart();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <span className="text-lg font-bold">Home</span>
                </Link>
                <Link href="/restaurants" onClick={() => setIsOpen(false)}>
                  <span className="text-lg font-bold">All Restaurants</span>
                </Link>
                {user && (
                  <Link href="/my-orders" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-bold">My Orders</span>
                  </Link>
                )}
                {!user && (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <span className="text-lg font-bold">Sign In</span>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

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
                <div className="px-2 py-1.5 text-sm font-bold truncate">
                  {user.name}
                </div>
                <div className="px-2 text-xs text-muted-foreground truncate mb-2">
                  {user.email}
                </div>
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
              <Button variant="outline" className="font-bold hidden sm:flex">
                Sign In
              </Button>
            </Link>
          )}

          <Link href="/checkout">
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
          </Link>
        </div>
      </div>
    </header>
  );
}
