import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, LayoutDashboard, SlidersHorizontal, Settings2,
  Eye, EyeOff,
} from "lucide-react";

type Tab = "hero-banners" | "banners" | "filters" | "settings";

interface HeroBanner {
  id: number; title: string; subtitle: string; ctaText: string;
  ctaLink: string; emoji: string; gradient: string; isActive: boolean; displayOrder: number;
}

interface PromoBanner {
  id: number; title: string; subtitle: string; badge: string;
  gradient: string; emoji: string; isActive: boolean; displayOrder: number;
}

interface QuickFilter {
  id: number; label: string; filterKey: string; filterValue: string;
  filterType: string; isActive: boolean; displayOrder: number;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const apiUrl = (path: string) => `${BASE}/api${path}`;

function api(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), { credentials: "include", ...init });
}

const GRADIENTS = [
  { label: "Orange → Red", value: "bg-gradient-to-br from-orange-500 to-red-500" },
  { label: "Yellow → Orange", value: "bg-gradient-to-br from-yellow-400 to-orange-400" },
  { label: "Purple → Pink", value: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { label: "Teal → Green", value: "bg-gradient-to-br from-teal-500 to-green-500" },
  { label: "Blue → Indigo", value: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { label: "Rose → Pink", value: "bg-gradient-to-br from-rose-500 to-pink-400" },
  { label: "Amber → Yellow", value: "bg-gradient-to-br from-amber-400 to-yellow-300" },
];

// ──────────────────────────────────────────────────────────
// Banners Tab
// ──────────────────────────────────────────────────────────
function BannersTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", badge: "", gradient: GRADIENTS[0].value, emoji: "🎉", displayOrder: "0" });

  const { data: banners = [], isLoading } = useQuery<PromoBanner[]>({
    queryKey: ["admin-banners"],
    queryFn: () => api("/admin/landing/banners").then(r => r.json()),
    staleTime: 0,
    refetchOnMount: true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
      if (editing) {
        return api(`/admin/landing/banners/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      return api("/admin/landing/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-banners"] }); qc.removeQueries({ queryKey: ["landing-banners"] }); setOpen(false); toast({ title: editing ? "Banner updated" : "Banner created" }); },
    onError: () => toast({ title: "Error saving banner", variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: (b: PromoBanner) => api(`/admin/landing/banners/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) }),
    onSuccess: (_data, b) => {
      qc.setQueryData<PromoBanner[]>(["admin-banners"], old =>
        old?.map(item => item.id === b.id ? { ...item, isActive: !b.isActive } : item) ?? []
      );
      qc.removeQueries({ queryKey: ["landing-banners"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/landing/banners/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      qc.removeQueries({ queryKey: ["landing-banners"] });
      toast({ title: "Banner deleted" });
    },
    onError: () => toast({ title: "Error deleting banner", variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: "", subtitle: "", badge: "", gradient: GRADIENTS[0].value, emoji: "🎉", displayOrder: String(banners.length + 1) });
    setOpen(true);
  }

  function openEdit(b: PromoBanner) {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle, badge: b.badge, gradient: b.gradient, emoji: b.emoji, displayOrder: String(b.displayOrder) });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Promo Banners</h2>
          <p className="text-sm text-muted-foreground">Manage the deal cards shown on the homepage</p>
        </div>
        <Button onClick={openCreate} className="gap-2" style={{ backgroundColor: "#E8472A" }}>
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading banners...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map(b => (
            <Card key={b.id} className={`overflow-hidden border-2 ${b.isActive ? "border-zinc-200" : "border-zinc-100 opacity-60"}`}>
              <div className={`${b.gradient} p-4 flex items-center justify-between text-white`}>
                <span className="text-3xl">{b.emoji}</span>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">{b.badge || "—"}</Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.subtitle}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => toggle.mutate(b)}>
                      {b.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(b)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-7 h-7 text-red-500 hover:text-red-600" onClick={() => remove.mutate(b.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Order: {b.displayOrder}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add New Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Preview */}
            <div className={`${form.gradient} rounded-xl p-4 flex items-center gap-3 text-white`}>
              <span className="text-3xl">{form.emoji || "🎉"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{form.title || "Banner Title"}</p>
                <p className="text-xs opacity-80 truncate">{form.subtitle || "Subtitle text"}</p>
              </div>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{form.badge || "Badge"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Free Delivery" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Subtitle</Label>
                <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="On every order" />
              </div>
              <div className="space-y-1">
                <Label>Badge text</Label>
                <Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Always" />
              </div>
              <div className="space-y-1">
                <Label>Emoji</Label>
                <Input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🛵" />
              </div>
              <div className="space-y-1">
                <Label>Display order</Label>
                <Input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Color theme</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.gradient}
                  onChange={e => setForm(f => ({ ...f, gradient: e.target.value }))}
                >
                  {GRADIENTS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title} style={{ backgroundColor: "#E8472A" }}>
              {save.isPending ? "Saving..." : editing ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Filters Tab
// ──────────────────────────────────────────────────────────
function FiltersTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuickFilter | null>(null);
  const [form, setForm] = useState({ label: "", filterKey: "", filterValue: "true", filterType: "boolean", displayOrder: "0" });

  const { data: filters = [], isLoading } = useQuery<QuickFilter[]>({
    queryKey: ["admin-filters"],
    queryFn: () => api("/admin/landing/filters").then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
      if (editing) {
        return api(`/admin/landing/filters/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      return api("/admin/landing/filters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-filters"] }); qc.removeQueries({ queryKey: ["landing-filters"] }); setOpen(false); toast({ title: editing ? "Filter updated" : "Filter created" }); },
    onError: () => toast({ title: "Error saving filter", variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: (f: QuickFilter) => api(`/admin/landing/filters/${f.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !f.isActive }) }),
    onSuccess: (_data, f) => {
      qc.setQueryData<QuickFilter[]>(["admin-filters"], old =>
        old?.map(item => item.id === f.id ? { ...item, isActive: !f.isActive } : item) ?? []
      );
      qc.removeQueries({ queryKey: ["landing-filters"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/landing/filters/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-filters"] }); qc.removeQueries({ queryKey: ["landing-filters"] }); toast({ title: "Filter deleted" }); },
    onError: () => toast({ title: "Error deleting filter", variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ label: "", filterKey: "", filterValue: "true", filterType: "boolean", displayOrder: String(filters.length + 1) });
    setOpen(true);
  }

  function openEdit(f: QuickFilter) {
    setEditing(f);
    setForm({ label: f.label, filterKey: f.filterKey, filterValue: f.filterValue, filterType: f.filterType, displayOrder: String(f.displayOrder) });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Quick Filters</h2>
          <p className="text-sm text-muted-foreground">Manage the filter pills shown on the homepage sidebar</p>
        </div>
        <Button onClick={openCreate} className="gap-2" style={{ backgroundColor: "#E8472A" }}>
          <Plus className="w-4 h-4" /> Add Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading filters...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-zinc-50">
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">#</th>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">Label</th>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">Filter Key</th>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">Value</th>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">Type</th>
                    <th className="h-10 px-4 text-center font-bold text-muted-foreground">Active</th>
                    <th className="h-10 px-4 text-right font-bold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filters.map(f => (
                    <tr key={f.id} className="border-b last:border-0 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{f.displayOrder}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-semibold">{f.label}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{f.filterKey}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{f.filterValue}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{f.filterType}</td>
                      <td className="px-4 py-3 text-center">
                        <Switch checked={f.isActive} onCheckedChange={() => toggle.mutate(f)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(f)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-red-500 hover:text-red-600" onClick={() => remove.mutate(f.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Filter" : "Add New Filter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Label *</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Open Now" />
            </div>
            <div className="space-y-1">
              <Label>Filter Key *</Label>
              <Input value={form.filterKey} onChange={e => setForm(f => ({ ...f, filterKey: e.target.value }))} placeholder="isOpen" />
              <p className="text-xs text-muted-foreground">Identifies this filter in the frontend logic</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Filter Value</Label>
                <Input value={form.filterValue} onChange={e => setForm(f => ({ ...f, filterValue: e.target.value }))} placeholder="true" />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.filterType}
                  onChange={e => setForm(f => ({ ...f, filterType: e.target.value }))}
                >
                  <option value="boolean">Boolean</option>
                  <option value="range">Range</option>
                  <option value="multi-select">Multi-select</option>
                  <option value="keyword">Keyword</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Display order</Label>
              <Input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.label || !form.filterKey} style={{ backgroundColor: "#E8472A" }}>
              {save.isPending ? "Saving..." : editing ? "Save Changes" : "Create Filter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Settings Tab
// ──────────────────────────────────────────────────────────
function SettingsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["admin-settings"],
    queryFn: () => api("/admin/landing/settings").then(r => r.json()),
    onSuccess: (data: Record<string, string>) => setForm(data),
  } as any);

  const save = useMutation({
    mutationFn: () => api("/admin/landing/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.removeQueries({ queryKey: ["landing-settings"] });
      setDirty(false);
      toast({ title: "Settings saved" });
    },
    onError: () => toast({ title: "Error saving settings", variant: "destructive" }),
  });

  const currentForm = Object.keys(form).length > 0 ? form : (settings ?? {});

  const LABELS: Record<string, { label: string; desc: string }> = {
    hero_title: { label: "Hero Title", desc: "Main headline shown on the homepage banner" },
    hero_subtitle: { label: "Hero Subtitle", desc: "Smaller text shown below the headline" },
    hero_cta_text: { label: "Hero Button Text", desc: "The call-to-action button label (e.g. 'Sign up free')" },
    hero_emoji: { label: "Hero Emoji", desc: "Decorative emoji displayed beside the hero text (e.g. 🛵)" },
    deals_section_title: { label: "Deals Section Title", desc: "Heading above the promo deal banner cards" },
    cuisines_section_title: { label: "Cuisines Section Title", desc: "Heading above the cuisine category circles" },
    featured_section_title: { label: "Restaurants Section Title", desc: "Default heading above the restaurant grid (no filters active)" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Page Settings</h2>
          <p className="text-sm text-muted-foreground">Configure text and headings shown on the landing page</p>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !dirty} style={{ backgroundColor: "#E8472A" }}>
          {save.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading settings...</div>
      ) : (
        <div className="grid gap-4 max-w-2xl">
          {Object.entries(LABELS).map(([key, { label, desc }]) => (
            <Card key={key}>
              <CardContent className="p-4 space-y-2">
                <div>
                  <Label className="font-bold">{label}</Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Input
                  value={currentForm[key] ?? ""}
                  onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setDirty(true); }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Hero Banners Tab
// ──────────────────────────────────────────────────────────
const HERO_GRADIENTS = [
  { label: "Warm Cream", value: "from-orange-50 to-amber-50" },
  { label: "Soft Green", value: "from-green-50 to-emerald-50" },
  { label: "Soft Blue", value: "from-blue-50 to-indigo-50" },
  { label: "Soft Purple", value: "from-purple-50 to-violet-50" },
  { label: "Soft Rose", value: "from-rose-50 to-pink-50" },
  { label: "Soft Teal", value: "from-teal-50 to-cyan-50" },
  { label: "Soft Yellow", value: "from-yellow-50 to-lime-50" },
];

function HeroBannersTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", ctaText: "Sign up free", ctaLink: "/signup", emoji: "🛵", gradient: HERO_GRADIENTS[0].value, displayOrder: "0" });

  const { data: banners = [], isLoading } = useQuery<HeroBanner[]>({
    queryKey: ["admin-hero-banners"],
    queryFn: () => api("/admin/landing/hero-banners").then(r => r.json()),
    staleTime: 0,
    refetchOnMount: true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const body = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
      if (editing) {
        return api(`/admin/landing/hero-banners/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      return api("/admin/landing/hero-banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      qc.removeQueries({ queryKey: ["landing-hero-banners"] });
      setOpen(false);
      toast({ title: editing ? "Banner updated" : "Banner created" });
    },
    onError: () => toast({ title: "Error saving banner", variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: (b: HeroBanner) => api(`/admin/landing/hero-banners/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) }),
    onSuccess: (_data, b) => {
      qc.setQueryData<HeroBanner[]>(["admin-hero-banners"], old =>
        old?.map(item => item.id === b.id ? { ...item, isActive: !b.isActive } : item) ?? []
      );
      qc.removeQueries({ queryKey: ["landing-hero-banners"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/landing/hero-banners/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      qc.removeQueries({ queryKey: ["landing-hero-banners"] });
      toast({ title: "Banner deleted" });
    },
    onError: () => toast({ title: "Error deleting banner", variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: "", subtitle: "", ctaText: "Sign up free", ctaLink: "/signup", emoji: "🛵", gradient: HERO_GRADIENTS[0].value, displayOrder: String(banners.length + 1) });
    setOpen(true);
  }

  function openEdit(b: HeroBanner) {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaLink: b.ctaLink, emoji: b.emoji, gradient: b.gradient, displayOrder: String(b.displayOrder) });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Hero Banners</h2>
          <p className="text-sm text-muted-foreground">Manage the rotating hero banners shown at the top of the homepage. Multiple active banners auto-rotate every 5 seconds.</p>
        </div>
        <Button onClick={openCreate} style={{ backgroundColor: "#E8472A" }} className="text-white gap-2">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No hero banners yet. Click "Add Banner" to create your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {banners.map(b => (
            <Card key={b.id} className={b.isActive ? "" : "opacity-50"}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-2xl border border-zinc-100 shrink-0`}>
                  {b.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-zinc-900 truncate">{b.title}</span>
                    <Badge variant={b.isActive ? "default" : "secondary"} className={b.isActive ? "bg-green-100 text-green-800 border-0" : ""}>
                      {b.isActive ? "Active" : "Off"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-1">Order: {b.displayOrder}</span>
                  </div>
                  {b.subtitle && <p className="text-sm text-zinc-500 truncate">{b.subtitle}</p>}
                  <p className="text-xs text-primary font-medium mt-0.5">Button: "{b.ctaText}" → {b.ctaLink}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={b.isActive} onCheckedChange={() => toggle.mutate(b)} />
                  <Button size="icon" variant="ghost" onClick={() => openEdit(b)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => remove.mutate(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Hero Banner" : "New Hero Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Hungry? We've Got You Covered" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Free delivery, 24/7" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Button Text</Label>
                <Input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Sign up free" />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/signup" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Emoji</Label>
                <Input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🛵" />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Background Style</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {HERO_GRADIENTS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, gradient: g.value }))}
                    className={`h-10 rounded-lg bg-gradient-to-r ${g.value} border-2 transition ${form.gradient === g.value ? "border-primary scale-105" : "border-transparent"}`}
                    title={g.label}
                  />
                ))}
              </div>
              <div className={`mt-2 rounded-xl bg-gradient-to-r ${form.gradient} border border-zinc-200 flex items-center justify-between px-4 py-3 gap-4`}>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{form.title || "Banner Title"}</p>
                  {form.subtitle && <p className="text-xs text-zinc-500">{form.subtitle}</p>}
                  <span className="mt-1 inline-block text-xs font-semibold bg-primary text-white px-3 py-1 rounded-md">
                    {form.ctaText || "Sign up free"}
                  </span>
                </div>
                <div className="text-4xl">{form.emoji || "🛵"}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title} style={{ backgroundColor: "#E8472A" }}>
              {save.isPending ? "Saving..." : editing ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────
export default function AdminLandingPage() {
  const [tab, setTab] = useState<Tab>("hero-banners");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "hero-banners", label: "Hero Carousel", icon: <Eye className="w-4 h-4" /> },
    { id: "banners", label: "Deal Banners", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "filters", label: "Quick Filters", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: "settings", label: "Page Settings", icon: <Settings2 className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout title="Landing Page">
      <div className="space-y-6">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg w-fit flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${tab === t.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "hero-banners" && <HeroBannersTab />}
        {tab === "banners" && <BannersTab />}
        {tab === "filters" && <FiltersTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </AdminLayout>
  );
}
