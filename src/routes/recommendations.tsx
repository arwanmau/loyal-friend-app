import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { getRecommendation, PRODUCTS } from "@/lib/recommendations";
import mascotImg from "@/assets/mascot.png";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "For You — LoyaltyBuddy" },
      { name: "description", content: "Personalized food recommendations based on your taste." },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rec, setRec] = useState<ReturnType<typeof getRecommendation> | null>(null);
  const [orders, setOrders] = useState<{ product_name: string; category: string }[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("product_name, category")
        .eq("user_id", user.id);
      const o = data ?? [];
      setOrders(o);
      setRec(getRecommendation(o));
    };
    fetch();
  }, [user]);

  const refresh = () => setRec(getRecommendation(orders));

  if (loading || !user || !rec) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-md px-4 pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" /> Just For You
        </h2>

        <div className="rounded-3xl bg-gradient-to-br from-sunny to-warm p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <img src={mascotImg} alt="Chef Buddy" width={64} height={64} className="shrink-0 drop-shadow" loading="lazy" />
            <div>
              <p className="text-base font-bold text-warm-foreground">{rec.text}</p>
              <p className="mt-1 text-sm text-warm-foreground/70">
                ${rec.product.price.toFixed(2)} • {rec.product.category}
              </p>
            </div>
          </div>
          <Button
            onClick={refresh}
            variant="secondary"
            className="mt-4 w-full rounded-xl font-bold"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Get Another Suggestion
          </Button>
        </div>

        <h3 className="mt-8 mb-3 text-sm font-bold text-foreground">Our Menu</h3>
        <div className="space-y-2">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-card-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
              </div>
              <span className="text-sm font-bold text-primary">${p.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}