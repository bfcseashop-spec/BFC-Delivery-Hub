import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, MapPin, Search } from "lucide-react";
import {
  useListCategories,
  useListFeaturedRestaurants,
  useListRestaurants,
  getListCategoriesQueryKey,
  getListFeaturedRestaurantsQueryKey,
  getListRestaurantsQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";

const CATEGORY_COLORS: Record<string, string> = {
  khmer: "from-orange-400 to-orange-600",
  "fast-food": "from-red-400 to-red-600",
  noodles: "from-yellow-400 to-yellow-600",
  seafood: "from-blue-400 to-blue-600",
  "street-food": "from-green-400 to-green-600",
  drinks: "from-purple-400 to-purple-600",
  desserts: "from-pink-400 to-pink-600",
  bbq: "from-amber-500 to-amber-700",
  vegetarian: "from-lime-400 to-green-500",
};

const CATEGORY_EMOJI: Record<string, string> = {
  khmer: "🍲",
  "fast-food": "🍔",
  noodles: "🍜",
  seafood: "🦐",
  "street-food": "🌮",
  drinks: "🧋",
  desserts: "🍨",
  bbq: "🍖",
  vegetarian: "🥗",
};

const DEAL_BANNERS = [
  {
    id: 1,
    bg: "bg-gradient-to-r from-orange-500 to-red-500",
    title: "Free Delivery",
    subtitle: "On every order, every time",
    badge: "Always",
    emoji: "🛵",
  },
  {
    id: 2,
    bg: "bg-gradient-to-r from-yellow-400 to-orange-400",
    title: "Order before 10 AM",
    subtitle: "Get breakfast delivered in 20 mins",
    badge: "Morning Deal",
    emoji: "🌅",
  },
  {
    id: 3,
    bg: "bg-gradient-to-r from-purple-500 to-pink-500",
    title: "Night Bites",
    subtitle: "Open 24 hours, craving solved anytime",
    badge: "24/7",
    emoji: "🌙",
  },
  {
    id: 4,
    bg: "bg-gradient-to-r from-green-500 to-teal-500",
    title: "New Restaurants",
    subtitle: "Discover fresh spots near you",
    badge: "New",
    emoji: "⭐",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: isCategoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const { data: featuredRestaurants, isLoading: isFeaturedLoading } = useListFeaturedRestaurants({
    query: { queryKey: getListFeaturedRestaurantsQueryKey() },
  });

  const { data: allRestaurants, isLoading: isAllLoading } = useListRestaurants(
    {},
    { query: { queryKey: getListRestaurantsQueryKey({}) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/restaurants?search=${encodeURIComponent(search)}`);
    } else {
      setLocation("/restaurants");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Search Bar Row */}
        <div className="bg-white border-b border-zinc-100 px-4 py-3">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-zinc-100 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search for restaurants, cuisines, and dishes"
                className="flex-1 bg-transparent text-sm outline-none text-zinc-700 placeholder:text-zinc-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">

          {/* Promo Banner */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-between px-8 py-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-zinc-900 leading-tight mb-2">
                Free delivery on<br />every order
              </h2>
              <p className="text-zinc-500 text-sm mb-4">No minimum. No hidden fees. 24 hours a day.</p>
              <Link href="/restaurants">
                <button className="bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/90 transition">
                  Order now
                </button>
              </Link>
            </div>
            <div className="text-8xl shrink-0 select-none hidden sm:block">🛵</div>
          </div>

          {/* Your favourite cuisines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-zinc-900">Your favourite cuisines</h2>
              <Link href="/restaurants" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
              {isCategoriesLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="shrink-0 flex flex-col items-center gap-2">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <Skeleton className="w-14 h-3 rounded" />
                    </div>
                  ))
                : categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/restaurants?category=${cat.id}`}
                      className="shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                          CATEGORY_COLORS[cat.slug] ?? "from-zinc-400 to-zinc-600"
                        } flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        {CATEGORY_EMOJI[cat.slug] ?? "🍱"}
                      </div>
                      <span className="text-xs font-semibold text-primary text-center w-16 truncate">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
            </div>
          </section>

          {/* Daily Deals */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-zinc-900">Today's deals</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
              {DEAL_BANNERS.map((deal) => (
                <Link key={deal.id} href="/restaurants" className="shrink-0 w-52">
                  <div className={`${deal.bg} rounded-xl p-4 h-28 flex flex-col justify-between cursor-pointer hover:opacity-95 transition`}>
                    <span className="text-white/90 text-xs font-bold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full w-fit">
                      {deal.badge}
                    </span>
                    <div>
                      <p className="text-white font-black text-sm leading-tight">{deal.title}</p>
                      <p className="text-white/80 text-xs mt-0.5 leading-tight">{deal.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Restaurants */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-zinc-900">Top picks for you</h2>
              <Link href="/restaurants" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isFeaturedLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <Skeleton className="aspect-[4/3] rounded-xl w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : featuredRestaurants?.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} />
                  ))}
            </div>
          </section>

          {/* All Restaurants */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-zinc-900">All restaurants near you</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isAllLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <Skeleton className="aspect-[4/3] rounded-xl w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                : allRestaurants?.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} />
                  ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/restaurants">
                <button className="border-2 border-zinc-200 text-zinc-700 font-bold text-sm px-8 py-3 rounded-xl hover:border-primary hover:text-primary transition">
                  View all restaurants
                </button>
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
