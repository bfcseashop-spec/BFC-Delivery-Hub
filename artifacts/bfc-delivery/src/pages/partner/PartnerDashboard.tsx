import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

export default function PartnerDashboard() {
  const { partnerId } = useParams<{ partnerId: string }>();

  const { data: info } = useQuery({
    queryKey: ["partner-info", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}`); return r.ok ? r.json() : null; },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["partner-stats", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}/stats`); return r.ok ? r.json() : null; },
  });

  const { data: orders = [] } = useQuery<{ id: number; status: string; totalAmount: number; customerName: string; createdAt: string }[]>({
    queryKey: ["partner-orders", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}/orders`); return r.ok ? r.json() : []; },
  });

  const recentOrders = orders.slice(0, 5);
  const restaurantName = info?.restaurant?.name ?? "Your Restaurant";

  return (
    <PartnerLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Welcome back 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{restaurantName} · Overview for all time</p>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-950/30" },
              { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-green-500" />, color: "bg-green-50 dark:bg-green-950/30" },
              { label: "Avg Order Value", value: `$${(stats?.avgOrderValue ?? 0).toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-violet-500" />, color: "bg-violet-50 dark:bg-violet-950/30" },
              { label: "Active Orders", value: stats?.pendingOrders ?? 0, icon: <Clock className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-950/30" },
            ].map(s => (
              <Card key={s.label} className="shadow-sm border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-black text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            {/* Chart */}
            <Card className="lg:col-span-3 shadow-sm border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Orders (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.daily ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number, n: string) => [n === "revenue" ? `$${v.toFixed(2)}` : v, n === "revenue" ? "Revenue" : "Orders"]} labelFormatter={l => `Date: ${l}`} />
                    <Bar dataKey="orders" fill="#E8472A" radius={[4, 4, 0, 0]} name="orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Commission Summary */}
            <Card className="lg:col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-bold">${(stats?.totalRevenue ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission ({info?.partner.commissionRate ?? 15}%)</span>
                    <span className="font-bold text-red-600">-${(stats?.commissionOwed ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex justify-between text-sm">
                    <span className="font-semibold">Net Earnings</span>
                    <span className="font-black text-green-600">${((stats?.totalRevenue ?? 0) - (stats?.commissionOwed ?? 0)).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  {stats?.completedOrders ?? 0} delivered orders
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No orders yet.</div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {recentOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-semibold text-sm">Order #{o.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[o.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {o.status.replace(/_/g, " ")}
                        </span>
                        <span className="font-bold text-sm">${(o.totalAmount ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PartnerLayout>
  );
}
