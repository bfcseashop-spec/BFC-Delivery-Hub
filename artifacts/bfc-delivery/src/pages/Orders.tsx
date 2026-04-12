import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useListOrders, getListOrdersQueryKey, OrderStatus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, PackageX, Clock, CheckCircle2, Bike, ChefHat } from "lucide-react";

const statusIcons = {
  [OrderStatus.pending]: Clock,
  [OrderStatus.confirmed]: CheckCircle2,
  [OrderStatus.preparing]: ChefHat,
  [OrderStatus.out_for_delivery]: Bike,
  [OrderStatus.delivered]: CheckCircle2,
  [OrderStatus.cancelled]: PackageX,
};

const statusColors = {
  [OrderStatus.pending]: "bg-zinc-500",
  [OrderStatus.confirmed]: "bg-blue-500",
  [OrderStatus.preparing]: "bg-yellow-500",
  [OrderStatus.out_for_delivery]: "bg-primary",
  [OrderStatus.delivered]: "bg-green-500",
  [OrderStatus.cancelled]: "bg-destructive",
};

export default function Orders() {
  const { data: orders, isLoading } = useListOrders({
    query: {
      queryKey: getListOrdersQueryKey()
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight mb-2">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            View and track your recent orders.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet.
            </p>
            <Link href="/restaurants">
              <Button>Start Ordering</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              const statusColor = statusColors[order.status] || "bg-zinc-500";
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              }).format(new Date(order.createdAt));

              return (
                <Card key={order.id} className="overflow-hidden hover:border-primary/30 transition-colors">
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            #{order.id}
                          </Badge>
                          <Badge className={`${statusColor} text-white border-none flex items-center gap-1.5 px-2.5 py-0.5`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg leading-tight mb-1">
                          {order.restaurantName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {formattedDate} • {order.items.length} items
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="bg-muted px-2 py-1 rounded-md">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                        <div className="font-bold text-xl">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <Link href={`/order/${order.id}`}>
                          <Button variant="outline" size="sm" className="group">
                            Track Order
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
