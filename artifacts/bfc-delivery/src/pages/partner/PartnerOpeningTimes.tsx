import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";

type DaySchedule = { open: boolean; from: string; to: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SCHEDULE: Record<string, DaySchedule> = {
  Monday: { open: true, from: "07:00", to: "22:00" },
  Tuesday: { open: true, from: "07:00", to: "22:00" },
  Wednesday: { open: true, from: "07:00", to: "22:00" },
  Thursday: { open: true, from: "07:00", to: "22:00" },
  Friday: { open: true, from: "07:00", to: "23:00" },
  Saturday: { open: true, from: "08:00", to: "23:00" },
  Sunday: { open: true, from: "08:00", to: "21:00" },
};

export default function PartnerOpeningTimes() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [saving, setSaving] = useState(false);

  function toggle(day: string) {
    setSchedule(s => ({ ...s, [day]: { ...s[day], open: !s[day].open } }));
  }
  function setTime(day: string, field: "from" | "to", val: string) {
    setSchedule(s => ({ ...s, [day]: { ...s[day], [field]: val } }));
  }
  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Opening times saved"); }, 800);
  }

  const openDays = DAYS.filter(d => schedule[d].open).length;

  return (
    <PartnerLayout title="Opening Times">
      <div className="max-w-xl">
        <p className="text-sm text-muted-foreground mb-5">Set when your restaurant is open for orders. These times are shown to customers on your listing.</p>

        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Weekly Schedule
              <span className="ml-auto text-xs text-muted-foreground font-normal">{openDays}/7 days open</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map(day => {
              const s = schedule[day];
              return (
                <div key={day} className="flex items-center gap-3">
                  <Switch checked={s.open} onCheckedChange={() => toggle(day)} />
                  <span className={`text-sm font-medium w-24 ${s.open ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                  {s.open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="time" value={s.from} onChange={e => setTime(day, "from", e.target.value)} className="h-8 text-xs w-28" />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input type="time" value={s.to} onChange={e => setTime(day, "to", e.target.value)} className="h-8 text-xs w-28" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground flex-1">Closed</span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="font-bold">
          {saving ? "Saving…" : "Save Opening Times"}
        </Button>
      </div>
    </PartnerLayout>
  );
}
