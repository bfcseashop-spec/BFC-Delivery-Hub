import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/CartContext";
import { ShoppingBag, Search, Menu, X, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const { totalItems, totalPrice } = useCart();
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
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/restaurants">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/checkout">
            <Button 
              variant={totalItems > 0 ? "default" : "secondary"} 
              className="relative rounded-full px-4 font-bold"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : "Cart"}
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
