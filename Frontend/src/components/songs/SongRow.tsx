import { Pause, Play } from "lucide-react";
import type { Song } from "../../api/types";
import { SongCover } from "./SongCover";
import { cn } from "../../lib/cn";
import { formatDuration, truncate } from "../../lib/format";
import { usePlayerStore } from "../../store/playerStore";

interface SongRowProps {
  song: Song;
  index?: number;
  context?: Song[];
  rightSlot?: React.ReactNode;
}

export function SongRow({ song, index, context, rightSlot }: SongRowProps) {
  const playSong = usePlayerStore((s) => s.playSong);
  const toggle = usePlayerStore((s) => s.toggle);
  const current = usePlayerStore((s) => s.current());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isCurrent = current?.id === song.id;

  const handleClick = () => {
    if (isCurrent) toggle();
    else playSong(song, context);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        "hover:bg-[rgb(var(--bg-muted))]",
        isCurrent && "bg-[rgb(var(--bg-muted))]"
      )}
    >
      {/* Index / Play toggle */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
        className="relative grid h-8 w-8 shrink-0 place-items-center text-sm tabular-nums text-[rgb(var(--text-tertiary))]"
      >
        {typeof index === "number" && (
          <span className="group-hover:opacity-0 transition-opacity">
            {index + 1}
          </span>
        )}
        <span
          className={cn(
            "absolute inset-0 grid place-items-center opacity-0 transition-opacity",
            "group-hover:opacity-100",
            isCurrent && "opacity-100"
          )}
        >
          {isCurrent && isPlaying ? (
            <Pause className="h-4 w-4 text-brand-500 fill-brand-500" />
          ) : (
            <Play
              className={cn(
                "h-4 w-4 fill-current",
                isCurrent ? "text-brand-500" : "text-[rgb(var(--text-primary))]"
              )}
            />
          )}
        </span>
      </button>

      {/* Cover */}
      <SongCover
        src={song.coverUrl}
        alt={song.title}
        seed={song.id}
        size="sm"
      />

      {/* Title + artist */}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-sm font-medium",
            isCurrent && "text-brand-500"
          )}
          title={song.title}
        >
          {truncate(song.title, 60)}
        </div>
        <div className="truncate text-xs text-[rgb(var(--text-secondary))]">
          {truncate(song.artistName, 60)}
        </div>
      </div>

      {/* Genre / album (desktop) */}
      <div className="hidden lg:block w-40 truncate text-xs text-[rgb(var(--text-tertiary))]">
        {song.albumName ?? song.genre ?? "—"}
      </div>

      {/* Duration */}
      <div className="hidden sm:block w-14 text-right text-xs tabular-nums text-[rgb(var(--text-tertiary))]">
        {formatDuration(song.durationSeconds)}
      </div>

      {/* Right slot (admin actions) */}
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}