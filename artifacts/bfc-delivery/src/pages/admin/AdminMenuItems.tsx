import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";

export default function AdminMenuItems() {
  return (
    <AdminLayout title="Manage Menu Items">
      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <UtensilsCrossed className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Menu Item Management</h2>
          <p className="text-muted-foreground max-w-md">
            Select a restaurant to view and manage its menu items. This section allows you to add new dishes, update pricing, and manage availability.
          </p>
          {/* Note: Full implementation would include restaurant selector + menu item table */}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
