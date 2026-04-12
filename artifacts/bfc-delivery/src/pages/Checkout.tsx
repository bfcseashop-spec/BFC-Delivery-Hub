import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ShoppingBag, MapPin, Phone, User, Clock,
  CheckCircle2, CreditCard, Banknote, ChevronRight, Lock, ArrowRight,
} from "lucide-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(8, "Valid phone number required"),
  deliveryAddress: z.string().min(10, "Please provide a complete delivery address"),
});
type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type PaymentMethod = {
  id: string;
  label: string;
  sublabel: string;
  gradient: string;
  iconBg: string;
  textColor: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    sublabel: "Pay when your food arrives",
    gradient: "from-emerald-50 to-green-100 border-emerald-200",
    iconBg: "bg-emerald-500",
    textColor: "text-emerald-700",
    badge: "Most Popular",
    badgeColor: "bg-emerald-500 text-white",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zm2 0v10h16V7H4zm5 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
      </svg>
    ),
  },
  {
    id: "aba",
    label: "ABA Pay",
    sublabel: "Scan QR or pay via ABA Mobile",
    gradient: "from-red-50 to-orange-100 border-red-200",
    iconBg: "bg-[#ED1C24]",
    textColor: "text-red-700",
    badge: "Instant",
    badgeColor: "bg-red-500 text-white",
    icon: (
      <svg viewBox="0 0 40 24" className="w-8 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <text x="2" y="18" fontFamily="Arial" fontWeight="900" fontSize="16">ABA</text>
      </svg>
    ),
  },
  {
    id: "acleda",
    label: "ACleda Bank",
    sublabel: "Pay via ACleda Unity ToanChet",
    gradient: "from-blue-50 to-indigo-100 border-blue-200",
    iconBg: "bg-[#003087]",
    textColor: "text-blue-800",
    icon: (
      <svg viewBox="0 0 44 24" className="w-10 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="18" fontFamily="Arial" fontWeight="900" fontSize="13">ACLEDA</text>
      </svg>
    ),
  },
  {
    id: "paypal",
    label: "PayPal",
    sublabel: "Pay securely with PayPal",
    gradient: "from-sky-50 to-blue-100 border-sky-200",
    iconBg: "bg-[#003087]",
    textColor: "text-sky-700",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.02 21.93 7.98 16H5.5l1.74-10.5A.75.75 0 0 1 8 5h6c2.33 0 3.97.97 4.44 2.67.22.8.18 1.57-.1 2.33A3.77 3.77 0 0 1 15.67 12h-2.1l-.5 3H15l-.22 1.35a.75.75 0 0 1-.74.65H7.77a.75.75 0 0 1-.74-.07Z"/>
      </svg>
    ),
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    sublabel: "Visa, Mastercard, UnionPay",
    gradient: "from-violet-50 to-purple-100 border-violet-200",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-700",
    textColor: "text-violet-700",
    icon: <CreditCard className="w-6 h-6 text-white" />,
  },
  {
    id: "wing",
    label: "Wing Money",
    sublabel: "Pay via Wing mobile wallet",
    gradient: "from-orange-50 to-amber-100 border-orange-200",
    iconBg: "bg-[#F7941D]",
    textColor: "text-orange-700",
    icon: (
      <svg viewBox="0 0 44 24" className="w-10 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="18" fontFamily="Arial" fontWeight="900" fontSize="15">WING</text>
      </svg>
    ),
  },
];

