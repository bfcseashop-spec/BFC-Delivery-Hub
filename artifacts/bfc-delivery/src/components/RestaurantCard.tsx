import { Star, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@workspace/api-client-react";

import fallbackImage from "@/assets/images/restaurant-fallback.png";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden cursor-pointer hover-elevate transition-all group border-transparent hover:border-primary/20 shadow-sm hover:shadow-md h-full flex flex-col bg-card">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={restaurant.imageUrl || fallbackImage}
            alt={restaurant.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {restaurant.isFeatured && (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary font-bold uppercase tracking-wider px-2.5 py-0.5">
                Featured
              </Badge>
            )}
            <Badge className="bg-primary text-primary-foreground hover:bg-primary font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
              Free Delivery
            </Badge>
          </div>
          
          <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm text-foreground font-bold px-2 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {restaurant.deliveryTime}
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-display font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
              {restaurant.rating.toFixed(1)}
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
            {restaurant.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-primary">•</span>
              {restaurant.categoryName}
            </div>
            {restaurant.minimumOrder > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-300">•</span>
                Min. ${restaurant.minimumOrder.toFixed(2)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
