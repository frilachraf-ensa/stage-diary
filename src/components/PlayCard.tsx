import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Play = Tables<"plays">;

export default function PlayCard({ play }: { play: Play }) {
  return (
    <Link to={`/play/${play.id}`} className="group block hover-lift">
      <div className="aspect-[2/3] overflow-hidden rounded-md border border-border bg-secondary poster-shadow">
        {play.poster_url ? (
          <img
            src={play.poster_url}
            alt={play.title}
            className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary p-4">
            <span className="text-center text-sm text-muted-foreground">{play.title}</span>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {play.title}
        </h3>
        {play.year && (
          <p className="text-xs text-muted-foreground">{play.year}</p>
        )}
      </div>
    </Link>
  );
}
