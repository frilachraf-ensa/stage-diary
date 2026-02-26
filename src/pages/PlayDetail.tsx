import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StarRating from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Play = Tables<"plays">;
type Review = Tables<"reviews"> & { profiles: { display_name: string | null; avatar_url: string | null } | null };

export default function PlayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [play, setPlay] = useState<Play | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myContent, setMyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!id) return;
    const { data: playData } = await supabase.from("plays").select("*").eq("id", id).single();
    setPlay(playData);

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*, profiles!reviews_user_id_fkey(display_name, avatar_url)")
      .eq("play_id", id)
      .order("created_at", { ascending: false });
    setReviews((reviewsData as any) ?? []);

    if (user) {
      const { data: fav } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("play_id", id).maybeSingle();
      setIsFavorite(!!fav);
      const { data: wl } = await supabase.from("watchlist").select("id").eq("user_id", user.id).eq("play_id", id).maybeSingle();
      setIsWatchlisted(!!wl);
      const existing = reviewsData?.find((r: any) => r.user_id === user.id);
      if (existing) {
        setMyRating(existing.rating ?? 0);
        setMyContent(existing.content ?? "");
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id, user]);

  const toggleFavorite = async () => {
    if (!user || !id) return;
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("play_id", id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, play_id: id });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  const toggleWatchlist = async () => {
    if (!user || !id) return;
    if (isWatchlisted) {
      await supabase.from("watchlist").delete().eq("user_id", user.id).eq("play_id", id);
      setIsWatchlisted(false);
      toast.success("Removed from watchlist");
    } else {
      await supabase.from("watchlist").insert({ user_id: user.id, play_id: id });
      setIsWatchlisted(true);
      toast.success("Added to watchlist");
    }
  };

  const submitReview = async () => {
    if (!user || !id || myRating === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { user_id: user.id, play_id: id, rating: myRating, content: myContent || null },
      { onConflict: "user_id,play_id" }
    );
    if (error) toast.error("Failed to save review");
    else {
      toast.success("Review saved");
      await fetchAll();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!play) return <div className="container py-20 text-center text-muted-foreground">Play not found.</div>;

  return (
    <div className="container py-8">
      <Link to="/explore" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        {/* Poster */}
        <div className="w-full flex-shrink-0 md:w-56">
          <div className="aspect-[2/3] overflow-hidden rounded-md border border-border bg-secondary poster-shadow">
            {play.poster_url ? (
              <img src={play.poster_url} alt={play.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4">
                <span className="text-center text-sm text-muted-foreground">{play.title}</span>
              </div>
            )}
          </div>

          {user && (
            <div className="mt-4 flex gap-2">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={toggleFavorite}
                className="flex-1"
              >
                <Heart className={`mr-1 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Liked" : "Like"}
              </Button>
              <Button
                variant={isWatchlisted ? "default" : "outline"}
                size="sm"
                onClick={toggleWatchlist}
                className="flex-1"
              >
                <Eye className={`mr-1 h-4 w-4`} />
                {isWatchlisted ? "Listed" : "Watchlist"}
              </Button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{play.title}</h1>
          <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
            {play.year && <span>{play.year}</span>}
            {play.playwright && <span>by {play.playwright}</span>}
            {play.genre && <span className="rounded bg-secondary px-2 py-0.5 text-xs">{play.genre}</span>}
          </div>
          {play.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{play.description}</p>
          )}

          {/* Write review */}
          {user && (
            <div className="mt-8 rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Review</h3>
              <StarRating rating={myRating} onChange={setMyRating} size="md" />
              <Textarea
                placeholder="What did you think?"
                value={myContent}
                onChange={(e) => setMyContent(e.target.value)}
                rows={3}
                className="mt-3 bg-background border-border resize-none"
              />
              <Button onClick={submitReview} disabled={submitting || myRating === 0} size="sm" className="mt-3">
                {submitting ? "Saving..." : "Save review"}
              </Button>
            </div>
          )}

          {/* Reviews list */}
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={r.profiles?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-secondary text-xs">{r.profiles?.display_name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{r.profiles?.display_name ?? "Anonymous"}</span>
                    </div>
                    {r.rating && <div className="mt-1"><StarRating rating={r.rating} readonly /></div>}
                    {r.content && <p className="mt-2 text-sm text-muted-foreground">{r.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
