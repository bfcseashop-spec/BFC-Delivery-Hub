import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) { return fetch(`${BASE}/api${path}`, { credentials: "include" }); }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function PartnerOrderHistory() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery<{ id: number; status: string; totalAmount: number; customerName: string; createdAt: string; items: string }[]>({
    queryKey: ["partner-orders", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}/orders`); return r.ok ? r.json() : []; },
  });

  const filtered = orders.filter(o => {
    const matchSearch = !search || String(o.id).includes(search) || o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PartnerLayout title="Order History">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by order # or customer…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="font-medium">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">Order #</th>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground hidden md:table-cell">Customer</th>
                    <th className="h-10 px-4 text-center font-bold text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-right font-bold text-muted-foreground">Total</th>
                    <th className="h-10 px-4 text-right font-bold text-muted-foreground hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filtered.map(o => (
                    <tr key={o.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold">#{o.id}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.customerName || "Guest"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[o.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">${(o.totalAmount ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-3 text-right">{filtered.length} orders total</p>
    </PartnerLayout>
  );
}
