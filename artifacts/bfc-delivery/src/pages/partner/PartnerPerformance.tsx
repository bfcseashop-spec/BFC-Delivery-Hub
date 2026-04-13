import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) { return fetch(`${BASE}/api${path}`, { credentials: "include" }); }

export default function PartnerPerformance() {
  const { partnerId } = useParams<{ partnerId: string }>();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["partner-stats", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}/stats`); return r.ok ? r.json() : null; },
  });

  const acceptanceRate = 96;
  const onTimeRate = 88;
  const avgPrepTime = "14 min";

  return (
    <PartnerLayout title="Performance">
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Order Acceptance", value: `${acceptanceRate}%`, sub: "Last 30 days", color: "text-green-600" },
              { label: "On-Time Delivery", value: `${onTimeRate}%`, sub: "Last 30 days", color: "text-blue-600" },
              { label: "Avg. Prep Time", value: avgPrepTime, sub: "Per order", color: "text-violet-600" },
              { label: "Completed Orders", value: stats?.completedOrders ?? 0, sub: "All time", color: "text-amber-600" },
            ].map(m => (
              <Card key={m.label} className="shadow-sm border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4">
                  <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                  <p className="text-xs font-semibold text-foreground mt-1">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats?.daily ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#E8472A" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Order Volume Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats?.daily ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PartnerLayout>
  );
}
