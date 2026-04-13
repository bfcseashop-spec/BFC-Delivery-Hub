import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListRestaurants, getListRestaurantsQueryKey, useAdminCreateRestaurant, useAdminUpdateRestaurant, useAdminDeleteRestaurant, useListCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Loader2, Search, UtensilsCrossed, Upload, X, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function api(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

type FormState = {
  name: string;
  description: string;
  imageUrl: string;
  deliveryTime: string;
  minimumOrder: string;
  categoryId: string;
  categoryName: string;
  address: string;
  isOpen: boolean;
  isFeatured: boolean;
  rating: string;
};

const DEFAULT_FORM: FormState = {
  name: "",
  description: "",
  imageUrl: "",
  deliveryTime: "20-30 min",
  minimumOrder: "5",
  categoryId: "",
  categoryName: "",
  address: "",
  isOpen: true,
  isFeatured: false,
  rating: "4.5",
};

interface Restaurant {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  minimumOrder: number;
  categoryId: number;
  categoryName: string;
  address: string;
  isOpen: boolean;
  isFeatured: boolean;
}

function RestaurantDialog({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: Restaurant | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: categories = [] } = useListCategories();

  // Populate form when dialog opens
  const initForm = useCallback((r: Restaurant | null) => {
    if (r) {
      setForm({
        name: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        deliveryTime: r.deliveryTime,
        minimumOrder: String(r.minimumOrder),
        categoryId: String(r.categoryId),
        categoryName: r.categoryName,
        address: r.address,
        isOpen: r.isOpen,
        isFeatured: r.isFeatured,
        rating: String(r.rating),
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, []);

  const createMut = useAdminCreateRestaurant({
    mutation: {
      onSuccess: () => { toast.success("Restaurant created"); onSaved(); },
      onError: () => toast.error("Failed to create restaurant"),
    },
  });

  const updateMut = useAdminUpdateRestaurant({
    mutation: {
      onSuccess: () => { toast.success("Restaurant updated"); onSaved(); },
      onError: () => toast.error("Failed to update restaurant"),
    },
  });

  const isSaving = createMut.isPending || updateMut.isPending;

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await api("/admin/upload", { method: "POST", body: fd });
      if (!r.ok) throw new Error("Upload failed");
      const data = await r.json();
      setForm(f => ({ ...f, imageUrl: `${BASE}${data.url}` }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.categoryId) { toast.error("Category is required"); return; }
    if (!form.address.trim()) { toast.error("Address is required"); return; }

    const cat = (categories as Array<{ id: number; name: string }>).find(c => String(c.id) === form.categoryId);
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      deliveryTime: form.deliveryTime.trim() || "20-30 min",
      minimumOrder: parseFloat(form.minimumOrder) || 5,
      categoryId: parseInt(form.categoryId),
      categoryName: cat?.name ?? form.categoryName,
      address: form.address.trim(),
      isOpen: form.isOpen,
      isFeatured: form.isFeatured,
      rating: parseFloat(form.rating) || 4.5,
    };

    if (editing) {
      updateMut.mutate({ restaurantId: editing.id, data: body });
    } else {
      createMut.mutate({ data: body });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (v) initForm(editing);
        else onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Restaurant" : "Add Restaurant"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Image */}
          <div className="space-y-2">
            <Label>Restaurant Image</Label>
            <div className="flex items-start gap-3">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                    Upload
                  </Button>
                  {form.imageUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </div>
            </div>
          </div>

          {/* Name & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Restaurant name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Address <span className="text-red-500">*</span></Label>
              <Input placeholder="Phnom Penh, Cambodia" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Short description about this restaurant…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {/* Category & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories as Array<{ id: number; name: string; icon?: string }>).map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delivery Time</Label>
              <Input placeholder="20-30 min" value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Min. Order ($)</Label>
              <Input type="number" min="0" step="0.5" placeholder="5" value={form.minimumOrder} onChange={e => setForm(f => ({ ...f, minimumOrder: e.target.value }))} />
            </div>
          </div>

          {/* Rating & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Rating (0–5)</Label>
              <Input type="number" min="0" max="5" step="0.1" placeholder="4.5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Switch checked={form.isOpen} onCheckedChange={v => setForm(f => ({ ...f, isOpen: v }))} id="isOpen" />
              <Label htmlFor="isOpen" className="cursor-pointer">{form.isOpen ? "Currently Open" : "Currently Closed"}</Label>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} id="isFeatured" />
              <Label htmlFor="isFeatured" className="cursor-pointer">Featured</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || uploading}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editing ? "Save Changes" : "Create Restaurant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminRestaurants() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);

  const { data: restaurants, isLoading } = useListRestaurants(
    { search: search || undefined },
    { query: { queryKey: getListRestaurantsQueryKey({ search: search || undefined }) } }
  );

  const deleteMut = useAdminDeleteRestaurant({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
        toast.success("Restaurant deleted");
      },
      onError: () => toast.error("Failed to delete restaurant"),
    },
  });

  const updateMut = useAdminUpdateRestaurant({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() }),
      onError: () => toast.error("Failed to update"),
    },
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(r: Restaurant) {
    setEditing(r);
    setDialogOpen(true);
  }

  function handleSaved() {
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
  }

  function toggleOpen(r: Restaurant) {
    updateMut.mutate({ restaurantId: r.id, data: { isOpen: !r.isOpen } });
  }

  return (
    <AdminLayout title="Manage Restaurants">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            className="pl-10 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button size="lg" className="font-bold h-12 shrink-0" onClick={openCreate}>
          <Plus className="w-5 h-5 mr-2" /> Add Restaurant
        </Button>
      </div>

      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !restaurants || restaurants.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No restaurants found.</p>
              <p className="text-sm mt-1">Click "Add Restaurant" to get started.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground w-16">Image</th>
                    <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-bold text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="h-12 px-4 text-center align-middle font-bold text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-bold text-muted-foreground">Actions</th>
                    <th className="h-12 px-4 text-right align-middle font-bold text-muted-foreground">Menu</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {(restaurants as Restaurant[]).map(r => (
                    <tr key={r.id} className="border-b transition-colors hover:bg-muted/40">
                      <td className="p-3 align-middle">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-zinc-100 dark:border-zinc-800">
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <p className="font-bold text-base leading-tight">{r.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[220px]">{r.address}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.deliveryTime} · Min ${r.minimumOrder}</p>
                      </td>
                      <td className="p-4 align-middle font-medium hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">{r.categoryName}</Badge>
                        {r.isFeatured && (
                          <Badge variant="outline" className="ml-2 text-xs border-amber-400 text-amber-600 dark:text-amber-400">Featured</Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <button
                          onClick={() => toggleOpen(r)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            r.isOpen
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400"
                              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                          title="Click to toggle open/closed"
                        >
                          {r.isOpen ? (
                            <><ToggleRight className="w-3.5 h-3.5" /> Open</>
                          ) : (
                            <><ToggleLeft className="w-3.5 h-3.5" /> Closed</>
                          )}
                        </button>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                            onClick={() => openEdit(r)}
                            title="Edit restaurant"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                title="Delete restaurant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{r.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this restaurant and all its menu items. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteMut.mutate({ restaurantId: r.id })}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 font-semibold border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => setLocation(`/admin/menu-items?restaurant=${r.id}`)}
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" /> Menu
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RestaurantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
