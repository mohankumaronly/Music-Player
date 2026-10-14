import { Link } from "react-router-dom";
import { ListMusic } from "lucide-react";
import type { Playlist } from "../../api/types";
import { hashGradient, truncate } from "../../lib/format";
import { cn } from "../../lib/cn";

interface PlaylistCardProps {
  playlist: Playlist;
  /**
   * Where the card should link. Defaults to the public playlist page.
   * Admin pages pass `/admin/playlists/{id}`.
   */
  to?: string;
  className?: string;
}

export function PlaylistCard({ playlist, to, className }: PlaylistCardProps) {
  const gradient = hashGradient(playlist.id);
  const href = to ?? `/playlists/${playlist.id}`;

  return (
    <Link
      to={href}
      className={cn(
        "group block rounded-xl p-3 surface transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center text-white/80"
            style={{
              backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            }}
          >
            <ListMusic className="h-10 w-10" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="mt-3 min-w-0">
        <div className="truncate text-sm font-medium" title={playlist.name}>
          {truncate(playlist.name, 40)}
        </div>
        <div className="mt-0.5 truncate text-xs text-[rgb(var(--text-secondary))]">
          {playlist.songCount ?? 0} song
          {(playlist.songCount ?? 0) === 1 ? "" : "s"}
        </div>
      </div>
    </Link>
  );
}