import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Percent, Gift, Clock } from "lucide-react";

const PROMOS = [
  { id: 1, name: "20% Off First Order", type: "Discount", discount: "20%", minOrder: "$5", uses: 34, maxUses: 100, status: "active", expires: "2026-04-30" },
  { id: 2, name: "Free Delivery Weekend", type: "Free Delivery", discount: "Free delivery", minOrder: "$8", uses: 78, maxUses: 200, status: "active", expires: "2026-04-14" },
  { id: 3, name: "Buy 2 Get 1 Free", type: "BOGO", discount: "1 free item", minOrder: "$15", uses: 200, maxUses: 200, status: "ended", expires: "2026-03-31" },
];

export default function PartnerPromotions() {
  return (
    <PartnerLayout title="Promotions">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Create offers to attract more customers.</p>
        <Button className="font-bold gap-2"><Plus className="w-4 h-4" /> Create Promotion</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Promotions", value: PROMOS.filter(p => p.status === "active").length, icon: <Tag className="w-4 h-4 text-primary" />, color: "text-primary" },
          { label: "Total Uses", value: PROMOS.reduce((s, p) => s + p.uses, 0), icon: <Gift className="w-4 h-4 text-green-500" />, color: "text-green-600" },
          { label: "Expiring Soon", value: 1, icon: <Clock className="w-4 h-4 text-amber-500" />, color: "text-amber-600" },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              {s.icon}
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {PROMOS.map(p => (
          <Card key={p.id} className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm">{p.name}</p>
                      <Badge className={`text-[10px] capitalize ${p.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>{p.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.type} · {p.discount} · Min. order {p.minOrder} · Expires {p.expires}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs shrink-0">{p.status === "active" ? "Pause" : "Duplicate"}</Button>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Usage</span>
                  <span>{p.uses} / {p.maxUses}</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((p.uses / p.maxUses) * 100, 100)}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PartnerLayout>
  );
}
