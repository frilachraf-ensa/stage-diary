import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlayCard from "@/components/PlayCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Play = Tables<"plays">;

export default function ExplorePage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      let query = supabase.from("plays").select("*").order("title");
      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }
      const { data } = await query.limit(60);
      setPlays(data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Explore Plays</h1>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search plays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      ) : plays.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No plays found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {plays.map((p) => <PlayCard key={p.id} play={p} />)}
        </div>
      )}
    </div>
  );
}
