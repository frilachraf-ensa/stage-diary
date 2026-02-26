import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PlayCard from "@/components/PlayCard";
import StarRating from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Play = Tables<"plays">;

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [favorites, setFavorites] = useState<Play[]>([]);
  const [watchlistPlays, setWatchlistPlays] = useState<Play[]>([]);
  const [reviews, setReviews] = useState<(Tables<"reviews"> & { plays: Pick<Play, "title" | "id"> | null })[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("play_id, plays(*)").eq("user_id", user.id).then(({ data }) => {
      setFavorites((data?.map((f: any) => f.plays).filter(Boolean) ?? []) as Play[]);
    });
    supabase.from("watchlist").select("play_id, plays(*)").eq("user_id", user.id).then(({ data }) => {
      setWatchlistPlays((data?.map((w: any) => w.plays).filter(Boolean) ?? []) as Play[]);
    });
    supabase.from("reviews").select("*, plays(title, id)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setReviews((data as any) ?? []);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName, bio }).eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Profile updated");
      await refreshProfile();
    }
    setSaving(false);
  };

  if (loading || !user) return null;

  return (
    <div className="container py-8">
      {/* Profile header */}
      <div className="mb-8 flex flex-col items-center gap-4 md:flex-row md:items-start">
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-secondary text-xl">{profile?.display_name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3 w-full max-w-md">
          <Input
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-card border-border"
          />
          <Textarea
            placeholder="Write a short bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="bg-card border-border resize-none"
          />
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-6 bg-secondary">
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist ({watchlistPlays.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No favorites yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {favorites.map((p) => <PlayCard key={p.id} play={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="watchlist">
          {watchlistPlays.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Your watchlist is empty.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {watchlistPlays.map((p) => <PlayCard key={p.id} play={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <a href={`/play/${r.play_id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                    {r.plays?.title}
                  </a>
                  {r.rating && <div className="mt-1"><StarRating rating={r.rating} readonly /></div>}
                  {r.content && <p className="mt-2 text-sm text-muted-foreground">{r.content}</p>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
