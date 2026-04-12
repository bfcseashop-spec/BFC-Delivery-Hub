import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Bike, 
  MapPin, 
  Phone, 
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { 
  useGetOrder,
  getGetOrderQueryKey,
  OrderStatus
} from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_STEPS = [
  { id: OrderStatus.pending, label: "Pending", icon: Clock },
  { id: OrderStatus.confirmed, label: "Confirmed", icon: CheckCircle2 },
  { id: OrderStatus.preparing, label: "Preparing", icon: ChefHat },
  { id: OrderStatus.out_for_delivery, label: "On the way", icon: Bike },
  { id: OrderStatus.delivered, label: "Delivered", icon: MapPin },
];

export default function OrderTracking() {
  const params = useParams();
  const orderId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: order, isLoading } = useGetOrder(
    orderId,
    {
      query: {
        enabled: !!orderId,
        queryKey: getGetOrderQueryKey(orderId),
        refetchInterval: (data) => {
          // Poll every 5s until delivered or cancelled
          if (!data) return 5000;
          return (data.status === OrderStatus.delivered || data.status === OrderStatus.cancelled) ? false : 5000;
        }
      }
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-12" />
          <Card className="mb-8"><CardContent className="p-8"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <div className="grid sm:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === OrderStatus.cancelled;
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
  
  // Format date nicely
  const orderDate = new Date(order.createdAt);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(orderDate);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <Badge variant="outline" className="font-mono text-sm">
            Order #{order.id}
          </Badge>
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-display font-black text-4xl tracking-tight mb-3">
            {isCancelled ? "Order Cancelled" : 
             order.status === OrderStatus.delivered ? "Order Delivered!" : 
             "Track Your Order"}
          </h1>
          <p className="text-muted-foreground text-lg">
            From <span className="font-bold text-foreground">{order.restaurantName}</span>
          </p>
        </div>

        {!isCancelled && (
          <Card className="mb-8 border-primary/20 shadow-md overflow-hidden relative">
            {order.status === OrderStatus.delivered && (
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            )}
            <CardContent className="p-8 md:p-12 relative z-10">
              
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-6 left-[10%] right-[10%] h-1.5 bg-muted rounded-full" />
                
                {/* Active Progress Bar */}
                <div 
                  className="absolute top-6 left-[10%] h-1.5 bg-primary rounded-full transition-all duration-1000 ease-in-out" 
                  style={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 80)}%` }}
                />

                <div className="relative z-10 flex justify-between">
                  {STATUS_STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div className={`
                          w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500
                          ${isActive ? 'bg-primary text-primary-foreground border-white dark:border-zinc-950 scale-110 shadow-lg' : 
                            isCompleted ? 'bg-primary text-primary-foreground border-white dark:border-zinc-950' : 
                            'bg-muted text-muted-foreground border-white dark:border-zinc-950'}
                        `}>
                          <StepIcon className={`w-5 h-5 md:w-6 md:h-6 ${isActive && mounted ? 'animate-pulse' : ''}`} />
                        </div>
                        <span className={`
                          mt-3 text-xs md:text-sm font-bold uppercase tracking-wider text-center transition-colors
                          ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                        `}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.status !== OrderStatus.delivered && (
                <div className="mt-12 text-center">
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-bold mb-1">Estimated Arrival</p>
                  <p className="text-3xl font-display font-black text-primary">{order.estimatedDelivery}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-xl mb-6">Order Details</h3>
              
              <div className="space-y-4 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4">
                    <div className="flex gap-3">
                      <span className="font-bold text-primary">{item.quantity}x</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-medium shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-primary font-bold">Free</span>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between items-center text-xl">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-display font-bold text-xl mb-2">Delivery Info</h3>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1">Order Placed</p>
                    <p className="font-medium">{formattedDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-primary">Need help?</h4>
                <p className="text-sm text-muted-foreground mb-3">Our support team is available 24/7 to assist with your order.</p>
                <Button variant="outline" size="sm" className="font-bold">Contact Support</Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
