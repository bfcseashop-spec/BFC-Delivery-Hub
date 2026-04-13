import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminListOrders, getAdminListOrdersQueryKey, useAdminUpdateOrderStatus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  
  const queryParams = statusFilter !== "all" ? { status: statusFilter } : {};
  
  const { data: orders, isLoading } = useAdminListOrders(queryParams, {
    query: { queryKey: getAdminListOrdersQueryKey(queryParams) }
  });

  const updateStatusMutation = useAdminUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        data: { status: newStatus as any }
      });
      queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey(queryParams) });
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout title="Manage Orders">
      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-muted-foreground uppercase tracking-wider">Filter by Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-950">
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg font-medium">No orders found.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-base">
                <thead className="[&_tr]:border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-13 px-6 text-left align-middle font-bold text-muted-foreground">Order ID</th>
                    <th className="h-13 px-6 text-left align-middle font-bold text-muted-foreground">Date</th>
                    <th className="h-13 px-6 text-left align-middle font-bold text-muted-foreground">Customer</th>
                    <th className="h-13 px-6 text-left align-middle font-bold text-muted-foreground">Restaurant</th>
                    <th className="h-13 px-6 text-right align-middle font-bold text-muted-foreground">Amount</th>
                    <th className="h-13 px-6 text-center align-middle font-bold text-muted-foreground">Status Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-6 align-middle font-bold">#{order.id}</td>
                      <td className="p-6 align-middle whitespace-nowrap text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM d, h:mm a")}
                      </td>
                      <td className="p-6 align-middle">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                      </td>
                      <td className="p-6 align-middle font-medium">{order.restaurantName}</td>
                      <td className="p-6 align-middle text-right font-bold text-primary">${order.totalAmount.toFixed(2)}</td>
                      <td className="p-6 align-middle text-center">
                        <Select 
                          value={order.status} 
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className={`w-[160px] mx-auto h-9 text-sm font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900' :
                            ''
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">PENDING</SelectItem>
                            <SelectItem value="confirmed">CONFIRMED</SelectItem>
                            <SelectItem value="preparing">PREPARING</SelectItem>
                            <SelectItem value="out_for_delivery">OUT FOR DELIVERY</SelectItem>
                            <SelectItem value="delivered">DELIVERED</SelectItem>
                            <SelectItem value="cancelled">CANCELLED</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
