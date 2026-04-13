import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, MessageSquare } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) {
  return fetch(`${BASE}/api${path}`, { credentials: "include" });
}

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  orderId?: number | null;
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${cls} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`}
        />
      ))}
    </div>
  );
}

export default function PartnerReviews() {
  const { partnerId } = useParams<{ partnerId: string }>();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["partner-reviews", partnerId],
    queryFn: async () => {
      const r = await api(`/partner/${partnerId}/reviews`);
      return r.ok ? r.json() : [];
    },
    enabled: !!partnerId,
  });

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const dist = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  return (
    <PartnerLayout title="Reviews">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="font-bold text-zinc-900 mb-1">No reviews yet</h3>
          <p className="text-sm text-zinc-500 max-w-xs">
            Customer reviews will appear here once orders are delivered and customers leave feedback.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="md:col-span-1 shadow-sm border-zinc-200">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full gap-2">
                <p className="text-5xl font-black text-foreground">{avgRating.toFixed(1)}</p>
                <StarRow rating={Math.round(avgRating)} size="md" />
                <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 shadow-sm border-zinc-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dist.map(d => (
                  <div key={d.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 text-xs text-muted-foreground shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{d.star}
                    </div>
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-5 text-right">{d.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Review list */}
          <div className="space-y-3">
            {reviews.map(r => (
              <Card key={r.id} className="shadow-sm border-zinc-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {r.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.customerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRow rating={r.rating} />
                          {r.orderId && (
                            <span className="text-xs text-muted-foreground">Order #{r.orderId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-muted-foreground mt-3 pl-12">{r.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </PartnerLayout>
  );
}
