import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PointsCard } from "@/components/PointsCard";
import { BottomNav } from "@/components/BottomNav";
import { Sparkles, Ticket, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LoyaltyBuddy" },
      { name: "description", content: "View your loyalty points and personalized recommendations." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ points: number; display_name: string | null } | null>(null);
  const [recentOrders, setRecentOrders] = useState<{ product_name: string; category: string; price: number }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: p } = await supabase
        .from("user_profiles")
        .select("points, display_name")
        .eq("id", user.id)
        .single();
      if (p) setProfile(p);

      const { data: t } = await supabase
        .from("transactions")
        .select("product_name, category, price")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (t) setRecentOrders(t.map(r => ({ ...r, price: Number(r.price) })));
    };
    fetchData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-md px-4 pt-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">My Dashboard</h2>

        <PointsCard points={profile?.points ?? 0} displayName={profile?.display_name} />

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/recommendations"
            className="flex flex-col items-center gap-2 rounded-2xl bg-sunny p-4 text-sunny-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Sparkles className="h-8 w-8" />
            <span className="text-sm font-bold">For You</span>
          </Link>
          <Link
            to="/vouchers"
            className="flex flex-col items-center gap-2 rounded-2xl bg-mint p-4 text-mint-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Ticket className="h-8 w-8" />
            <span className="text-sm font-bold">Vouchers</span>
          </Link>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4" /> Recent Activity
          </h3>
          {recentOrders.length === 0 ? (
            <div className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-sm">
              No orders yet — start ordering to earn points! 🎯
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">{order.category}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">${order.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}