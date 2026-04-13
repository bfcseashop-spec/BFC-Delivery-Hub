import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import {
  useListRestaurants,
  useListCategories,
  getListRestaurantsQueryKey,
  getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { useState, useEffect } from "react";

export default function Restaurants() {
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeCategory, setActiveCategory] = useState<number | undefined>(
    searchParams.get("category") ? Number(searchParams.get("category")) : undefined
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: restaurants, isLoading: isRestaurantsLoading } = useListRestaurants(
    { categoryId: activeCategory, search: debouncedSearch || undefined },
    { query: { queryKey: getListRestaurantsQueryKey({ categoryId: activeCategory, search: debouncedSearch || undefined }) } }
  );

  const { data: categories, isLoading: isCategoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const hasFilters = !!activeCategory || !!search;

  function CategoryList({ onSelect }: { onSelect?: () => void }) {
    return (
      <div className="space-y-1">
        <Button
          variant={!activeCategory ? "secondary" : "ghost"}
          className={`w-full justify-start font-medium text-sm h-9 ${!activeCategory ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
          onClick={() => { setActiveCategory(undefined); onSelect?.(); }}
        >
          All Categories
        </Button>
        {isCategoriesLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-md" />)
          : categories?.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "secondary" : "ghost"}
                className={`w-full justify-start font-medium text-sm h-9 ${activeCategory === cat.id ? "bg-zinc-200 dark:bg-zinc-800" : ""}`}
                onClick={() => { setActiveCategory(cat.id); onSelect?.(); }}
              >
                {cat.name}
              </Button>
            ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Mobile filter top bar */}
      <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-2 sticky top-[88px] z-20 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Find restaurants..."
            className="pl-9 h-9 text-sm bg-zinc-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition ${
            activeCategory ? "bg-primary text-white border-primary" : "text-zinc-600 border-zinc-200"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {activeCategory ? categories?.find(c => c.id === activeCategory)?.name ?? "Category" : "Category"}
        </button>
      </div>

      {/* Mobile Category Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl p-0 overflow-y-auto">
          <SheetHeader className="px-5 pt-5 pb-3 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-black">Filter by Category</SheetTitle>
              {activeCategory && (
                <button onClick={() => { setActiveCategory(undefined); setMobileSidebarOpen(false); }} className="text-xs font-bold text-primary">
                  Clear
                </button>
              )}
            </div>
          </SheetHeader>
          <div className="p-5">
            <CategoryList onSelect={() => setMobileSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-xs mb-3 text-muted-foreground">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Find restaurants..."
                    className="pl-9 bg-card h-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-wider text-xs mb-3 text-muted-foreground flex items-center justify-between">
                  Categories
                  {activeCategory && (
                    <button onClick={() => setActiveCategory(undefined)} className="text-xs text-primary hover:underline lowercase normal-case">
                      Clear
                    </button>
                  )}
                </h3>
                <CategoryList />
              </div>

              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary font-bold mb-1.5 text-sm">
                  <MapPin className="w-4 h-4" /> Delivery Zone
                </div>
                <p className="text-xs text-muted-foreground">We deliver anywhere in the city. Always free.</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="font-display font-black text-2xl md:text-4xl tracking-tight mb-1">
                {activeCategory ? (categories?.find(c => c.id === activeCategory)?.name ?? "Restaurants") : "All Restaurants"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isRestaurantsLoading ? "Loading…" : `${restaurants?.length ?? 0} restaurant${restaurants?.length !== 1 ? "s" : ""} found`}
                {hasFilters && (
                  <button onClick={() => { setSearch(""); setActiveCategory(undefined); }} className="ml-3 text-primary font-semibold text-xs hover:underline">
                    Clear filters
                  </button>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {isRestaurantsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <Skeleton className="aspect-[4/3] rounded-2xl w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                : restaurants?.map(r => <RestaurantCard key={r.id} restaurant={r} />)
              }
            </div>

            {!isRestaurantsLoading && (restaurants?.length ?? 0) === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground mb-6 text-sm">Try adjusting your search or category filter.</p>
                <Button onClick={() => { setSearch(""); setActiveCategory(undefined); }} className="font-bold">
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
