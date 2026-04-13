import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Building2, DollarSign, TrendingUp, Calendar } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) {
  return fetch(`${BASE}/api${path}`, { credentials: "include" });
}

interface Invoice {
  id: number;
  month: string;
  revenue: number;
  orderCount: number;
  commission: number;
  status: "pending" | "paid";
}

function monthLabel(ym: string) {
  const [year, month] = ym.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function PartnerPayments() {
  const { partnerId } = useParams<{ partnerId: string }>();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["partner-invoices", partnerId],
    queryFn: async () => {
      const r = await api(`/partner/${partnerId}/invoices`);
      return r.ok ? r.json() : [];
    },
    enabled: !!partnerId,
  });

  const pending = invoices.find(i => i.status === "pending");
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.revenue - i.commission), 0);
  const currentRevenue = invoices[0]?.revenue ?? 0;
  const currentCommission = invoices[0]?.commission ?? 0;
  const netPayout = currentRevenue - currentCommission;

  return (
    <PartnerLayout title="Payments">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Payout History */}
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Payout History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-zinc-400">
                    No payout history yet. Payouts are generated from delivered orders.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {invoices.map(inv => {
                      const net = inv.revenue - inv.commission;
                      return (
                        <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition">
                          <div>
                            <p className="font-semibold text-sm">{monthLabel(inv.month)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {inv.orderCount} delivered orders
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-muted-foreground">Revenue</p>
                              <p className="text-sm font-semibold">${inv.revenue.toFixed(2)}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-muted-foreground">Commission</p>
                              <p className="text-sm font-semibold text-red-500">-${inv.commission.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Net</p>
                              <p className="text-sm font-bold text-green-600">${net.toFixed(2)}</p>
                            </div>
                            <Badge
                              className={`capitalize text-xs font-semibold px-2.5 ${
                                inv.status === "paid"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                              variant="outline"
                            >
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Breakdown for current period */}
            {invoices.length > 0 && (
              <Card className="shadow-sm border-zinc-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Current Period Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Revenue</span>
                    <span className="font-bold">${currentRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Commission</span>
                    <span className="font-bold text-red-600">-${currentCommission.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Net Payout</span>
                    <span className="font-black text-green-600">${netPayout.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {pending ? "Current Period Net" : "No Pending Payout"}
                  </p>
                </div>
                <p className="text-3xl font-black text-primary">
                  {pending ? `$${(pending.revenue - pending.commission).toFixed(2)}` : "$0.00"}
                </p>
                {pending && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthLabel(pending.month)} • {pending.status}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Invoices</span>
                  <span className="font-bold">{invoices.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid Out</span>
                  <span className="font-bold text-green-600">${totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-bold">{invoices.reduce((s, i) => s + i.orderCount, 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Payment Info</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Payouts are calculated monthly from all delivered orders. Commission is deducted automatically. Contact support to update your bank details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PartnerLayout>
  );
}
