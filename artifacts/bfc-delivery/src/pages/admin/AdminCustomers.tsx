import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users, ShieldCheck, User } from "lucide-react";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function api(path: string) {
  return fetch(`${BASE}/api${path}`, { credentials: "include" });
}

type Customer = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const ROLE_STYLES: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700 border-blue-200",
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  partner: "bg-green-50 text-green-700 border-green-200",
};

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const r = await api("/admin/customers");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || c.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: customers.length,
    customer: customers.filter(c => c.role === "customer").length,
    admin: customers.filter(c => c.role === "admin").length,
  };

  return (
    <AdminLayout title="Customers">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["all", "customer", "admin"] as const).map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-xl border p-4 text-left transition-all ${roleFilter === r ? "border-primary bg-primary/5 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"}`}
          >
            <p className="text-2xl font-black">{counts[r as keyof typeof counts]}</p>
            <p className="text-sm font-medium text-muted-foreground capitalize">{r === "all" ? "Total Users" : r === "customer" ? "Customers" : "Admins"}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9 bg-white dark:bg-zinc-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-lg">No users found.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="h-11 px-4 text-left font-bold text-muted-foreground">User</th>
                    <th className="h-11 px-4 text-left font-bold text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="h-11 px-4 text-center font-bold text-muted-foreground">Role</th>
                    <th className="h-11 px-4 text-right font-bold text-muted-foreground hidden sm:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            {c.role === "admin" ? <ShieldCheck className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div>
                            <p className="font-bold leading-tight">{c.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle hidden md:table-cell text-muted-foreground">{c.email}</td>
                      <td className="px-4 py-3 align-middle text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${ROLE_STYLES[c.role] ?? "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right text-xs text-muted-foreground hidden sm:table-cell">
                        {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
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
