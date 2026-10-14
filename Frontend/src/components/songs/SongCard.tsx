import { Play } from "lucide-react";
import type { Song } from "../../api/types";
import { SongCover } from "./SongCover";
import { cn } from "../../lib/cn";
import { truncate } from "../../lib/format";
import { usePlayerStore } from "../../store/playerStore";

interface SongCardProps {
  song: Song;
  context?: Song[];
  className?: string;
}

export function SongCard({ song, context, className }: SongCardProps) {
  const playSong = usePlayerStore((s) => s.playSong);
  const current = usePlayerStore((s) => s.current());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isCurrent = current?.id === song.id;

  const handlePlay = () => playSong(song, context);

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={cn(
        "group relative flex flex-col text-left rounded-xl p-3",
        "surface transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(99,102,241,0.35)]",
        "hover:border-brand-500/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60",
        isCurrent && "ring-1 ring-brand-500/50 border-brand-500/40",
        className
      )}
    >
      {/* Hover ambient glow behind the card */}
      <span
        className={cn(
          "pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-300",
          "bg-gradient-to-br from-brand-500/40 via-accent-500/30 to-brand-500/40",
          "group-hover:opacity-100",
          isCurrent && "opacity-100"
        )}
        aria-hidden
      />

      {/* Cover + play overlay */}
      <div className="relative w-full">
        <SongCover
          src={song.coverUrl}
          alt={song.title}
          seed={song.id}
          size="lg"
        />
        <div
          className={cn(
            "absolute inset-0 grid place-items-center rounded-xl",
            "bg-black/40 opacity-0 transition-opacity",
            "group-hover:opacity-100",
            isCurrent && isPlaying && "opacity-100"
          )}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full btn-gradient shadow-lg">
            <Play className="h-5 w-5 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 min-w-0">
        <div
          className={cn(
            "text-sm font-medium truncate",
            isCurrent && "text-brand-500"
          )}
          title={song.title}
        >
          {truncate(song.title, 40)}
        </div>
        <div
          className="mt-0.5 text-xs text-[rgb(var(--text-secondary))] truncate"
          title={song.artistName}
        >
          {truncate(song.artistName, 40)}
        </div>
      </div>
    </button>
  );
}