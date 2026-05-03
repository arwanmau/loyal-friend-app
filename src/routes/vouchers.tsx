import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Ticket, Gift } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { toast } from "sonner";

export const Route = createFileRoute("/vouchers")({
  head: () => ({
    meta: [
      { title: "Vouchers — LoyaltyBuddy" },
      { name: "description", content: "Claim your loyalty rewards and discount vouchers." },
    ],
  }),
  component: VouchersPage,
});

function VouchersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [vouchers, setVouchers] = useState<{ id: string; code: string; status: string; created_at: string }[]>([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: p } = await supabase
        .from("user_profiles")
        .select("points")
        .eq("id", user.id)
        .single();
      if (p) setPoints(p.points);

      const { data: v } = await supabase
        .from("vouchers")
        .select("id, code, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (v) setVouchers(v);
    };
    fetchData();
  }, [user]);

  const claimVoucher = async () => {
    if (!user || points < 100) return;
    setClaiming(true);
    try {
      const code = `LOYAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { error } = await supabase.from("vouchers").insert({
        user_id: user.id,
        code,
        status: "active",
      });
      if (error) throw error;
      setVouchers((prev) => [{ id: crypto.randomUUID(), code, status: "active", created_at: new Date().toISOString() }, ...prev]);
      toast.success(`Voucher claimed: ${code} 🎉`);
    } catch {
      toast.error("Failed to claim voucher");
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const canClaim = points >= 100;
  const progress = Math.min((points / 100) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-md px-4 pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <Ticket className="h-5 w-5 text-primary" /> My Vouchers
        </h2>

        <div className="rounded-3xl bg-gradient-to-br from-mint to-secondary p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <img src={mascotImg} alt="Chef Buddy" width={64} height={64} className="shrink-0 drop-shadow" loading="lazy" />
            <div className="flex-1">
              {canClaim ? (
                <>
                  <p className="text-sm font-bold text-mint-foreground">
                    🎉 You have enough points!
                  </p>
                  <Button
                    onClick={claimVoucher}
                    disabled={claiming}
                    className="mt-3 w-full rounded-xl font-bold"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    {claiming ? "Claiming..." : "Claim 10% Discount"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-mint-foreground">
                    {100 - points} more points to go! 💪
                  </p>
                  <div className="mt-3">
                    <Progress value={progress} className="h-3 rounded-full" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {points}/100 points
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <h3 className="mt-8 mb-3 text-sm font-bold text-foreground">Claimed Vouchers</h3>
        {vouchers.length === 0 ? (
          <div className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-sm">
            No vouchers yet — keep earning points! 🎯
          </div>
        ) : (
          <div className="space-y-2">
            {vouchers.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
                <div>
                  <p className="font-mono text-sm font-bold text-card-foreground">{v.code}</p>
                  <p className="text-xs text-muted-foreground">10% Discount</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  v.status === "active"
                    ? "bg-mint text-mint-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}