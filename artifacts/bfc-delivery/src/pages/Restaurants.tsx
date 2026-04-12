import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import {
  useListRestaurants,
  useListCategories,
  getListRestaurantsQueryKey,
  getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Restaurants() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeCategory, setActiveCategory] = useState<number | undefined>(
    searchParams.get("category") ? Number(searchParams.get("category")) : undefined
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: restaurants, isLoading: isRestaurantsLoading } = useListRestaurants(
    {
      categoryId: activeCategory,
      search: debouncedSearch || undefined,
    },
    {
      query: {
        queryKey: getListRestaurantsQueryKey({
          categoryId: activeCategory,
          search: debouncedSearch || undefined,
        })
      }
    }
  );

  const { data: categories, isLoading: isCategoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-4 text-muted-foreground">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Find restaurants..." 
                    className="pl-9 bg-card"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm mb-4 text-muted-foreground flex items-center justify-between">
                  Categories
                  {activeCategory && (
                    <button 
                      onClick={() => setActiveCategory(undefined)}
                      className="text-xs text-primary hover:underline lowercase normal-case"
                    >
                      Clear
                    </button>
                  )}
                </h3>
                
                <div className="space-y-1.5">
                  <Button 
                    variant={!activeCategory ? "secondary" : "ghost"} 
                    className={`w-full justify-start font-medium ${!activeCategory ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}
                    onClick={() => setActiveCategory(undefined)}
                  >
                    All Categories
                  </Button>
                  
                  {isCategoriesLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))
                  ) : (
                    categories?.map(cat => (
                      <Button
                        key={cat.id}
                        variant={activeCategory === cat.id ? "secondary" : "ghost"}
                        className={`w-full justify-start font-medium ${activeCategory === cat.id ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Zone
                </div>
                <p className="text-sm text-muted-foreground">
                  We deliver anywhere in the city. Always free.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight mb-2">
                All Restaurants
              </h1>
              <p className="text-muted-foreground">
                {restaurants ? `${restaurants.length} results found` : 'Loading...'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isRestaurantsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-[4/3] rounded-xl w-full" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                restaurants?.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))
              )}
            </div>

            {!isRestaurantsLoading && restaurants?.length === 0 && (
              <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or category filter.
                </p>
                <Button onClick={() => { setSearch(""); setActiveCategory(undefined); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
