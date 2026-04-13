import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, ShoppingBag, Star, TrendingUp, FileText,
  Megaphone, Tag, CreditCard, UtensilsCrossed, Clock, Settings,
  ArrowLeft, Store, ChevronRight, Award, LogOut, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavSection = { title: string; items: NavItem[] };

function buildNav(pid: string): NavSection[] {
  const p = `/partner/${pid}`;
  return [
    {
      title: "Monitor your performance",
      items: [
        { href: `${p}`, label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: `${p}/top-program`, label: "Top Restaurant Program", icon: <Award className="w-4 h-4" /> },
        { href: `${p}/orders`, label: "Order History", icon: <ShoppingBag className="w-4 h-4" /> },
        { href: `${p}/reviews`, label: "Reviews", icon: <Star className="w-4 h-4" /> },
        { href: `${p}/performance`, label: "Performance", icon: <TrendingUp className="w-4 h-4" /> },
        { href: `${p}/invoices`, label: "Invoices", icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      title: "Grow your business",
      items: [
        { href: `${p}/advertising`, label: "Advertising", icon: <Megaphone className="w-4 h-4" /> },
        { href: `${p}/promotions`, label: "Promotions", icon: <Tag className="w-4 h-4" /> },
      ],
    },
    {
      title: "Manage your business",
      items: [
        { href: `${p}/payments`, label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
        { href: `${p}/menu`, label: "Menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
        { href: `${p}/opening-times`, label: "Opening Times", icon: <Clock className="w-4 h-4" /> },
        { href: `${p}/settings`, label: "Settings", icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];
}

export function PartnerLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const params = useParams<{ partnerId: string }>();
  const partnerId = params.partnerId;
  const [location, setLocation] = useLocation();

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["partner-me"],
    queryFn: async () => {
      const r = await api("/partner/me");
      if (!r.ok) return null;
      return r.json() as Promise<{ role: "admin" | "partner"; partnerId?: number; businessName?: string; name?: string } | null>;
    },
    retry: false,
    staleTime: 30_000,
  });

  const { data } = useQuery({
    queryKey: ["partner-info", partnerId],
    queryFn: async () => {
      const r = await api(`/partner/${partnerId}`);
      if (!r.ok) return null;
      return r.json() as Promise<{ partner: { name: string; businessName: string; commissionRate: number; username?: string }; restaurant: { name: string; id: number } | null }>;
    },
    enabled: !!partnerId && !!me,
  });

  useEffect(() => {
    if (!meLoading && !me) {
      setLocation(`/partner/login`);
    }
    if (!meLoading && me?.role === "partner" && me.partnerId && String(me.partnerId) !== partnerId) {
      setLocation(`/partner/${me.partnerId}`);
    }
  }, [me, meLoading, partnerId, setLocation]);

  const isAdmin = me?.role === "admin";
  const nav = buildNav(partnerId ?? "");

  async function handleLogout() {
    await api("/partner/logout", { method: "POST" });
    toast.success("Logged out");
    setLocation("/partner/login");
  }

  function isActive(href: string) {
    if (href === `/partner/${partnerId}`) {
      return location === href || location === `${BASE}${href}`;
    }
    return location.startsWith(href) || location.startsWith(`${BASE}${href}`);
  }

  if (meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 flex flex-col fixed h-full z-10 border-r border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          {/* Brand */}
          <div className="h-14 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-black">B</span>
              </div>
              <span className="font-black text-sm text-foreground">BFC Partner</span>
            </div>
            {isAdmin ? (
              <Link href="/admin/partners">
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            )}
          </div>

          {/* Store Switcher */}
          <div className="px-4 pb-3">
            <Select defaultValue={data?.restaurant ? String(data.restaurant.id) : "all"}>
              <SelectTrigger className="h-9 text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stores</SelectItem>
                {data?.restaurant && (
                  <SelectItem value={String(data.restaurant.id)}>{data.restaurant.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {nav.map(section => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white font-medium"
                        }`}
                      >
                        <span className={active ? "text-primary" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {active && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60" />}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Partner Info Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {data?.partner.businessName?.charAt(0) ?? "P"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{data?.partner.businessName ?? "Partner"}</p>
              <p className="text-[10px] text-muted-foreground">
                {isAdmin ? "Admin view" : `${data?.partner.commissionRate ?? 15}% commission`}
              </p>
            </div>
            {!isAdmin && (
              <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition-colors" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-8 shrink-0 sticky top-0 z-10">
          <h1 className="font-bold text-lg">{title}</h1>
          {isAdmin && (
            <span className="ml-3 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              Admin View
            </span>
          )}
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
