import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PlayCard from "@/components/PlayCard";
import StarRating from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Theater } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Play = Tables<"plays">;
type Review = Tables<"reviews"> & { plays: Pick<Play, "title" | "id"> | null; profiles: { display_name: string | null; avatar_url: string | null } | null };

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth();
  const [popularPlays, setPopularPlays] = useState<Play[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [recentPlays, setRecentPlays] = useState<Play[]>([]);

  useEffect(() => {
    supabase.from("plays").select("*").order("created_at", { ascending: false }).limit(12).then(({ data }) => {
      setRecentPlays(data ?? []);
    });
    supabase.from("plays").select("*").limit(6).then(({ data }) => {
      setPopularPlays(data ?? []);
    });
    supabase.from("reviews").select("*, plays(title, id), profiles!reviews_user_id_fkey(display_name, avatar_url)").order("created_at", { ascending: false }).limit(6).then(({ data }) => {
      setRecentReviews((data as any) ?? []);
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="container text-center">
          <div className="mx-auto max-w-2xl animate-fade-in">
            <Theater className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Track plays you've watched.
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Save those you want to see. Tell your friends what's good.
            </p>
            {!user && (
              <button
                onClick={signInWithGoogle}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started — it's free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Popular plays */}
      {popularPlays.length > 0 && (
        <section className="container py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Popular Plays</h2>
            <Link to="/explore" className="text-sm text-primary hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {popularPlays.map((p) => <PlayCard key={p.id} play={p} />)}
          </div>
        </section>
      )}

      {/* Recent reviews */}
      {recentReviews.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-6 text-lg font-semibold uppercase tracking-wider text-muted-foreground">Recent Reviews</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentReviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={r.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-secondary text-xs">{r.profiles?.display_name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{r.profiles?.display_name ?? "Anonymous"}</span>
                </div>
                <Link to={`/play/${r.play_id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  {r.plays?.title}
                </Link>
                {r.rating && <div className="mt-1"><StarRating rating={r.rating} readonly size="sm" /></div>}
                {r.content && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.content}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently added */}
      {recentPlays.length > 0 && (
        <section className="container py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Recently Added</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {recentPlays.map((p) => <PlayCard key={p.id} play={p} />)}
          </div>
        </section>
      )}

      {popularPlays.length === 0 && recentPlays.length === 0 && (
        <section className="container py-20 text-center">
          <p className="text-muted-foreground">No plays yet. Check back soon!</p>
        </section>
      )}
    </div>
  );
}
