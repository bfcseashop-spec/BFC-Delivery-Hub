import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListRestaurants, getListRestaurantsQueryKey } from "@workspace/api-client-react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, Search, UtensilsCrossed } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminRestaurants() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const { data: restaurants, isLoading } = useListRestaurants(
    { search: search || undefined }, 
    { query: { queryKey: getListRestaurantsQueryKey({ search: search || undefined }) } }
  );

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`${BASE}/api/admin/restaurants/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
      toast.success("Restaurant deleted");
    },
    onError: () => toast.error("Failed to delete restaurant"),
  });

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  return (
    <AdminLayout title="Manage Restaurants">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search restaurants..." 
            className="pl-10 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="lg" className="font-bold h-12 shrink-0">
          <Plus className="w-5 h-5 mr-2" /> Add Restaurant
        </Button>
      </div>

      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !restaurants || restaurants.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg font-medium">No restaurants found.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-bold text-muted-foreground w-16">Image</th>
                    <th className="h-12 px-6 text-left align-middle font-bold text-muted-foreground">Name</th>
                    <th className="h-12 px-6 text-left align-middle font-bold text-muted-foreground">Category</th>
                    <th className="h-12 px-6 text-center align-middle font-bold text-muted-foreground">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-bold text-muted-foreground">Actions</th>
                    <th className="h-12 px-4 text-right align-middle font-bold text-muted-foreground">Menu</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="p-6 align-middle">
                        <p className="font-bold text-base">{restaurant.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">{restaurant.address}</p>
                      </td>
                      <td className="p-6 align-middle font-medium">{restaurant.categoryName}</td>
                      <td className="p-6 align-middle text-center">
                        <Badge variant={restaurant.isOpen ? "default" : "secondary"} className="uppercase">
                          {restaurant.isOpen ? "Open" : "Closed"}
                        </Badge>
                        {restaurant.isFeatured && (
                          <Badge variant="outline" className="ml-2 uppercase border-primary text-primary">Featured</Badge>
                        )}
                      </td>
                      <td className="p-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete {restaurant.name} and all its menu items.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(restaurant.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 font-semibold border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => setLocation(`/admin/menu-items?restaurant=${restaurant.id}`)}
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5" /> Menu
                        </Button>
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
