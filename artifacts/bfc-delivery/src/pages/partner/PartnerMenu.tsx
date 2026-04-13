import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, UtensilsCrossed, ImageIcon } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) { return fetch(`${BASE}/api${path}`, { credentials: "include" }); }

type MenuItem = { id: number; name: string; description: string; price: number; imageUrl: string; category: string; isAvailable: boolean; isPopular: boolean };

export default function PartnerMenu() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["partner-menu", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}/menu`); return r.ok ? r.json() : []; },
  });

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <PartnerLayout title="Menu">
      <div className="flex items-center justify-between mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search menu items…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="ml-3 text-sm text-muted-foreground">{items.length} items · {categories.length} categories</div>
      </div>

      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="font-medium">No menu items found.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-700">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      {item.isPopular && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 px-1.5 py-0">Popular</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">${item.price.toFixed(2)}</p>
                    <Badge variant={item.isAvailable ? "default" : "secondary"} className={`text-[10px] mt-0.5 ${item.isAvailable ? "bg-green-100 text-green-700 border-green-200" : "bg-zinc-100 text-zinc-500"}`}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PartnerLayout>
  );
}
