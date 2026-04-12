import { MapPin, Clock, Facebook, Instagram, Twitter, Activity } from "lucide-react";
import { Link } from "wouter";
import { useGetStatsOverview, getGetStatsOverviewQueryKey } from "@workspace/api-client-react";

export function Footer() {
  const { data: stats } = useGetStatsOverview({
    query: {
      queryKey: getGetStatsOverviewQueryKey(),
      staleTime: 60000,
    }
  });

  return (
    <footer className="bg-zinc-950 text-zinc-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 inline-block">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-display font-black text-2xl leading-none inline-block">
                BFC
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                Fast Delivery
              </span>
            </Link>
            <p className="text-zinc-400 max-w-sm">
              Cambodia's boldest, fastest food delivery platform. Bringing the vibrant energy of the street market straight to your door.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-wider text-zinc-100">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/restaurants">
                  <span className="text-zinc-400 hover:text-primary transition-colors cursor-pointer">All Restaurants</span>
                </Link>
              </li>
              <li>
                <Link href="/orders">
                  <span className="text-zinc-400 hover:text-primary transition-colors cursor-pointer">My Orders</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-primary transition-colors">Categories</a>
              </li>
            </ul>
          </div>

          {/* Features & Stats */}
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-wider text-zinc-100">The BFC Promise</h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-center gap-3 text-zinc-400">
                <div className="bg-primary/20 p-2 rounded text-primary">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Open 24/7, Always</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <div className="bg-secondary/20 p-2 rounded text-secondary">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Free Delivery Anywhere</span>
              </li>
            </ul>

            {stats && (
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-zinc-300">
                  <Activity className="w-4 h-4 text-primary" /> Live Stats
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-black text-white">{stats.totalRestaurants}+</div>
                    <div className="text-zinc-500">Restaurants</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">{stats.avgDeliveryTime}</div>
                    <div className="text-zinc-500">Avg Delivery</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download */}
          <div>
            <h4 className="font-bold text-lg mb-6 uppercase tracking-wider text-zinc-100">Get The App</h4>
            <p className="text-zinc-400 mb-4">Order even faster with our mobile app.</p>
            <div className="space-y-3">
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-3 flex items-center gap-3 transition-colors border border-zinc-700">
                <div className="font-bold text-left">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none mb-1">Download on the</div>
                  <div className="leading-none text-sm">App Store</div>
                </div>
              </button>
              <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-3 flex items-center gap-3 transition-colors border border-zinc-700">
                <div className="font-bold text-left">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none mb-1">Get it on</div>
                  <div className="leading-none text-sm">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} BFC Fast Delivery. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
