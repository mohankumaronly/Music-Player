import { useEffect } from "react";
import { X, ListMusic, Play } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { SongCover } from "../songs/SongCover";
import { formatDuration, truncate } from "../../lib/format";
import { cn } from "../../lib/cn";
import { EmptyState } from "../ui/EmptyState";

interface QueueDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QueueDrawer({ open, onClose }: QueueDrawerProps) {
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const playQueue = usePlayerStore((s) => s.playQueue);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md",
          "glass-strong border-l border-[rgb(var(--glass-border))]",
          "flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Queue"
      >
        <header className="flex items-center gap-2 border-b border-[rgb(var(--border-subtle))] px-4 h-14">
          <ListMusic className="h-4 w-4 text-[rgb(var(--text-secondary))]" />
          <h2 className="text-sm font-semibold">Up next</h2>
          <span className="text-xs text-[rgb(var(--text-tertiary))]">
            {queue.length} song{queue.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-8 w-8 place-items-center rounded-md hover:bg-[rgb(var(--bg-muted))] transition-colors"
            aria-label="Close queue"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-2">
          {queue.length === 0 ? (
            <EmptyState
              icon={ListMusic}
              title="Queue is empty"
              description="Play a song to start building your queue."
            />
          ) : (
            <ul className="flex flex-col gap-0.5">
              {queue.map((song, i) => {
                const isCurrent = i === index;
                return (
                  <li key={`${song.id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => playQueue(queue, i)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                        isCurrent
                          ? "bg-[rgb(var(--bg-muted))]"
                          : "hover:bg-[rgb(var(--bg-muted))]"
                      )}
                    >
                      <SongCover
                        src={song.coverUrl}
                        alt={song.title}
                        seed={song.id}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "truncate text-sm font-medium",
                            isCurrent && "text-brand-500"
                          )}
                        >
                          {truncate(song.title, 50)}
                        </div>
                        <div className="truncate text-xs text-[rgb(var(--text-secondary))]">
                          {truncate(song.artistName, 50)}
                        </div>
                      </div>
                      <div className="text-xs tabular-nums text-[rgb(var(--text-tertiary))] group-hover:hidden">
                        {formatDuration(song.durationSeconds)}
                      </div>
                      <Play className="hidden h-4 w-4 text-[rgb(var(--text-primary))] group-hover:block fill-current" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}