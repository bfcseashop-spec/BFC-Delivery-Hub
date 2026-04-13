import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, TrendingUp, Eye, MousePointer } from "lucide-react";

const CAMPAIGNS = [
  { id: 1, name: "Weekend Special Banner", type: "Banner Ad", status: "active", budget: 50, spent: 32.50, impressions: 4820, clicks: 143, startDate: "2026-04-07", endDate: "2026-04-14" },
  { id: 2, name: "New Menu Launch", type: "Sponsored Listing", status: "ended", budget: 80, spent: 80, impressions: 9200, clicks: 311, startDate: "2026-03-20", endDate: "2026-03-31" },
];

export default function PartnerAdvertising() {
  return (
    <PartnerLayout title="Advertising">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Boost your restaurant's visibility with targeted ads.</p>
        <Button className="font-bold gap-2"><Plus className="w-4 h-4" /> Create Campaign</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Impressions", value: "14,020", icon: <Eye className="w-4 h-4 text-blue-500" /> },
          { label: "Total Clicks", value: "454", icon: <MousePointer className="w-4 h-4 text-violet-500" /> },
          { label: "Total Spend", value: "$112.50", icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
        ].map(s => (
          <Card key={s.label} className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              {s.icon}
              <div>
                <p className="text-lg font-black">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns */}
      <div className="space-y-3">
        {CAMPAIGNS.map(c => (
          <Card key={c.id} className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm">{c.name}</p>
                    <Badge className={`text-[10px] capitalize ${c.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.type} · {c.startDate} → {c.endDate}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs shrink-0">Manage</Button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {[
                  { label: "Budget", value: `$${c.budget}` },
                  { label: "Spent", value: `$${c.spent.toFixed(2)}` },
                  { label: "Impressions", value: c.impressions.toLocaleString() },
                  { label: "Clicks", value: c.clicks },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-bold">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((c.spent / c.budget) * 100, 100)}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PartnerLayout>
  );
}
