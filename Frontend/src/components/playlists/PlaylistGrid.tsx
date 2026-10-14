import type { Playlist } from "../../api/types";
import { PlaylistCard } from "./PlaylistCard";
import { cn } from "../../lib/cn";

interface PlaylistGridProps {
  playlists: Playlist[];
  className?: string;
}

export function PlaylistGrid({ playlists, className }: PlaylistGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {playlists.map((p) => (
        <PlaylistCard key={p.id} playlist={p} />
      ))}
    </div>
  );
}