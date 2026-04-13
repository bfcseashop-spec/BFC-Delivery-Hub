import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Loader2, Search, Handshake, Phone, Mail, Building2, Store } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useListRestaurants } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function api(path: string, init?: RequestInit) {
  return fetch(`${BASE}/api${path}`, { credentials: "include", ...init });
}

type Partner = {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  restaurantId: number | null;
  status: string;
  contractType: string;
  commissionRate: number;
  notes: string;
  createdAt: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  restaurantId: string;
  status: string;
  contractType: string;
  commissionRate: string;
  notes: string;
};

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  restaurantId: "",
  status: "pending",
  contractType: "standard",
  commissionRate: "15",
  notes: "",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
};

const CONTRACT_LABELS: Record<string, string> = {
  standard: "Standard",
  premium: "Premium",
  custom: "Custom",
};

function PartnerDialog({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: Partner | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const { data: restaurants = [] } = useListRestaurants({});

  const initForm = useCallback((p: Partner | null) => {
    if (p) {
      setForm({
        name: p.name,
        email: p.email,
        phone: p.phone,
        businessName: p.businessName,
        restaurantId: p.restaurantId ? String(p.restaurantId) : "",
        status: p.status,
        contractType: p.contractType,
        commissionRate: String(p.commissionRate),
        notes: p.notes,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, []);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (!form.businessName.trim()) { toast.error("Business name is required"); return; }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        businessName: form.businessName.trim(),
        restaurantId: form.restaurantId ? parseInt(form.restaurantId) : null,
        status: form.status,
        contractType: form.contractType,
        commissionRate: parseFloat(form.commissionRate) || 15,
        notes: form.notes.trim(),
      };

      const r = editing
        ? await api(`/admin/partners/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await api("/admin/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!r.ok) throw new Error("Save failed");
      toast.success(editing ? "Partner updated" : "Partner added");
      onSaved();
    } catch {
      toast.error("Failed to save partner");
    } finally {
      setSaving(false);
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Partner" : "Add Partner"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contact Name <span className="text-red-500">*</span></Label>
              <Input placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Business Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Doe Restaurants Ltd." value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="partner@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="+855 12 345 678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          {/* Restaurant Link */}
          <div className="space-y-1.5">
            <Label>Linked Restaurant</Label>
            <Select value={form.restaurantId || "none"} onValueChange={v => setForm(f => ({ ...f, restaurantId: v === "none" ? "" : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Not linked" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not linked</SelectItem>
                {(restaurants as Array<{ id: number; name: string }>).map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contract</Label>
              <Select value={form.contractType} onValueChange={v => setForm(f => ({ ...f, contractType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Commission %</Label>
              <Input type="number" min="0" max="100" step="0.5" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} placeholder="Any additional notes about this partner…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editing ? "Save Changes" : "Add Partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPartners() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const r = await api("/admin/partners");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const { data: restaurants = [] } = useListRestaurants({});

  const deleteMut = useMutation({
    mutationFn: (id: number) => api(`/admin/partners/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-partners"] }); toast.success("Partner removed"); },
    onError: () => toast.error("Failed to remove partner"),
  });

  const filtered = partners.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.businessName.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function getRestaurantName(id: number | null) {
    if (!id) return null;
    return (restaurants as Array<{ id: number; name: string }>).find(r => r.id === id)?.name ?? null;
  }

  const counts = {
    all: partners.length,
    active: partners.filter(p => p.status === "active").length,
    pending: partners.filter(p => p.status === "pending").length,
    suspended: partners.filter(p => p.status === "suspended").length,
  };

  return (
    <AdminLayout title="Partner Management">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(["all", "active", "pending", "suspended"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === s ? "border-primary bg-primary/5 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"}`}
          >
            <p className="text-2xl font-black text-foreground">{counts[s]}</p>
            <p className="text-sm font-medium text-muted-foreground capitalize">{s === "all" ? "Total Partners" : s}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, business, or email…"
            className="pl-9 bg-white dark:bg-zinc-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button className="shrink-0 font-bold" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Partner
        </Button>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Handshake className="w-12 h-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-lg">No partners found.</p>
              <p className="text-sm mt-1">Add your first restaurant partner to get started.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="h-11 px-4 text-left font-bold text-muted-foreground">Partner</th>
                    <th className="h-11 px-4 text-left font-bold text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="h-11 px-4 text-left font-bold text-muted-foreground hidden lg:table-cell">Restaurant</th>
                    <th className="h-11 px-4 text-center font-bold text-muted-foreground">Status</th>
                    <th className="h-11 px-4 text-center font-bold text-muted-foreground hidden sm:table-cell">Contract</th>
                    <th className="h-11 px-4 text-center font-bold text-muted-foreground hidden sm:table-cell">Commission</th>
                    <th className="h-11 px-4 text-right font-bold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold leading-tight">{p.businessName}</p>
                            <p className="text-xs text-muted-foreground">{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[160px]">{p.email}</span>
                        </div>
                        {p.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{p.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle hidden lg:table-cell">
                        {getRestaurantName(p.restaurantId) ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Store className="w-3.5 h-3.5 text-primary" />
                            {getRestaurantName(p.restaurantId)}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not linked</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[p.status] ?? "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-center hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{CONTRACT_LABELS[p.contractType] ?? p.contractType}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-center hidden sm:table-cell">
                        <span className="font-bold text-sm">{p.commissionRate}%</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => { setEditing(p); setDialogOpen(true); }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove "{p.businessName}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this partner record. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteMut.mutate(p.id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PartnerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={() => { setDialogOpen(false); qc.invalidateQueries({ queryKey: ["admin-partners"] }); }}
      />
    </AdminLayout>
  );
}
