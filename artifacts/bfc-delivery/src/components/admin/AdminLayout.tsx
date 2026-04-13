import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Store, ClipboardList, UtensilsCrossed, LogOut,
  LayoutTemplate, Handshake, Users, ChevronRight, FolderOpen,
} from "lucide-react";
import { useEffect } from "react";

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: "/admin/orders", label: "Orders", icon: <ClipboardList className="w-4 h-4" /> },
    ],
  },
  {
    title: "Restaurant Ops",
    items: [
      { href: "/admin/restaurants", label: "Restaurants", icon: <Store className="w-4 h-4" /> },
      { href: "/admin/menu-items", label: "Menu Items", icon: <UtensilsCrossed className="w-4 h-4" /> },
      { href: "/admin/categories", label: "Categories", icon: <FolderOpen className="w-4 h-4" /> },
    ],
  },
  {
    title: "Partnerships",
    items: [
      { href: "/admin/partners", label: "Partner Management", icon: <Handshake className="w-4 h-4" /> },
      { href: "/admin/customers", label: "Customers", icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/landing-page", label: "Landing Page", icon: <LayoutTemplate className="w-4 h-4" /> },
    ],
  },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) setLocation("/login");
      else if (user.role !== "admin") setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user || user.role !== "admin") return null;

  function isActive(href: string) {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  }

  return (
    <div className="min-h-screen flex bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-zinc-100 flex flex-col fixed h-full z-10 border-r border-zinc-800">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <Link href="/admin">
            <span className="font-display font-black text-xl text-white tracking-tight cursor-pointer">
              BFC <span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                          active
                            ? "bg-primary text-white shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        <span className={active ? "text-white" : "text-zinc-500 group-hover:text-white"}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" className="w-full justify-start" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b flex items-center px-8 shrink-0 sticky top-0 z-10 shadow-sm">
          <h1 className="font-display font-bold text-xl">{title}</h1>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
