import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building2, CheckCircle, DollarSign } from "lucide-react";

const PAYOUTS = [
  { id: 1, date: "2026-04-07", amount: 342.50, status: "completed", ref: "PAY-2026-041" },
  { id: 2, date: "2026-03-31", amount: 518.00, status: "completed", ref: "PAY-2026-032" },
  { id: 3, date: "2026-03-24", amount: 214.80, status: "completed", ref: "PAY-2026-023" },
];

export default function PartnerPayments() {
  return (
    <PartnerLayout title="Payments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Details */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Bank Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Bank Name</Label>
                  <Input defaultValue="ABA Bank" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Account Name</Label>
                  <Input defaultValue="BKK Khmer Cuisine Ltd." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Account Number</Label>
                  <Input defaultValue="000123456789" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Currency</Label>
                  <Input defaultValue="USD" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="w-3.5 h-3.5" /> Verified account
              </div>
              <Button size="sm" className="font-semibold">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Payout History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {PAYOUTS.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm">{p.ref}</p>
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold capitalize">{p.status}</span>
                      <span className="font-bold text-sm">${p.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-medium mb-1">Next Payout</p>
              <p className="text-3xl font-black text-primary">$387.20</p>
              <p className="text-xs text-muted-foreground mt-1">Expected Apr 14, 2026</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month Revenue</span>
                <span className="font-bold">$451.40</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission (12%)</span>
                <span className="font-bold text-red-600">-$54.17</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-bold text-red-600">-$10.03</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm">
                <span className="font-semibold">Net Payout</span>
                <span className="font-black text-green-600">$387.20</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PartnerLayout>
  );
}
