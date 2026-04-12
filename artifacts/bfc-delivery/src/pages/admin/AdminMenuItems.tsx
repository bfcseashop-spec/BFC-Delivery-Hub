import { useState, useMemo, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListRestaurants, getListRestaurantsQueryKey, useGetRestaurantMenu, getGetRestaurantMenuQueryKey } from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, ChevronRight, UtensilsCrossed, Star } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function adminApi(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

interface MenuItem {
  id: number; restaurantId: number; name: string; description: string;
  price: number; imageUrl: string; category: string;
  isAvailable: boolean; isPopular: boolean;
}

interface MenuSection { category: string; items: MenuItem[]; }

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true, isPopular: false,
};

export default function AdminMenuItems() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const params = new URLSearchParams(search);
  const urlRestaurantId = params.get("restaurant");

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(
    urlRestaurantId ? parseInt(urlRestaurantId) : null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: restaurants = [] } = useListRestaurants(
    {},
    { query: { queryKey: getListRestaurantsQueryKey({}) } }
  );

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  const { data: menuSections = [], isLoading: isMenuLoading } = useGetRestaurantMenu(
    selectedRestaurantId ?? 0,
    { query: { enabled: !!selectedRestaurantId, queryKey: getGetRestaurantMenuQueryKey(selectedRestaurantId ?? 0) } }
  ) as { data: MenuSection[]; isLoading: boolean };

  useEffect(() => {
    if (urlRestaurantId) {
      setSelectedRestaurantId(parseInt(urlRestaurantId));
    }
  }, [urlRestaurantId]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedRestaurantId]);

  const allItems: MenuItem[] = useMemo(() => menuSections.flatMap(s => s.items as MenuItem[]), [menuSections]);

  const visibleItems = useMemo(() => {
    let items = selectedCategory
      ? (menuSections.find(s => s.category === selectedCategory)?.items as MenuItem[] ?? [])
      : allItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }, [allItems, menuSections, selectedCategory, searchQuery]);

  function handleRestaurantChange(id: number) {
    setSelectedRestaurantId(id);
    setLocation(`/admin/menu-items?restaurant=${id}`);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: selectedCategory ?? "" });
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name, description: item.description, price: String(item.price),
      category: item.category, imageUrl: item.imageUrl,
      isAvailable: item.isAvailable, isPopular: item.isPopular,
    });
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name, description: form.description,
        price: parseFloat(form.price) || 0,
        category: form.category, imageUrl: form.imageUrl,
        isAvailable: form.isAvailable, isPopular: form.isPopular,
        restaurantId: selectedRestaurantId,
      };
      if (editing) {
        const res = await adminApi(`/admin/menu-items/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      } else {
        const res = await adminApi("/admin/menu-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        return res.json();
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetRestaurantMenuQueryKey(selectedRestaurantId ?? 0) });
      setDialogOpen(false);
      toast({ title: editing ? "Menu item updated" : "Menu item added" });
    },
    onError: () => toast({ title: "Failed to save item", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: MenuItem) =>
      adminApi(`/admin/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetRestaurantMenuQueryKey(selectedRestaurantId ?? 0) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi(`/admin/menu-items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetRestaurantMenuQueryKey(selectedRestaurantId ?? 0) });
      toast({ title: "Item deleted" });
    },
    onError: () => toast({ title: "Failed to delete item", variant: "destructive" }),
  });

  const categoryItemCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of menuSections) map[s.category] = (s.items as MenuItem[]).length;
    return map;
  }, [menuSections]);

  return (
    <AdminLayout title="Manage Menu Items">
      <div className="flex gap-0 h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-zinc-200 bg-white">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-64 shrink-0 border-r border-zinc-200 flex flex-col">
          {/* Restaurant selector */}
          <div className="p-4 border-b border-zinc-100">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Select Restaurant</label>
            <select
              className="w-full text-sm rounded-lg border border-zinc-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              value={selectedRestaurantId ?? ""}
              onChange={e => e.target.value ? handleRestaurantChange(parseInt(e.target.value)) : setSelectedRestaurantId(null)}
            >
              <option value="">— Choose a restaurant —</option>
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Category list */}
          <div className="flex-1 overflow-y-auto">
            {!selectedRestaurantId ? (
              <div className="p-4 text-sm text-zinc-400 text-center mt-4">
                Select a restaurant to view its menu categories.
              </div>
            ) : isMenuLoading ? (
              <div className="p-4 text-sm text-zinc-400">Loading...</div>
            ) : (
              <ul className="py-2">
                {/* All items */}
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50 ${!selectedCategory ? "text-primary border-r-2 border-primary bg-primary/5" : "text-zinc-700"}`}
                  >
                    <span>All Items</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${!selectedCategory ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      {allItems.length}
                    </span>
                  </button>
                </li>
                {/* Per-category */}
                {menuSections.map(section => (
                  <li key={section.category}>
                    <button
                      onClick={() => setSelectedCategory(section.category)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50 ${selectedCategory === section.category ? "text-primary border-r-2 border-primary bg-primary/5" : "text-zinc-700"}`}
                    >
                      <span className="truncate text-left">{section.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${selectedCategory === section.category ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"}`}>
                        {categoryItemCounts[section.category] ?? 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedRestaurantId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">No restaurant selected</h3>
              <p className="text-sm text-zinc-500">Choose a restaurant from the sidebar to manage its menu items.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <div>
                  <h2 className="font-black text-zinc-900 text-lg">{selectedRestaurant?.name ?? ""}</h2>
                  <p className="text-xs text-zinc-500">
                    {selectedCategory ? `${selectedCategory} — ` : ""}{visibleItems.length} item{visibleItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button onClick={openCreate} style={{ backgroundColor: "#E8472A" }} className="text-white font-bold gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>

              {/* Search bar */}
              <div className="px-6 py-3 border-b border-zinc-100 shrink-0">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto">
                {isMenuLoading ? (
                  <div className="flex items-center justify-center py-16 text-zinc-400">Loading menu...</div>
                ) : visibleItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <UtensilsCrossed className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No items found</p>
                    <p className="text-xs">Add your first item using the button above.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-100">
                    {visibleItems.map(item => (
                      <li key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition">
                        {/* Image */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                              <UtensilsCrossed className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-zinc-900 truncate">{item.name}</span>
                            {item.isPopular && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0 font-bold">
                                <Star className="w-2.5 h-2.5 mr-0.5" /> Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-black text-primary">${item.price.toFixed(2)}</span>
                            <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{item.category}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{item.isAvailable ? "Available" : "Off"}</span>
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() => toggleMutation.mutate(item)}
                            />
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(item)} className="h-8 w-8">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit "${editing.name}"` : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Item Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Beef Curry" />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the dish" />
              </div>
              <div>
                <Label>Price (USD) *</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Category *</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Main Dishes" list="category-suggestions" />
                <datalist id="category-suggestions">
                  {menuSections.map(s => <option key={s.category} value={s.category} />)}
                </datalist>
              </div>
              <div className="col-span-2">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="mt-2 h-20 w-32 object-cover rounded-lg border" onError={e => (e.currentTarget.style.display = "none")} />
                )}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isAvailable} onCheckedChange={v => setForm(f => ({ ...f, isAvailable: v }))} />
                <Label>Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isPopular} onCheckedChange={v => setForm(f => ({ ...f, isPopular: v }))} />
                <Label>Mark as Popular</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name || !form.price || !form.category}
              style={{ backgroundColor: "#E8472A" }}
            >
              {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
