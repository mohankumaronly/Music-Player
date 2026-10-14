import type { Song } from "../../api/types";
import { SongCard } from "./SongCard";
import { cn } from "../../lib/cn";

interface SongGridProps {
  songs: Song[];
  className?: string;
}

export function SongGrid({ songs, className }: SongGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {songs.map((song) => (
        <SongCard key={song.id} song={song} context={songs} />
      ))}
    </div>
  );
}