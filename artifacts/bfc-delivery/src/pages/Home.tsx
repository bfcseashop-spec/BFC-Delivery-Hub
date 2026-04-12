import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Clock, Zap, MapPin, Map } from "lucide-react";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListCategories,
  useListFeaturedRestaurants,
  getListCategoriesQueryKey,
  getListFeaturedRestaurantsQueryKey
} from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";

import heroBg from "@/assets/images/hero.png";

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: isCategoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const { data: featuredRestaurants, isLoading: isFeaturedLoading } = useListFeaturedRestaurants({
    query: { queryKey: getListFeaturedRestaurantsQueryKey() }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/restaurants?search=${encodeURIComponent(search)}`);
    } else {
      setLocation("/restaurants");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img src={heroBg} alt="BFC Delivery Market" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />
          
          <div className="container mx-auto px-4 py-20 lg:py-32 relative z-20">
            <div className="max-w-2xl">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 font-bold uppercase tracking-wider mb-6 border-none px-4 py-1.5 text-sm">
                #1 in Cambodia
              </Badge>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-white">
                Cravings satisfied. <br />
                <span className="text-primary">Any time.</span>
              </h1>
              <p className="text-xl text-zinc-300 mb-10 max-w-lg leading-relaxed">
                The vibrant flavors of Cambodia's best restaurants, delivered to your door 24/7 with zero delivery fees. Always.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl max-w-xl focus-within:ring-2 ring-primary transition-all">
                <div className="flex-1 relative flex items-center">
                  <MapPin className="absolute left-4 w-5 h-5 text-zinc-400" />
                  <Input 
                    type="text"
                    placeholder="Enter your delivery address or search food..." 
                    className="w-full pl-12 bg-transparent border-none text-white placeholder:text-zinc-400 focus-visible:ring-0 text-lg h-14"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button size="lg" type="submit" className="h-14 px-8 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                  Find Food
                </Button>
              </form>
              
              <div className="mt-8 flex flex-wrap gap-6 text-sm font-bold uppercase tracking-wider text-zinc-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  24/7 Service
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  Free Delivery
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Strip */}
        <section className="py-12 bg-zinc-50 dark:bg-zinc-900 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight">Cravings Menu</h2>
              <Link href="/restaurants">
                <Button variant="link" className="font-bold text-primary hover:text-primary/80 group">
                  See all <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {isCategoriesLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="shrink-0 flex flex-col items-center gap-3">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                ))
              ) : (
                categories?.map((cat) => (
                  <Link key={cat.id} href={`/restaurants?category=${cat.id}`} className="snap-start">
                    <div className="shrink-0 group cursor-pointer flex flex-col items-center gap-3 w-24">
                      <div className="w-20 h-20 rounded-full bg-card shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all border border-border">
                        {cat.slug === 'street-food' ? '🍢' : 
                         cat.slug === 'khmer' ? '🍜' : 
                         cat.slug === 'fast-food' ? '🍔' : 
                         cat.slug === 'drinks' ? '🧋' : 
                         cat.slug === 'desserts' ? '🍧' : '🍱'}
                      </div>
                      <span className="font-bold text-sm text-center text-muted-foreground group-hover:text-foreground transition-colors">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl">
                <Badge className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/10 font-bold uppercase tracking-wider mb-4 border-none">
                  Top Picks
                </Badge>
                <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight mb-4">
                  Trending Now
                </h2>
                <p className="text-muted-foreground text-lg">
                  The most loved spots in the city, ready to cook for you.
                </p>
              </div>
              <Link href="/restaurants">
                <Button className="font-bold uppercase tracking-wide">
                  Browse All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isFeaturedLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <Skeleton className="aspect-[4/3] rounded-xl w-full" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                featuredRestaurants?.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))
              )}
              {featuredRestaurants?.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No featured restaurants found.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-6">
                How BFC Works
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Ordering your favorite food has never been easier or faster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-primary-foreground/20" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-white text-primary rounded-full flex items-center justify-center shadow-xl mb-6">
                  <Map className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">1. Set Location</h3>
                <p className="text-primary-foreground/80">Enter your address or pin your location anywhere in the city.</p>
              </div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-white text-primary rounded-full flex items-center justify-center shadow-xl mb-6">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">2. Choose Food</h3>
                <p className="text-primary-foreground/80">Browse hundreds of menus and add your cravings to the cart.</p>
              </div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shadow-xl mb-6">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">3. Fast Delivery</h3>
                <p className="text-primary-foreground/80">Get it hot and fresh. Always free delivery, 24 hours a day.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
