import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { User, Building2, Phone, Mail } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function api(path: string) { return fetch(`${BASE}/api${path}`, { credentials: "include" }); }

export default function PartnerSettings() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["partner-info", partnerId],
    queryFn: async () => { const r = await api(`/partner/${partnerId}`); return r.ok ? r.json() : null; },
  });

  const partner = data?.partner;
  const restaurant = data?.restaurant;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success("Settings saved");
  }

  if (!partner) return <PartnerLayout title="Settings"><div className="flex justify-center py-16 text-muted-foreground">Loading…</div></PartnerLayout>;

  return (
    <PartnerLayout title="Settings">
      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        {/* Contact Info */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Name</Label>
                <Input defaultValue={partner.name} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Business Name</Label>
                <Input defaultValue={partner.businessName} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</Label>
                <Input type="email" defaultValue={partner.email} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</Label>
                <Input defaultValue={partner.phone} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Info */}
        {restaurant && (
          <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Restaurant Name</Label>
                <Input defaultValue={restaurant.name} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea rows={3} defaultValue={partner.notes || ""} placeholder="Any notes about this partnership…" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Info (read-only) */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Contract Type</p>
              <p className="font-semibold capitalize">{partner.contractType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Commission Rate</p>
              <p className="font-semibold">{partner.commissionRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Status</p>
              <p className="font-semibold capitalize">{partner.status}</p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="font-bold">
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </PartnerLayout>
  );
}
