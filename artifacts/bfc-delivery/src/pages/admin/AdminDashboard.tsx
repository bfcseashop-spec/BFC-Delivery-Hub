import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminGetStats, getAdminGetStatsQueryKey, useAdminListOrders, getAdminListOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingBag, Users, DollarSign, PackageCheck, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useAdminGetStats({
    query: { queryKey: getAdminGetStatsQueryKey() }
  });

  const { data: recentOrders, isLoading: isOrdersLoading } = useAdminListOrders({ limit: 5 } as any, {
    query: { queryKey: getAdminListOrdersQueryKey({ limit: 5 } as any) }
  });

  return (
    <AdminLayout title="Overview">
      <div className="space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={stats ? `$${stats.totalRevenue.toFixed(2)}` : null} 
            icon={<DollarSign className="w-5 h-5 text-primary" />} 
            isLoading={isStatsLoading} 
          />
          <StatCard 
            title="Today's Orders" 
            value={stats?.todayOrders} 
            icon={<ShoppingBag className="w-5 h-5 text-blue-500" />} 
            isLoading={isStatsLoading} 
          />
          <StatCard 
            title="Pending Orders" 
            value={stats?.pendingOrders} 
            icon={<AlertCircle className="w-5 h-5 text-amber-500" />} 
            isLoading={isStatsLoading} 
          />
          <StatCard 
            title="Total Restaurants" 
            value={stats?.totalRestaurants} 
            icon={<Store className="w-5 h-5 text-emerald-500" />} 
            isLoading={isStatsLoading} 
          />
        </div>

        {/* Recent Orders */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="font-display font-bold text-xl">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isOrdersLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent orders found.</div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-base">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-13 px-4 text-left align-middle font-bold text-muted-foreground">Order ID</th>
                      <th className="h-13 px-4 text-left align-middle font-bold text-muted-foreground">Customer</th>
                      <th className="h-13 px-4 text-left align-middle font-bold text-muted-foreground">Restaurant</th>
                      <th className="h-13 px-4 text-right align-middle font-bold text-muted-foreground">Amount</th>
                      <th className="h-13 px-4 text-right align-middle font-bold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">#{order.id}</td>
                        <td className="p-4 align-middle">{order.customerName}</td>
                        <td className="p-4 align-middle">{order.restaurantName}</td>
                        <td className="p-4 align-middle text-right font-bold">${order.totalAmount.toFixed(2)}</td>
                        <td className="p-4 align-middle text-right">
                          <Badge variant={order.status === "pending" ? "secondary" : order.status === "delivered" ? "default" : "outline"} className="uppercase text-sm">
                            {order.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, isLoading }: { title: string, value: string | number | null | undefined, icon: React.ReactNode, isLoading: boolean }) {
  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-base font-medium text-muted-foreground mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <h3 className="text-3xl font-black font-display tracking-tight">{value}</h3>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