function PaymentMethodCard({
  method, selected, onSelect,
}: { method: PaymentMethod; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer select-none relative overflow-hidden",
        "bg-gradient-to-r",
        method.gradient,
        selected
          ? "ring-2 ring-offset-2 ring-primary scale-[1.01] shadow-lg border-primary"
          : "hover:scale-[1.005] hover:shadow-md",
      )}
    >
      {method.badge && (
        <span className={cn(
          "absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full",
          method.badgeColor,
        )}>
          {method.badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", method.iconBg)}>
          {method.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-black text-sm leading-tight", method.textColor)}>{method.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{method.sublabel}</p>
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
          selected ? "border-primary bg-primary" : "border-zinc-300 bg-white",
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </button>
  );
}

function CardPaymentForm() {
  return (
    <div className="mt-4 p-5 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-violet-500" />
        <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Secured with SSL encryption</span>
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-600 mb-1 block">Card Number</label>
        <Input placeholder="1234  5678  9012  3456" className="h-11 text-sm tracking-widest bg-white border-violet-200 focus:border-violet-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-zinc-600 mb-1 block">Expiry Date</label>
          <Input placeholder="MM / YY" className="h-11 text-sm bg-white border-violet-200 focus:border-violet-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-600 mb-1 block">CVV</label>
          <Input placeholder="•••" className="h-11 text-sm bg-white border-violet-200 focus:border-violet-500" type="password" maxLength={4} />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-600 mb-1 block">Cardholder Name</label>
        <Input placeholder="Name on card" className="h-11 text-sm bg-white border-violet-200 focus:border-violet-500" />
      </div>
      <div className="flex items-center gap-4 pt-1">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 object-contain opacity-70" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 object-contain opacity-70" />
        <span className="text-xs text-zinc-400 font-medium">& UnionPay</span>
      </div>
    </div>
  );
}

function QRCodePlaceholder({ label, color }: { label: string; color: string }) {
  return (
    <div className={cn("mt-4 p-5 rounded-2xl border-2 animate-in slide-in-from-top-2 duration-200", color)}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-bold text-zinc-700">Scan to pay with {label}</p>
        <div className="w-36 h-36 bg-white rounded-xl border border-zinc-200 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-28 h-28" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="30" height="30" rx="3" fill="none" stroke="#222" strokeWidth="4"/>
            <rect x="16" y="16" width="18" height="18" fill="#222"/>
            <rect x="60" y="10" width="30" height="30" rx="3" fill="none" stroke="#222" strokeWidth="4"/>
            <rect x="66" y="16" width="18" height="18" fill="#222"/>
            <rect x="10" y="60" width="30" height="30" rx="3" fill="none" stroke="#222" strokeWidth="4"/>
            <rect x="16" y="66" width="18" height="18" fill="#222"/>
            <rect x="60" y="55" width="6" height="6" fill="#222"/>
            <rect x="70" y="55" width="6" height="6" fill="#222"/>
            <rect x="80" y="55" width="6" height="6" fill="#222"/>
            <rect x="60" y="65" width="6" height="6" fill="#222"/>
            <rect x="80" y="65" width="6" height="6" fill="#222"/>
            <rect x="60" y="75" width="6" height="6" fill="#222"/>
            <rect x="70" y="75" width="6" height="6" fill="#222"/>
            <rect x="80" y="75" width="6" height="6" fill="#222"/>
            <rect x="60" y="85" width="6" height="6" fill="#222"/>
            <rect x="80" y="85" width="6" height="6" fill="#222"/>
            <rect x="45" y="10" width="6" height="6" fill="#222"/>
            <rect x="45" y="22" width="6" height="6" fill="#222"/>
            <rect x="45" y="34" width="6" height="6" fill="#222"/>
            <rect x="45" y="46" width="6" height="6" fill="#222"/>
            <rect x="33" y="46" width="6" height="6" fill="#222"/>
            <rect x="45" y="58" width="6" height="6" fill="#222"/>
            <rect x="45" y="70" width="6" height="6" fill="#222"/>
            <rect x="45" y="82" width="6" height="6" fill="#222"/>
          </svg>
        </div>
        <p className="text-xs text-zinc-500 text-center">Open {label} app → Scan QR → Confirm payment</p>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalPrice, restaurantId, restaurantName, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const createOrder = useCreateOrder();
  const [step, setStep] = useState<"details" | "payment">("details");
  const [deliveryData, setDeliveryData] = useState<CheckoutFormValues | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || "",
      customerPhone: "",
      deliveryAddress: "",
    },
  });

  useEffect(() => {
    if (user?.name && !form.getValues().customerName) {
      form.setValue("customerName", user.name);
    }
  }, [user, form]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) setLocation("/login");
    else if (user.role !== "customer") setLocation("/");
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || !user || user.role !== "customer") {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">Checking your account…</p>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
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

  const onDeliverySubmit = (data: CheckoutFormValues) => {
    setDeliveryData(data);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPlaceOrder = async () => {
    if (!restaurantId || !deliveryData) return;
    try {
      const order = await createOrder.mutateAsync({
        data: {
          restaurantId,
          items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          ...deliveryData,
        }
      });
      toast.success("Order placed successfully! 🎉");
      clearCart();
      setLocation(`/order/${order.id}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment)!;

  const stepNum = step === "details" ? 1 : 2;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <Navbar />

      {/* Progress Header */}
      <div className="bg-white border-b border-zinc-100 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all",
                stepNum >= 1 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-500"
              )}>
                {stepNum > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <span className={cn(
                "text-sm font-bold hidden sm:inline",
                stepNum >= 1 ? "text-primary" : "text-zinc-400"
              )}>Delivery</span>
            </div>
            <div className={cn("flex-1 h-1 rounded-full mx-1 transition-all", stepNum > 1 ? "bg-primary" : "bg-zinc-200")} />
            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all",
                stepNum >= 2 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-500"
              )}>2</div>
              <span className={cn("text-sm font-bold hidden sm:inline", stepNum >= 2 ? "text-primary" : "text-zinc-400")}>
                Payment
              </span>
            </div>
            <div className="flex-1 h-1 rounded-full bg-zinc-200 mx-1" />
            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-black">3</div>
              <span className="text-sm font-bold text-zinc-400 hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          {step === "details" ? (
            <Link href={restaurantId ? `/restaurant/${restaurantId}` : "/restaurants"} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 text-sm font-bold uppercase tracking-wider transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to menu
            </Link>
          ) : (
            <button onClick={() => setStep("details")} className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 text-sm font-bold uppercase tracking-wider transition-colors">
              <ArrowLeft className="w-4 h-4" /> Edit Delivery Details
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT: Form Area */}
          <div className="lg:col-span-3">

            {/* ── STEP 1: Delivery Details ── */}
            {step === "details" && (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <h2 className="font-display font-black text-2xl mb-1">Delivery Details</h2>
                <p className="text-zinc-500 text-sm mb-6">Where should we bring your order?</p>

                <Card className="rounded-2xl border border-zinc-100 shadow-sm">
                  <CardContent className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onDeliverySubmit)} className="space-y-5">
                        <FormField control={form.control} name="customerName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 font-bold text-sm">
                              <User className="w-4 h-4 text-primary" /> Full Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-12 rounded-xl border-zinc-200 focus:border-primary" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="customerPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 font-bold text-sm">
                              <Phone className="w-4 h-4 text-primary" /> Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="012 345 678" className="h-12 rounded-xl border-zinc-200 focus:border-primary" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 font-bold text-sm">
                              <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Street 123, House 45, Phnom Penh" className="h-12 rounded-xl border-zinc-200 focus:border-primary" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="pt-2">
                          <Button type="submit" size="lg" className="w-full h-13 text-base font-black rounded-xl gap-2">
                            Continue to Payment <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── STEP 2: Payment Method ── */}
            {step === "payment" && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <h2 className="font-display font-black text-2xl mb-1">Choose Payment</h2>
                <p className="text-zinc-500 text-sm mb-6">Pick your favourite way to pay 💳</p>

                {/* Delivery summary pill */}
                {deliveryData && (
                  <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-2xl p-3 mb-5 shadow-sm">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Delivering to</p>
                      <p className="text-sm font-bold text-zinc-800 truncate">{deliveryData.deliveryAddress}</p>
                    </div>
                    <button onClick={() => setStep("details")} className="text-xs font-bold text-primary ml-auto shrink-0 hover:underline">Edit</button>
                  </div>
                )}

                {/* Payment method grid */}
                <div className="space-y-3 mb-5">
                  {PAYMENT_METHODS.map(method => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      selected={selectedPayment === method.id}
                      onSelect={() => setSelectedPayment(method.id)}
                    />
                  ))}
                </div>

                {/* Extra UI per payment type */}
                {selectedPayment === "card" && <CardPaymentForm />}
                {selectedPayment === "aba" && <QRCodePlaceholder label="ABA Mobile" color="bg-red-50 border-red-200" />}
                {selectedPayment === "acleda" && <QRCodePlaceholder label="ACleda Unity" color="bg-blue-50 border-blue-200" />}
                {selectedPayment === "paypal" && <QRCodePlaceholder label="PayPal" color="bg-sky-50 border-sky-200" />}
                {selectedPayment === "wing" && <QRCodePlaceholder label="Wing Money" color="bg-orange-50 border-orange-200" />}

                {/* Place Order */}
                <div className="mt-6">
                  <Button
                    onClick={onPlaceOrder}
                    disabled={createOrder.isPending}
                    size="lg"
                    className="w-full h-14 text-base font-black rounded-2xl gap-2 shadow-lg"
                  >
                    {createOrder.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay ${totalPrice.toFixed(2)} · {selectedMethod.label}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-zinc-400 mt-3 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3" /> Secured & encrypted · 24/7 support
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-bold text-xl mb-4">Order Summary</h2>

            <Card className="rounded-2xl overflow-hidden border-0 shadow-md">
              {/* Dark header */}
              <div className="bg-zinc-900 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">{restaurantName}</p>
                    <p className="text-zinc-400 text-xs">Free delivery · Always open</p>
                  </div>
                </div>
              </div>

              <CardContent className="bg-zinc-950 p-5">
                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.cartKey} className="flex justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        <span className="font-black text-primary shrink-0 text-sm">{item.quantity}×</span>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-200 text-sm truncate">{item.name}</p>
                          {item.optionName && (
                            <p className="text-xs text-zinc-500">{item.optionName}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-300 shrink-0 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-zinc-800 mb-4" />

                <div className="space-y-2.5 text-sm mb-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wide text-xs">FREE</span>
                  </div>
                  {step === "payment" && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Payment</span>
                      <span className="text-zinc-300 font-semibold text-xs">{selectedMethod.label}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-zinc-800 mb-4" />

                <div className="flex justify-between items-center">
                  <span className="font-black text-white text-base">Total</span>
                  <span className="font-black text-primary text-xl">${totalPrice.toFixed(2)}</span>
                </div>

                {/* Trust badges */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900 rounded-xl p-2.5 text-center">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-zinc-400">24/7 Delivery</p>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-2.5 text-center">
                    <Banknote className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-zinc-400">Free Delivery</p>
                  </div>
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
