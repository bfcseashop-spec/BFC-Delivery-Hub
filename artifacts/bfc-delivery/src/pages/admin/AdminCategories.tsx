import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useListRestaurants, getListRestaurantsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FolderOpen, Search, Store, Check, X } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function adminApi(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

interface RestaurantCategory { id: number; restaurantId: number; name: string; displayOrder: number; }
interface MenuSection { category: string; items: unknown[]; }

export default function AdminCategories() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const { data: restaurants = [] } = useListRestaurants(
    {},
    { query: { queryKey: getListRestaurantsQueryKey({}) } }
  );
  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  const categoriesKey = ["admin-categories-page", selectedRestaurantId];
  const menuKey = ["admin-menu-for-cats", selectedRestaurantId];

  const { data: categories = [], isLoading: isCatsLoading } = useQuery<RestaurantCategory[]>({
    queryKey: categoriesKey,
    queryFn: async () => {
      if (!selectedRestaurantId) return [];
      const r = await adminApi(`/admin/restaurants/${selectedRestaurantId}/categories`);
      return r.ok ? r.json() : [];
    },
    enabled: !!selectedRestaurantId,
  });

  const { data: menuSections = [] } = useQuery<MenuSection[]>({
    queryKey: menuKey,
    queryFn: async () => {
      if (!selectedRestaurantId) return [];
      const r = await adminApi(`/restaurants/${selectedRestaurantId}/menu`);
      return r.ok ? r.json() : [];
    },
    enabled: !!selectedRestaurantId,
  });

  const itemCountMap: Record<string, number> = {};
  for (const s of menuSections) {
    itemCountMap[s.category] = s.items.length;
  }

  const filtered = categories.filter(c =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const r = await adminApi(`/admin/restaurants/${selectedRestaurantId}/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Failed to add category"); }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      setNewCategoryName("");
      setAddingCategory(false);
      toast({ title: "Category added" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (cat: RestaurantCategory) => {
      const r = await adminApi(`/admin/restaurants/${selectedRestaurantId}/categories/${cat.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      qc.invalidateQueries({ queryKey: menuKey });
      toast({ title: "Category deleted" });
    },
    onError: () => toast({ title: "Failed to delete category", variant: "destructive" }),
  });

  function handleAdd() {
    const name = newCategoryName.trim();
    if (!name) return;
    addMutation.mutate(name);
  }

  return (
    <AdminLayout title="Restaurant Categories">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Restaurant Selector */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Select Restaurant</h2>
              <p className="text-xs text-zinc-500">Choose a restaurant to manage its menu categories</p>
            </div>
          </div>
          <select
            className="w-full text-sm rounded-xl border border-zinc-200 px-4 py-2.5 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            value={selectedRestaurantId ?? ""}
            onChange={e => setSelectedRestaurantId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">— Choose a restaurant —</option>
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {/* Category List */}
        {selectedRestaurantId ? (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-900">{selectedRestaurant?.name ?? ""}</h2>
                  <p className="text-xs text-zinc-500">{categories.length} categories</p>
                </div>
              </div>
              <button
                onClick={() => { setAddingCategory(true); setNewCategoryName(""); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition"
                style={{ backgroundColor: "#E8472A" }}
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {/* Add Category Inline Row */}
            {addingCategory && (
              <div className="px-6 py-3 border-b border-zinc-100 bg-primary/5 flex items-center gap-3">
                <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                <Input
                  autoFocus
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") { setAddingCategory(false); setNewCategoryName(""); }
                  }}
                  placeholder="New category name (e.g. Main Dishes, Starters…)"
                  className="flex-1 h-9 text-sm border-zinc-200"
                />
                <Button
                  size="sm"
                  className="h-9 gap-1.5 shrink-0"
                  style={{ backgroundColor: "#E8472A" }}
                  onClick={handleAdd}
                  disabled={!newCategoryName.trim() || addMutation.isPending}
                >
                  <Check className="w-3.5 h-3.5" />
                  {addMutation.isPending ? "Adding…" : "Add"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 shrink-0"
                  onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* Search */}
            <div className="px-6 py-3 border-b border-zinc-100">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Search categories…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-zinc-50 border-zinc-200"
                />
              </div>
            </div>

            {/* Category rows */}
            {isCatsLoading ? (
              <div className="py-16 text-center text-sm text-zinc-400">Loading categories…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FolderOpen className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-500">
                  {search ? "No categories match your search." : "No categories yet."}
                </p>
                {!search && (
                  <p className="text-xs text-zinc-400 mt-1">Click "Add Category" to create the first one.</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {filtered.map((cat, idx) => {
                  const itemCount = itemCountMap[cat.name] ?? 0;
                  return (
                    <li key={cat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition group">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-500 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 truncate">{cat.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Display order: {cat.displayOrder}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 font-bold text-xs px-2.5 py-1 ${itemCount > 0 ? "bg-primary/10 text-primary border-0" : "bg-zinc-100 text-zinc-400"}`}
                      >
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the category. Menu items in this category will remain but become uncategorized.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(cat)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="font-bold text-zinc-900 mb-1">No restaurant selected</h3>
            <p className="text-sm text-zinc-500">Choose a restaurant above to view and manage its categories.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
