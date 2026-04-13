import { useState, useMemo, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, Star, FolderPlus, X, Check, ListOrdered, ImagePlus, Upload, Image } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

interface RestaurantCategory { id: number; restaurantId: number; name: string; displayOrder: number; }
interface MenuItem { id: number; restaurantId: number; name: string; description: string; price: number; imageUrl: string; images?: string; category: string; isAvailable: boolean; isPopular: boolean; }
interface MenuSection { category: string; items: MenuItem[]; }
interface MenuItemOption { id: number; menuItemId: number; name: string; price: number; displayOrder: number; }

const EMPTY_FORM = { name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true, isPopular: false };
const EMPTY_OPTION = { name: "", price: "" };

function parseImages(raw: string | null | undefined): string[] {
  try { return JSON.parse(raw || "[]") || []; } catch { return raw ? [raw] : []; }
}

export default function PartnerMenu() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [pendingOptions, setPendingOptions] = useState<{ name: string; price: string }[]>([]);
  const [newOption, setNewOption] = useState(EMPTY_OPTION);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const menuGroupedKey = ["partner-menu-grouped", partnerId];
  const categoriesKey = ["partner-categories", partnerId];
  const itemOptionsKey = (id: number | null) => ["partner-item-options", id];

  // Partner info (to get restaurant name)
  const { data: partnerInfo } = useQuery<{ partner: { id: number; businessName: string }; restaurant: { id: number; name: string } | null }>({
    queryKey: ["partner-info", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}`); return r.ok ? r.json() : null; },
  });

  const restaurantName = partnerInfo?.restaurant?.name ?? partnerInfo?.partner?.businessName ?? "";

  const { data: menuSections = [], isLoading: isMenuLoading } = useQuery<MenuSection[]>({
    queryKey: menuGroupedKey,
    queryFn: async () => { const r = await api(`/partner/${partnerId}/menu/grouped`); return r.ok ? r.json() : []; },
  });

  const { data: categories = [], isLoading: isCatsLoading } = useQuery<RestaurantCategory[]>({
    queryKey: categoriesKey,
    queryFn: async () => { const r = await api(`/partner/${partnerId}/categories`); return r.ok ? r.json() : []; },
  });

  const { data: existingOptions = [] } = useQuery<MenuItemOption[]>({
    queryKey: itemOptionsKey(editing?.id ?? null),
    queryFn: async () => {
      if (!editing) return [];
      const r = await api(`/partner/${partnerId}/menu/items/${editing.id}/options`);
      return r.ok ? r.json() : [];
    },
    enabled: !!editing,
  });

  const allItems: MenuItem[] = useMemo(() => menuSections.flatMap(s => s.items), [menuSections]);

  const visibleItems = useMemo(() => {
    let items = selectedCategory
      ? (menuSections.find(s => s.category === selectedCategory)?.items ?? [])
      : allItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    return items;
  }, [allItems, menuSections, selectedCategory, searchQuery]);

  const itemCategoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of menuSections) map[s.category] = s.items.length;
    return map;
  }, [menuSections]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: selectedCategory ?? "" });
    setImagesList([]);
    setUrlInput("");
    setPendingOptions([]);
    setNewOption(EMPTY_OPTION);
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({ name: item.name, description: item.description, price: String(item.price), category: item.category, imageUrl: item.imageUrl, isAvailable: item.isAvailable, isPopular: item.isPopular });
    const imgs = parseImages(item.images);
    setImagesList(item.imageUrl ? [item.imageUrl, ...imgs.filter(u => u !== item.imageUrl)] : imgs);
    setUrlInput("");
    setPendingOptions([]);
    setNewOption(EMPTY_OPTION);
    setDialogOpen(true);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const r = await api(`/partner/${partnerId}/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Failed"); }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      setAddingCategory(false); setNewCategoryName("");
      toast({ title: "Category added" });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (cat: RestaurantCategory) =>
      api(`/partner/${partnerId}/categories/${cat.id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      if (selectedCategory) setSelectedCategory(null);
    },
    onError: () => toast({ title: "Failed to delete category", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const primaryImage = imagesList[0] || form.imageUrl || "";
      const body = {
        name: form.name, description: form.description, price: parseFloat(form.price) || 0,
        category: form.category, imageUrl: primaryImage,
        images: JSON.stringify(imagesList),
        isAvailable: form.isAvailable, isPopular: form.isPopular,
      };
      let itemId: number;
      if (editing) {
        const r = await api(`/partner/${partnerId}/menu/items/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error("Failed to update");
        const item = await r.json();
        itemId = item.id;
      } else {
        const r = await api(`/partner/${partnerId}/menu/items`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error("Failed to create");
        const item = await r.json();
        itemId = item.id;
      }
      for (const opt of pendingOptions) {
        await api(`/partner/${partnerId}/menu/items/${itemId}/options`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: opt.name, price: parseFloat(opt.price) || 0 }),
        });
      }
      return itemId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuGroupedKey });
      if (editing) qc.invalidateQueries({ queryKey: itemOptionsKey(editing.id) });
      setDialogOpen(false);
      toast({ title: editing ? "Item updated" : "Item added" });
    },
    onError: () => toast({ title: "Failed to save item", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: MenuItem) =>
      api(`/partner/${partnerId}/menu/items/${item.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: menuGroupedKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api(`/partner/${partnerId}/menu/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menuGroupedKey });
      toast({ title: "Item deleted" });
    },
    onError: () => toast({ title: "Failed to delete item", variant: "destructive" }),
  });

  const addExistingOptionMutation = useMutation({
    mutationFn: (opt: { name: string; price: number }) =>
      api(`/partner/${partnerId}/menu/items/${editing!.id}/options`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opt),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemOptionsKey(editing?.id ?? null) });
      setNewOption(EMPTY_OPTION);
    },
    onError: () => toast({ title: "Failed to add option", variant: "destructive" }),
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: number) => api(`/partner/${partnerId}/menu-item-options/${optionId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemOptionsKey(editing?.id ?? null) }),
    onError: () => toast({ title: "Failed to delete option", variant: "destructive" }),
  });

  // ── Image helpers ─────────────────────────────────────────────────────────

  async function uploadImageFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("image", file);
    const r = await api(`/partner/${partnerId}/upload`, { method: "POST", body: fd });
    if (!r.ok) { toast({ title: "Upload failed", variant: "destructive" }); return null; }
    const { url } = await r.json();
    return url as string;
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      setUploadingIdx(i);
      const url = await uploadImageFile(files[i]);
      if (url) setImagesList(prev => [...prev, url]);
    }
    setUploadingIdx(null);
  }

  function addUrlToList() {
    const u = urlInput.trim();
    if (!u) return;
    setImagesList(prev => [...prev, u]);
    setUrlInput("");
  }

  function removeImage(idx: number) {
    setImagesList(prev => prev.filter((_, i) => i !== idx));
  }

  function setPrimary(idx: number) {
    setImagesList(prev => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }

  function addPendingOption() {
    if (!newOption.name.trim()) return;
    setPendingOptions(p => [...p, { name: newOption.name.trim(), price: newOption.price }]);
    setNewOption(EMPTY_OPTION);
  }

  function addOptionToExisting() {
    if (!newOption.name.trim() || !editing) return;
    addExistingOptionMutation.mutate({ name: newOption.name.trim(), price: parseFloat(newOption.price) || 0 });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PartnerLayout title="Menu">
      <div className="flex gap-0 h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-zinc-200 bg-white">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-64 shrink-0 border-r border-zinc-200 flex flex-col">
          <div className="p-4 border-b border-zinc-100">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Restaurant</p>
            <p className="text-sm font-bold text-zinc-900 truncate">{restaurantName || "Loading…"}</p>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            {isCatsLoading ? (
              <div className="p-4 text-sm text-zinc-400">Loading…</div>
            ) : (
              <ul className="py-2 flex-1">
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
                {categories.map(cat => (
                  <li key={cat.id} className="group relative">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedCategory(cat.name)}
                      onKeyDown={e => e.key === "Enter" && setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition cursor-pointer hover:bg-zinc-50 ${selectedCategory === cat.name ? "text-primary border-r-2 border-primary bg-primary/5" : "text-zinc-700"}`}
                    >
                      <span className="truncate text-left flex-1 pr-10">{cat.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${selectedCategory === cat.name ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500"}`}>
                        {itemCategoryMap[cat.name] ?? 0}
                      </span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteCategoryMutation.mutate(cat); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-red-500 p-1 rounded"
                      title="Delete category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-zinc-100 p-3">
              {addingCategory ? (
                <div className="flex gap-1">
                  <Input
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") addCategoryMutation.mutate(newCategoryName);
                      if (e.key === "Escape") { setAddingCategory(false); setNewCategoryName(""); }
                    }}
                    placeholder="Category name..."
                    className="h-8 text-xs"
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0" style={{ backgroundColor: "#E8472A" }}
                    onClick={() => addCategoryMutation.mutate(newCategoryName)}
                    disabled={!newCategoryName.trim() || addCategoryMutation.isPending}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCategory(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-zinc-500 hover:text-primary hover:bg-primary/5 rounded-lg transition"
                >
                  <FolderPlus className="w-3.5 h-3.5" /> Add Category
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="font-black text-zinc-900 text-lg">{selectedCategory ?? "All Items"}</h2>
                <p className="text-xs text-zinc-500">
                  {visibleItems.length} item{visibleItems.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button onClick={openCreate} style={{ backgroundColor: "#E8472A" }} className="text-white font-bold gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            {/* Search */}
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
                <div className="flex items-center justify-center py-16 text-zinc-400">Loading menu…</div>
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
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-zinc-300"><UtensilsCrossed className="w-6 h-6" /></div>
                        }
                      </div>
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
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">{item.isAvailable ? "Available" : "Off"}</span>
                          <Switch checked={item.isAvailable} onCheckedChange={() => toggleMutation.mutate(item)} />
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
                              <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
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
                <Input
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Main Dishes"
                  list="partner-category-suggestions"
                />
                <datalist id="partner-category-suggestions">
                  {categories.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>

              {/* Multi-image upload */}
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary" />
                  <Label className="font-bold">Product Images</Label>
                  <span className="text-xs text-zinc-400">({imagesList.length} image{imagesList.length !== 1 ? "s" : ""} · first is primary)</span>
                </div>

                {imagesList.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imagesList.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border-2 aspect-square bg-zinc-100" style={{ borderColor: idx === 0 ? "#E8472A" : "transparent" }}>
                        <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = ""; }} />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">PRIMARY</span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                          {idx !== 0 && (
                            <button type="button" onClick={() => setPrimary(idx)} className="text-[10px] font-bold bg-primary text-white px-2 py-1 rounded-full hover:bg-primary/90 transition">
                              Set Primary
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(idx)} className="text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600 transition flex items-center gap-1">
                            <X className="w-2.5 h-2.5" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                      {uploadingIdx !== null ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><ImagePlus className="w-5 h-5 text-zinc-400 mb-1" /><span className="text-[10px] text-zinc-400 font-bold">Add</span></>
                      )}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                    </label>
                  </div>
                )}

                {imagesList.length === 0 && (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                    {uploadingIdx !== null ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-zinc-500">Uploading…</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-zinc-400 mb-1" />
                        <span className="text-sm font-bold text-zinc-500">Click to upload images</span>
                        <span className="text-xs text-zinc-400">JPG, PNG, WebP · max 5MB each · multiple allowed</span>
                      </>
                    )}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                  </label>
                )}

                <div className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrlToList(); } }}
                    placeholder="Or paste an image URL and press Add →"
                    className="flex-1 h-9 text-sm"
                  />
                  <Button type="button" size="sm" variant="outline" className="h-9 shrink-0 gap-1 border-primary text-primary hover:bg-primary hover:text-white" onClick={addUrlToList} disabled={!urlInput.trim()}>
                    <Plus className="w-3.5 h-3.5" /> Add URL
                  </Button>
                </div>
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

            {/* Options Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ListOrdered className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-zinc-800">Size Options</span>
                <span className="text-xs text-zinc-400">(e.g. Small, Medium, Large)</span>
              </div>

              {editing && existingOptions.length > 0 && (
                <div className="space-y-2 mb-3">
                  {existingOptions.map(opt => (
                    <div key={opt.id} className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm font-semibold text-zinc-700">{opt.name}</span>
                      <span className="text-sm font-black text-primary">${opt.price.toFixed(2)}</span>
                      <button onClick={() => deleteOptionMutation.mutate(opt.id)} className="text-zinc-400 hover:text-red-500 transition p-0.5 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!editing && pendingOptions.length > 0 && (
                <div className="space-y-2 mb-3">
                  {pendingOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm font-semibold text-zinc-700">{opt.name}</span>
                      <span className="text-sm font-black text-primary">${(parseFloat(opt.price) || 0).toFixed(2)}</span>
                      <button onClick={() => setPendingOptions(p => p.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-red-500 transition p-0.5 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newOption.name}
                  onChange={e => setNewOption(o => ({ ...o, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); editing ? addOptionToExisting() : addPendingOption(); } }}
                  placeholder="Option name (e.g. Small)"
                  className="flex-1 h-9 text-sm"
                />
                <Input
                  type="number" min="0" step="0.01"
                  value={newOption.price}
                  onChange={e => setNewOption(o => ({ ...o, price: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); editing ? addOptionToExisting() : addPendingOption(); } }}
                  placeholder="Price"
                  className="w-24 h-9 text-sm"
                />
                <Button
                  type="button" size="sm" variant="outline"
                  className="shrink-0 h-9 gap-1 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={editing ? addOptionToExisting : addPendingOption}
                  disabled={!newOption.name.trim()}
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">
                {editing ? "Options are saved immediately when added." : "Options will be saved along with the item."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name || !form.price || !form.category}
              style={{ backgroundColor: "#E8472A" }}
              className="text-white"
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PartnerLayout>
  );
}
