import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { format } from "date-fns";

export default function MyOrders() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  const { data: orders, isLoading: isOrdersLoading } = useListOrders({
    query: {
      enabled: !!user,
      queryKey: getListOrdersQueryKey(),
    }
  });

  if (isAuthLoading || (user && isOrdersLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <div className="bg-zinc-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-black text-3xl tracking-tight mb-2">My Orders</h1>
          <p className="text-zinc-400 flex items-center gap-2">
            <Package className="w-4 h-4" /> View your order history and tracking
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold font-display mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">When you place orders, they will appear here.</p>
            <Link href="/restaurants">
              <Button size="lg" className="font-bold">Browse Restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="bg-muted px-6 py-3 flex flex-wrap gap-4 items-center justify-between border-b">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm">Order #{order.id}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 
                      {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  <Badge 
                    variant={
                      order.status === "delivered" ? "default" :
                      order.status === "cancelled" ? "destructive" :
                      "secondary"
                    }
                    className="uppercase tracking-wider font-bold"
                  >
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{order.restaurantName}</h3>
                        <p className="text-muted-foreground text-sm max-w-sm truncate">{order.deliveryAddress}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              <span className="font-bold text-foreground mr-2">{item.quantity}x</span> 
                              {item.name}
                            </span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end gap-4 min-w-[140px] border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                        <p className="text-2xl font-bold font-display text-primary">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <Link href={`/order/${order.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto font-bold">
                          Track Order <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
