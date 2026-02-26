import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Play = Tables<"plays">;

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [plays, setPlays] = useState<Play[]>([]);
  const [title, setTitle] = useState("");
  const [playwright, setPlaywright] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [loading, user, isAdmin]);

  const fetchPlays = async () => {
    const { data } = await supabase.from("plays").select("*").order("created_at", { ascending: false });
    setPlays(data ?? []);
  };

  useEffect(() => { if (isAdmin) fetchPlays(); }, [isAdmin]);

  const handleAdd = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("plays").insert({
      title: title.trim(),
      playwright: playwright.trim() || null,
      year: year ? parseInt(year) : null,
      genre: genre.trim() || null,
      description: description.trim() || null,
      poster_url: posterUrl.trim() || null,
    });
    if (error) toast.error("Failed to add play");
    else {
      toast.success("Play added!");
      setTitle(""); setPlaywright(""); setYear(""); setGenre(""); setDescription(""); setPosterUrl("");
      fetchPlays();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("plays").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Play deleted"); fetchPlays(); }
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Admin — Manage Plays</h1>
      </div>

      {/* Add form */}
      <div className="mb-10 max-w-lg space-y-3 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add New Play</h2>
        <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background border-border" />
        <Input placeholder="Playwright" value={playwright} onChange={(e) => setPlaywright(e.target.value)} className="bg-background border-border" />
        <div className="flex gap-3">
          <Input placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="bg-background border-border w-24" type="number" />
          <Input placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-background border-border flex-1" />
        </div>
        <Input placeholder="Poster URL" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} className="bg-background border-border" />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-background border-border resize-none" />
        <Button onClick={handleAdd} disabled={saving}>{saving ? "Adding..." : "Add Play"}</Button>
      </div>

      {/* Plays list */}
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Plays ({plays.length})</h2>
      <div className="space-y-2">
        {plays.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div>
              <span className="font-medium">{p.title}</span>
              {p.year && <span className="ml-2 text-sm text-muted-foreground">({p.year})</span>}
              {p.playwright && <span className="ml-2 text-sm text-muted-foreground">by {p.playwright}</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
