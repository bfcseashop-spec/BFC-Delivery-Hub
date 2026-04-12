import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, ClipboardList, UtensilsCrossed, LogOut } from "lucide-react";
import { useEffect } from "react";

export function AdminLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) setLocation("/login");
      else if (user.role !== "admin") setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-zinc-100 flex flex-col fixed h-full z-10 border-r border-zinc-800">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <Link href="/admin">
            <span className="font-display font-black text-xl text-white tracking-tight cursor-pointer">
              BFC <span className="text-primary">Admin</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium">
              <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium">
              <ClipboardList className="w-4 h-4 mr-3" /> Orders
            </Button>
          </Link>
          <Link href="/admin/restaurants">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium">
              <Store className="w-4 h-4 mr-3" /> Restaurants
            </Button>
          </Link>
          <Link href="/admin/menu-items">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium">
              <UtensilsCrossed className="w-4 h-4 mr-3" /> Menu Items
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-800 shrink-0">
          <div className="mb-4 px-2">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          </div>
          <Button variant="destructive" className="w-full justify-start" onClick={() => logout()}>
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
