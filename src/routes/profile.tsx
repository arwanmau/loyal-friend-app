import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut, Save } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — LoyaltyBuddy" },
      { name: "description", content: "Manage your LoyaltyBuddy profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<{ points: number; email: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("display_name, points, email")
        .eq("id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || "");
        setProfileData({ points: data.points, email: data.email });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated! 🎉");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

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
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <User className="h-5 w-5 text-primary" /> My Profile
        </h2>

        <div className="flex flex-col items-center rounded-3xl bg-card p-6 shadow-md">
          <img src={mascotImg} alt="Chef Buddy" width={80} height={80} className="drop-shadow-lg" loading="lazy" />
          <p className="mt-2 text-xl font-extrabold text-card-foreground">
            {displayName || user.email?.split("@")[0] || "Foodie"}
          </p>
          <p className="text-sm text-muted-foreground">{profileData?.email}</p>
          <div className="mt-2 rounded-full bg-primary px-4 py-1">
            <span className="text-sm font-bold text-primary-foreground">
              {profileData?.points ?? 0} pts ⭐
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-card p-4 shadow-sm">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl font-bold">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="mt-4 w-full rounded-xl font-bold text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}