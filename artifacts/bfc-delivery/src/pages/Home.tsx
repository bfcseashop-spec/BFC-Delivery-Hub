import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, Search, Star } from "lucide-react";
import {
  useListCategories,
  useListRestaurants,
  getListCategoriesQueryKey,
  getListRestaurantsQueryKey,
} from "@workspace/api-client-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface HeroBanner {
  id: number; title: string; subtitle: string; ctaText: string;
  ctaLink: string; emoji: string; gradient: string; isActive: boolean; displayOrder: number;
}

interface PromoBanner {
  id: number; title: string; subtitle: string; badge: string;
  gradient: string; emoji: string; isActive: boolean; displayOrder: number;
}

interface QuickFilter {
  id: number; label: string; filterKey: string; filterValue: string;
  filterType: string; isActive: boolean; displayOrder: number;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function landingApi(path: string) {
  return fetch(`${BASE}/api${path}`, { credentials: "include" }).then(r => r.json());
}

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

type SortOption = "relevance" | "fastest" | "distance" | "top-rated";

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
          checked ? "bg-primary border-primary" : "border-zinc-300 group-hover:border-zinc-400"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{label}</span>
    </label>
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
          checked ? "border-primary" : "border-zinc-300 group-hover:border-zinc-400"
        }`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{label}</span>
    </label>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [activeFilterIds, setActiveFilterIds] = useState<Set<number>>(new Set());
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [filterHalal, setFilterHalal] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [filterVouchers, setFilterVouchers] = useState(false);
  const [filterDeals, setFilterDeals] = useState(false);

  const { data: categories, isLoading: isCategoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const { data: restaurants, isLoading: isRestaurantsLoading } = useListRestaurants(
    {},
    { query: { queryKey: getListRestaurantsQueryKey({}) } }
  );

  const { data: heroBanners = [] } = useQuery<HeroBanner[]>({
    queryKey: ["landing-hero-banners"],
    queryFn: () => landingApi("/landing/hero-banners"),
  });

  const { data: dealBanners = [] } = useQuery<PromoBanner[]>({
    queryKey: ["landing-banners"],
    queryFn: () => landingApi("/landing/banners"),
  });

  const { data: quickFilters = [] } = useQuery<QuickFilter[]>({
    queryKey: ["landing-filters"],
    queryFn: () => landingApi("/landing/filters"),
  });

  const { data: pageSettings = {} } = useQuery<Record<string, string>>({
    queryKey: ["landing-settings"],
    queryFn: () => landingApi("/landing/settings"),
  });

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroBanners.length), 5000);
    return () => clearInterval(t);
  }, [heroBanners.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/restaurants?search=${encodeURIComponent(search)}`);
    else setLocation("/restaurants");
  };

  const toggleCuisine = (id: number) => {
    setSelectedCuisines((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleQuickFilter = (id: number) => {
    setActiveFilterIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const activeFilters = quickFilters.filter(f => activeFilterIds.has(f.id));

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    let result = [...restaurants];

    if (selectedCuisines.length > 0) {
      result = result.filter((r) => selectedCuisines.includes(r.categoryId));
    }

    if (filterVegetarian) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes("veg") || r.description?.toLowerCase().includes("veg")
      );
    }

    for (const f of activeFilters) {
      switch (f.filterKey) {
        case "isOpen":
          result = result.filter(r => r.isOpen === true);
          break;
        case "topRated":
          result = result.filter(r => r.rating >= 4.0);
          break;
        case "minRating":
          result = result.filter(r => r.rating >= parseFloat(f.filterValue));
          break;
        case "maxMin":
          result = result.filter(r => r.minimumOrder <= parseFloat(f.filterValue));
          break;
        case "freeDelivery":
          break;
        case "vegetarian":
          result = result.filter(r =>
            r.name.toLowerCase().includes("veg") || r.description?.toLowerCase().includes("veg")
          );
          break;
        default:
          break;
      }
    }

    switch (sortBy) {
      case "fastest":
        result.sort((a, b) => {
          const aMin = parseInt(a.deliveryTime || "99");
          const bMin = parseInt(b.deliveryTime || "99");
          return aMin - bMin;
        });
        break;
      case "top-rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        result.sort((a, b) => a.id - b.id);
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [restaurants, selectedCuisines, filterVegetarian, activeFilters, sortBy]);

  const visibleCuisines = useMemo(() => {
    if (!categories) return [];
    const filtered = cuisineSearch
      ? categories.filter((c) => c.name.toLowerCase().includes(cuisineSearch.toLowerCase()))
      : categories;
    return showAllCuisines ? filtered : filtered.slice(0, 8);
  }, [categories, cuisineSearch, showAllCuisines]);

  const isFiltered = selectedCuisines.length > 0 || filterVegetarian || activeFilterIds.size > 0;
  const allListRestaurants = filteredRestaurants;

  const heroTitle = pageSettings.hero_title || "Sign up for free delivery\non your first order";
  const heroSubtitle = pageSettings.hero_subtitle || "";
  const heroCta = pageSettings.hero_cta_text || "Sign up";
  const heroEmoji = pageSettings.hero_emoji || "🛵";
  const cuisinesTitle = pageSettings.cuisines_section_title || "Your favourite cuisines";
  const dealsTitle = pageSettings.deals_section_title || "Your daily deals";
  const featuredTitle = pageSettings.featured_section_title || "Up to free delivery | Open 24/7";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Delivery / Pickup tabs */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-0">
            <button className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-primary border-b-2 border-primary">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/></svg>
              Delivery
            </button>
            <button className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-700 border-b-2 border-transparent">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>
              Pick-up
            </button>
            <button className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-zinc-500 hover:text-zinc-700 border-b-2 border-transparent">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>
              Shops
            </button>
            <div className="ml-auto flex items-center">
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-zinc-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines, and dishes"
                  className="bg-transparent text-sm outline-none text-zinc-700 placeholder:text-zinc-400 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6">

            {/* LEFT SIDEBAR */}
            <aside className="w-56 shrink-0">
              <div className="sticky top-24 space-y-5">
                <h2 className="text-base font-black text-zinc-900">Filters</h2>

                {/* Sort by */}
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Sort by</p>
                  <div className="space-y-1">
                    <Radio checked={sortBy === "relevance"} onChange={() => setSortBy("relevance")} label="Relevance" />
                    <Radio checked={sortBy === "fastest"} onChange={() => setSortBy("fastest")} label="Fastest delivery" />
                    <Radio checked={sortBy === "distance"} onChange={() => setSortBy("distance")} label="Distance" />
                    <Radio checked={sortBy === "top-rated"} onChange={() => setSortBy("top-rated")} label="Top rated" />
                  </div>
                </div>

                {/* Quick filters — from DB */}
                {quickFilters.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Quick filters</p>
                    <div className="flex flex-wrap gap-2">
                      {quickFilters.map(f => (
                        <button
                          key={f.id}
                          onClick={() => toggleQuickFilter(f.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                            activeFilterIds.has(f.id)
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                          }`}
                        >
                          {f.filterKey === "topRated" || f.filterKey === "minRating" ? (
                            <Star className="w-3 h-3" />
                          ) : null}
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offers */}
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Offers</p>
                  <div className="space-y-1">
                    <Checkbox checked={true} onChange={() => {}} label="Free delivery" />
                    <Checkbox checked={filterVouchers} onChange={() => setFilterVouchers(!filterVouchers)} label="Accepts vouchers" />
                    <Checkbox checked={filterDeals} onChange={() => setFilterDeals(!filterDeals)} label="Deals" />
                  </div>
                </div>

                {/* Cuisines */}
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Cuisines</p>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search for cuisines"
                      className="w-full pl-8 pr-3 py-1.5 border border-zinc-200 rounded-md text-xs outline-none focus:border-primary"
                      value={cuisineSearch}
                      onChange={(e) => setCuisineSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    {isCategoriesLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-5 bg-zinc-100 rounded animate-pulse" />
                        ))
                      : visibleCuisines.map((cat) => (
                          <Checkbox
                            key={cat.id}
                            checked={selectedCuisines.includes(cat.id)}
                            onChange={() => toggleCuisine(cat.id)}
                            label={cat.name}
                          />
                        ))}
                  </div>
                  {categories && categories.length > 8 && (
                    <button
                      onClick={() => setShowAllCuisines(!showAllCuisines)}
                      className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-700 mt-2"
                    >
                      {showAllCuisines ? "Show less" : "Show more"}{" "}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllCuisines ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {/* Dietary */}
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Dietary</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterVegetarian(!filterVegetarian)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        filterVegetarian
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                      }`}
                    >
                      Vegetarian
                    </button>
                    <button
                      onClick={() => setFilterHalal(!filterHalal)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        filterHalal
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                      }`}
                    >
                      Halal
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Price</p>
                  <div className="flex gap-2">
                    {["$", "$$", "$$$"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriceFilter(priceFilter === p ? null : p)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                          priceFilter === p
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear filters button — shows when any filter is active */}
                {(isFiltered || priceFilter) && (
                  <button
                    onClick={() => {
                      setSelectedCuisines([]);
                      setActiveFilterIds(new Set());
                      setFilterVegetarian(false);
                      setFilterHalal(false);
                      setPriceFilter(null);
                      setSortBy("relevance");
                    }}
                    className="w-full text-center text-xs font-bold text-primary border border-primary rounded-lg py-1.5 hover:bg-primary/5 transition"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Hero Banner Carousel — admin-managed, auto-rotating */}
              {heroBanners.length > 0 ? (
                <div className="relative overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${heroIndex * 100}%)` }}
                  >
                    {heroBanners.map((banner) => (
                      <div
                        key={banner.id}
                        className={`min-w-full bg-gradient-to-r ${banner.gradient} border border-orange-100 flex items-center justify-between px-8 py-5 gap-4 rounded-2xl`}
                      >
                        <div>
                          <h2 className="text-xl font-black text-zinc-900 leading-tight mb-1 whitespace-pre-line">
                            {banner.title}
                          </h2>
                          {banner.subtitle && (
                            <p className="text-sm text-zinc-600 mb-2">{banner.subtitle}</p>
                          )}
                          <Link href={banner.ctaLink || "/signup"}>
                            <button className="mt-2 bg-primary text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-primary/90 transition">
                              {banner.ctaText || "Sign up free"}
                            </button>
                          </Link>
                        </div>
                        <div className="text-7xl shrink-0 select-none hidden sm:block">{banner.emoji}</div>
                      </div>
                    ))}
                  </div>
                  {heroBanners.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {heroBanners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? "bg-primary w-4" : "bg-zinc-400/60"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-between px-8 py-5 gap-4">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 leading-tight mb-1 whitespace-pre-line">
                      {heroTitle}
                    </h2>
                    {heroSubtitle && (
                      <p className="text-sm text-zinc-600 mb-2">{heroSubtitle}</p>
                    )}
                    <Link href="/signup">
                      <button className="mt-2 bg-primary text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-primary/90 transition">
                        {heroCta}
                      </button>
                    </Link>
                  </div>
                  <div className="text-7xl shrink-0 select-none hidden sm:block">{heroEmoji}</div>
                </div>
              )}

              {/* Your favourite cuisines */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-black text-zinc-900">{cuisinesTitle}</h2>
                  <Link href="/restaurants" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    See all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {isCategoriesLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="shrink-0 flex flex-col items-center gap-2">
                          <Skeleton className="w-20 h-20 rounded-xl" />
                          <Skeleton className="w-14 h-3 rounded" />
                        </div>
                      ))
                    : categories?.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCuisine(cat.id)}
                          className="shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
                        >
                          <div
                            className={`w-20 h-20 rounded-xl bg-gradient-to-br ${
                              CATEGORY_COLORS[cat.slug] ?? "from-zinc-400 to-zinc-600"
                            } flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform ${
                              selectedCuisines.includes(cat.id) ? "ring-2 ring-primary ring-offset-2" : ""
                            }`}
                          >
                            {CATEGORY_EMOJI[cat.slug] ?? "🍱"}
                          </div>
                          <span className="text-xs font-semibold text-primary text-center w-20 truncate">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                </div>
              </section>

              {/* Daily Deals */}
              {dealBanners.length > 0 && (
                <section>
                  <h2 className="text-lg font-black text-zinc-900 mb-3">{dealsTitle}</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                    {dealBanners.map((deal) => (
                      <Link key={deal.id} href="/restaurants" className="shrink-0 w-48">
                        <div className={`${deal.gradient} rounded-xl p-4 h-24 flex flex-col justify-between cursor-pointer hover:opacity-95 transition`}>
                          <span className="text-white/90 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full w-fit">
                            {deal.badge}
                          </span>
                          <div>
                            <p className="text-white font-black text-sm leading-tight">{deal.title}</p>
                            <p className="text-white/80 text-xs mt-0.5">{deal.subtitle}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Restaurants */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-black text-zinc-900">
                    {isFiltered
                      ? `Filtered results (${allListRestaurants.length})`
                      : featuredTitle}
                  </h2>
                  {isFiltered && (
                    <button
                      onClick={() => { setSelectedCuisines([]); setActiveFilterIds(new Set()); setFilterVegetarian(false); }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {isRestaurantsLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <Skeleton className="aspect-[4/3] rounded-xl w-full" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : allListRestaurants.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-zinc-500 mb-3">No restaurants match your filters.</p>
                    <button
                      onClick={() => {
                        setSelectedCuisines([]);
                        setActiveFilterIds(new Set());
                        setFilterVegetarian(false);
                        setFilterHalal(false);
                        setSortBy("relevance");
                        setPriceFilter(null);
                      }}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {allListRestaurants.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} />
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
