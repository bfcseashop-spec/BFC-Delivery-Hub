import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, MapPin, Info, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/lib/CartContext";
import {
  useGetRestaurant,
  useGetRestaurantMenu,
  getGetRestaurantQueryKey,
  getGetRestaurantMenuQueryKey
} from "@workspace/api-client-react";

import fallbackImage from "@/assets/images/restaurant-fallback.png";

export default function RestaurantDetail() {
  const params = useParams();
  const restaurantId = parseInt(params.id || "0");
  
  const { items: cartItems, totalPrice, restaurantId: cartRestaurantId } = useCart();
  const isDifferentRestaurant = cartRestaurantId !== null && cartRestaurantId !== restaurantId;

  const { data: restaurant, isLoading: isRestaurantLoading } = useGetRestaurant(
    restaurantId,
    {
      query: {
        enabled: !!restaurantId,
        queryKey: getGetRestaurantQueryKey(restaurantId)
      }
    }
  );

  const { data: menu, isLoading: isMenuLoading } = useGetRestaurantMenu(
    restaurantId,
    {
      query: {
        enabled: !!restaurantId,
        queryKey: getGetRestaurantMenuQueryKey(restaurantId)
      }
    }
  );

  if (isRestaurantLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="h-64 md:h-80 w-full bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
          <Link href="/restaurants">
            <Button>Back to restaurants</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Header Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full">
        <div className="absolute inset-0 bg-zinc-900/40 z-10" />
        <img 
          src={restaurant.imageUrl || fallbackImage} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
        
        <div className="absolute bottom-0 left-0 w-full z-20 pb-8 text-white">
          <div className="container mx-auto px-4">
            <Link href="/restaurants" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-bold uppercase tracking-wider transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {restaurant.isFeatured && (
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary font-bold uppercase tracking-wider border-none">
                  Featured
                </Badge>
              )}
              <Badge className="bg-primary text-primary-foreground hover:bg-primary font-bold uppercase tracking-wider border-none">
                Free Delivery
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30 font-bold uppercase tracking-wider border-none backdrop-blur-md">
                {restaurant.categoryName}
              </Badge>
            </div>
            
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4">
              {restaurant.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-white/90">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-secondary text-secondary" />
                <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
                <span className="text-white/60">({restaurant.reviewCount}+ ratings)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-primary" />
                {restaurant.deliveryTime}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5" />
                <span className="line-clamp-1 max-w-[200px]">{restaurant.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Menu Sections */}
          <div className="lg:col-span-2 space-y-12">
            {!restaurant.isOpen && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-3 font-bold">
                <Info className="w-5 h-5" />
                This restaurant is currently closed. You can browse the menu but cannot place orders.
              </div>
            )}
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {restaurant.description}
            </p>

            {isMenuLoading ? (
              <div className="space-y-8">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : menu?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No menu items available for this restaurant.
              </div>
            ) : (
              menu?.map((section) => (
                <div key={section.category} id={`category-${section.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h2 className="font-display font-bold text-2xl mb-6 tracking-tight flex items-center gap-4">
                    {section.category}
                    <div className="h-px bg-border flex-1" />
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {section.items.map((item) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Cart Sidebar */}
          <aside className="lg:sticky lg:top-24 w-full">
            <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
              <div className="p-4 bg-zinc-950 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Your Order
                </h3>
              </div>

              <div className="p-4 flex-1 overflow-y-auto min-h-[200px]">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                    <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">Your cart is empty</p>
                    <p className="text-sm mt-1 text-center">Add items from the menu to start your order</p>
                  </div>
                ) : isDifferentRestaurant ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8 text-center">
                    <Info className="w-8 h-8 mb-2 text-secondary" />
                    <p className="font-medium text-foreground">Cart contains items from another restaurant.</p>
                    <p className="text-sm mt-1 mb-4">You can only order from one restaurant at a time.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // This will trigger clear when they try to add an item
                      }}
                    >
                      Start new order here
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.cartKey} className="flex justify-between gap-4">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-sm text-primary shrink-0">{item.quantity}x</span>
                          <div>
                            <span className="font-medium text-sm">{item.name}</span>
                            {item.optionName && (
                              <span className="block text-xs text-muted-foreground">{item.optionName}</span>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-sm shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && !isDifferentRestaurant && (
                <div className="p-4 bg-muted/50 border-t border-border">
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span className="text-primary font-bold">Free</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full h-12 text-lg font-bold" disabled={!restaurant.isOpen}>
                      {restaurant.isOpen ? 'Checkout' : 'Restaurant Closed'}
                    </Button>
                  </Link>
                  
                  {restaurant.minimumOrder > totalPrice && restaurant.isOpen && (
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Minimum order is ${restaurant.minimumOrder.toFixed(2)}. Add ${(restaurant.minimumOrder - totalPrice).toFixed(2)} more.
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
