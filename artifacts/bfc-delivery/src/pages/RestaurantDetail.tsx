import { useState } from "react";
import { useParams } from "wouter";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, MapPin, Info, ArrowLeft, ShoppingBag, MessageSquare } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useGetRestaurant,
  useGetRestaurantMenu,
  getGetRestaurantQueryKey,
  getGetRestaurantMenuQueryKey
} from "@workspace/api-client-react";
import fallbackImage from "@/assets/images/restaurant-fallback.png";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

interface Review { id: number; customerName: string; rating: number; comment: string; createdAt: string; }

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${cls} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)} className="p-0.5">
          <Star className={`w-6 h-6 transition-colors ${i <= value ? "fill-amber-400 text-amber-400" : "text-zinc-300 fill-zinc-100 hover:text-amber-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function RestaurantDetail() {
  const params = useParams();
  const restaurantId = parseInt(params.id || "0");
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviewsKey = ["restaurant-reviews", restaurantId];
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: reviewsKey,
    queryFn: async () => {
      const r = await api(`/restaurants/${restaurantId}/reviews`);
      return r.ok ? r.json() : [];
    },
    enabled: !!restaurantId,
  });

  async function submitReview() {
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      const r = await api(`/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!r.ok) throw new Error("Failed to submit review");
      await qc.invalidateQueries({ queryKey: reviewsKey });
      await qc.invalidateQueries({ queryKey: getGetRestaurantQueryKey(restaurantId) });
      setReviewRating(0);
      setReviewComment("");
      toast({ title: "Review submitted!" });
    } catch {
      toast({ title: "Could not submit review", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  }
  
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

            {/* Reviews Section */}
            <div className="pt-4">
              <h2 className="font-display font-bold text-2xl mb-6 tracking-tight flex items-center gap-4">
                <MessageSquare className="w-6 h-6 text-primary" />
                Customer Reviews
                <div className="h-px bg-border flex-1" />
              </h2>

              {/* Write a review (logged-in users only) */}
              {user ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-6">
                  <h3 className="font-semibold mb-3 text-sm">Leave a Review</h3>
                  <div className="mb-3">
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share your experience (optional)…"
                    rows={3}
                    className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-3"
                  />
                  <Button
                    onClick={submitReview}
                    disabled={!reviewRating || submittingReview}
                    className="font-bold"
                    size="sm"
                  >
                    {submittingReview ? "Submitting…" : "Submit Review"}
                  </Button>
                </div>
              ) : (
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 text-sm text-zinc-500 flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span><Link href="/login" className="font-semibold text-primary underline">Sign in</Link> to leave a review</span>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-zinc-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-white border border-zinc-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{r.customerName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{r.customerName}</p>
                            <StarRow rating={r.rating} size="sm" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground pl-12">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
