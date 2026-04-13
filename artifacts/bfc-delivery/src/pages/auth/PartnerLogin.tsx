import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Store } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function PartnerLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) { toast.error("Please enter username and password"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/partner/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Login failed"); return; }
      toast.success(`Welcome back, ${data.businessName}!`);
      setLocation(`/partner/${data.partnerId}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Partner Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your restaurant</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
              <Input
                id="username"
                placeholder="your_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full font-bold h-10" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</> : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Forgot your credentials? Contact{" "}
          <a href="mailto:support@bfcdelivery.com" className="text-primary font-semibold hover:underline">
            BFC Support
          </a>
        </p>
      </div>
    </div>
  );
}
