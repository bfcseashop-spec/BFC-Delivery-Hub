import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) { return fetch(`${BASE}/api${path}`, { credentials: "include" }); }

type Invoice = { id: number; month: string; revenue: number; orderCount: number; commission: number; status: string };

export default function PartnerInvoices() {
  const { partnerId } = useParams<{ partnerId: string }>();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["partner-invoices", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}/invoices`); return r.ok ? r.json() : []; },
  });

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.commission, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.commission, 0);

  return (
    <PartnerLayout title="Invoices">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Total Commission Paid</p>
            <p className="text-2xl font-black text-green-600">${totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Pending Payment</p>
            <p className="text-2xl font-black text-amber-600">${totalPending.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="font-medium">No invoices yet.</p>
              <p className="text-xs mt-1">Invoices are generated monthly from delivered orders.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="h-10 px-4 text-left font-bold text-muted-foreground">Month</th>
                    <th className="h-10 px-4 text-center font-bold text-muted-foreground">Orders</th>
                    <th className="h-10 px-4 text-right font-bold text-muted-foreground">Revenue</th>
                    <th className="h-10 px-4 text-right font-bold text-muted-foreground">Commission</th>
                    <th className="h-10 px-4 text-center font-bold text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-right font-bold text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold">{inv.month}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{inv.orderCount}</td>
                      <td className="px-4 py-3 text-right">${inv.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">-${inv.commission.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={inv.status === "paid" ? "default" : "secondary"} className={`text-xs capitalize ${inv.status === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                          <Download className="w-3 h-3" /> PDF
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
    </PartnerLayout>
  );
}
