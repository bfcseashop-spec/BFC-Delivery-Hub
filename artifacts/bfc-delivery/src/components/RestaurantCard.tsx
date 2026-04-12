import { Star, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Restaurant } from "@workspace/api-client-react";

import fallbackImage from "@/assets/images/restaurant-fallback.png";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-zinc-100 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
            src={restaurant.imageUrl || fallbackImage}
            alt={restaurant.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {restaurant.isFeatured && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full shadow-sm">
                ⭐ Featured
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full shadow-sm">
              Free Delivery
            </span>
          </div>

          {/* Delivery time — bottom right on image */}
          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm text-zinc-800 font-bold px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 text-primary" />
            {restaurant.deliveryTime}
          </div>

          {/* Rating pill — bottom left on image */}
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-zinc-800 font-bold px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {restaurant.rating.toFixed(1)}
          </div>
        </div>

        {/* Body */}
        <div className="p-3.5 flex-1 flex flex-col">
          <h3 className="font-bold text-base leading-tight line-clamp-1 text-zinc-900 group-hover:text-primary transition-colors mb-1">
            {restaurant.name}
          </h3>

          <p className="text-zinc-500 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
            {restaurant.description}
          </p>

          <div className="flex items-center gap-2 pt-2.5 border-t border-zinc-100">
            <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
              {restaurant.categoryName}
            </span>
            {restaurant.minimumOrder > 0 && (
              <span className="text-[11px] text-zinc-400 font-medium">
                Min. ${restaurant.minimumOrder.toFixed(2)}
              </span>
            )}
            {!restaurant.isOpen && (
              <span className="ml-auto text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
