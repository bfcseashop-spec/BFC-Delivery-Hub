import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, MapPin, Phone, User, Clock, CheckCircle2 } from "lucide-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(8, "Valid phone number required"),
  deliveryAddress: z.string().min(10, "Please provide a complete delivery address"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalPrice, restaurantId, restaurantName, clearCart } = useCart();
  const createOrder = useCreateOrder();
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
    },
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center max-w-md px-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4 font-display">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/restaurants">
              <Button size="lg" className="w-full font-bold">Browse Restaurants</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!restaurantId) return;

    try {
      const order = await createOrder.mutateAsync({
        data: {
          restaurantId,
          items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          ...data
        }
      });
      
      toast.success("Order placed successfully!");
      clearCart();
      setLocation(`/order/${order.id}`);
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-black text-3xl tracking-tight mb-2">Checkout</h1>
          <p className="text-primary-foreground/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> You're almost there
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={restaurantId ? `/restaurant/${restaurantId}` : "/restaurants"} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold uppercase tracking-wider transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to menu
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Form */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">Delivery Details</h2>
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold">
                            <User className="w-4 h-4 text-muted-foreground" /> Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold">
                            <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="012 345 678" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-bold">
                            <MapPin className="w-4 h-4 text-muted-foreground" /> Delivery Address
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Street 123, House 45, Phnom Penh" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 text-lg font-bold"
                        disabled={createOrder.isPending}
                      >
                        {createOrder.isPending ? "Placing Order..." : "Place Order • Cash on Delivery"}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                        <Clock className="w-4 h-4" /> Fast 24/7 delivery guaranteed
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">Order Summary</h2>
            <Card className="bg-zinc-950 text-white border-zinc-800">
              <CardContent className="p-6">
                <div className="mb-6 pb-6 border-b border-zinc-800">
                  <h3 className="font-bold text-lg mb-1">{restaurantName}</h3>
                  <p className="text-zinc-400 text-sm">Always free delivery</p>
                </div>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between gap-4">
                      <div className="flex gap-3">
                        <span className="font-bold text-primary">{item.quantity}x</span>
                        <span className="font-medium text-zinc-200">{item.name}</span>
                      </div>
                      <span className="font-medium text-zinc-300 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-zinc-800 mb-4" />

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery Fee</span>
                    <span className="text-primary font-bold tracking-wide uppercase">Free</span>
                  </div>
                </div>

                <Separator className="bg-zinc-800 mb-4" />

                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold">Total to pay</span>
                  <span className="font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
