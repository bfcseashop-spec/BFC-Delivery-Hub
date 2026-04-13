import { useParams } from "wouter";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const MOCK_REVIEWS = [
  { id: 1, customer: "Dara Sok", rating: 5, comment: "Amazing food! Always fresh and delivered on time.", date: "2026-04-10", order: "#1024" },
  { id: 2, customer: "Channary Keo", rating: 4, comment: "Good flavors, portion sizes could be larger.", date: "2026-04-08", order: "#1019" },
  { id: 3, customer: "Vibol Prum", rating: 5, comment: "Best Khmer food in Phnom Penh! Highly recommend.", date: "2026-04-05", order: "#1015" },
  { id: 4, customer: "Sreymom Heng", rating: 3, comment: "Decent but took a bit long to arrive.", date: "2026-04-02", order: "#1010" },
  { id: 5, customer: "Rathana Ly", rating: 5, comment: "Excellent! Will definitely order again.", date: "2026-03-28", order: "#998" },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} />
      ))}
    </div>
  );
}

export default function PartnerReviews() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const avgRating = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length;
  const dist = [5,4,3,2,1].map(n => ({ star: n, count: MOCK_REVIEWS.filter(r => r.rating === n).length }));

  return (
    <PartnerLayout title="Reviews">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="md:col-span-1 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-5 flex flex-col items-center justify-center h-full">
            <p className="text-5xl font-black text-foreground">{avgRating.toFixed(1)}</p>
            <StarRow rating={Math.round(avgRating)} />
            <p className="text-xs text-muted-foreground mt-2">{MOCK_REVIEWS.length} reviews</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Rating Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {dist.map(d => (
              <div key={d.star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 text-xs text-muted-foreground shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{d.star}
                </div>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${MOCK_REVIEWS.length ? (d.count / MOCK_REVIEWS.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-4 text-right">{d.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {MOCK_REVIEWS.map(r => (
          <Card key={r.id} className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{r.customer.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.customer}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow rating={r.rating} />
                      <span className="text-xs text-muted-foreground">{r.order}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">{r.date}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3 pl-12">{r.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PartnerLayout>
  );
}
