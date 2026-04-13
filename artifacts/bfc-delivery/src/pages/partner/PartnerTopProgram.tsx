import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, TrendingUp, ShoppingBag, CheckCircle } from "lucide-react";

const TIERS = [
  { name: "Bronze", color: "text-amber-700 bg-amber-50 border-amber-200", minOrders: 0, commission: 18, perks: ["Basic listing", "Standard support"] },
  { name: "Silver", color: "text-zinc-500 bg-zinc-50 border-zinc-200", minOrders: 100, commission: 15, perks: ["Featured badge", "Priority support", "Weekly reports"] },
  { name: "Gold", color: "text-yellow-600 bg-yellow-50 border-yellow-200", minOrders: 300, commission: 12, perks: ["Top restaurant badge", "Dedicated manager", "Marketing credits", "Daily reports"] },
  { name: "Platinum", color: "text-violet-600 bg-violet-50 border-violet-200", minOrders: 600, commission: 10, perks: ["Platinum badge", "Zero downtime SLA", "Custom promotions", "Priority placement", "Monthly strategy call"] },
];

export default function PartnerTopProgram() {
  const currentTier = "Gold";
  const ordersThisMonth = 47;
  const nextTierOrders = 600;

  return (
    <PartnerLayout title="Top Restaurant Program">
      {/* Current Status */}
      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 mb-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Current Tier</p>
              <p className="text-3xl font-black text-yellow-700 dark:text-yellow-400">{currentTier}</p>
              <p className="text-sm text-muted-foreground mt-1">{ordersThisMonth} / {nextTierOrders} orders to reach Platinum</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${(ordersThisMonth / nextTierOrders) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{nextTierOrders - ordersThisMonth} more orders to reach Platinum</p>
          </div>
        </CardContent>
      </Card>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map(tier => (
          <Card key={tier.name} className={`shadow-sm border ${tier.name === currentTier ? "ring-2 ring-primary" : "border-zinc-200 dark:border-zinc-800"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className={`text-xs font-bold px-2.5 py-0.5 border ${tier.color}`}>{tier.name}</Badge>
                {tier.name === currentTier && <Badge className="text-xs bg-primary text-white">Current</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-1">From {tier.minOrders} orders/mo</p>
              <p className="text-xl font-black text-foreground">{tier.commission}%</p>
              <p className="text-xs text-muted-foreground mb-3">commission rate</p>
              <ul className="space-y-1.5">
                {tier.perks.map(p => (
                  <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" /> {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PartnerLayout>
  );
}
