import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Search, User, LogOut, Shield, Theater } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, profile, isAdmin, signInWithGoogle, signOut, loading } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Theater className="h-5 w-5 text-primary" />
            <span className="text-lg tracking-tight">Stageboxd</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive("/explore") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/explore" className="text-muted-foreground hover:text-foreground md:hidden">
            <Search className="h-5 w-5" />
          </Link>

          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {profile?.display_name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={signInWithGoogle} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
