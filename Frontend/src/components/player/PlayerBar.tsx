import { useCallback, useRef, useState } from "react";
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { PlayerCover } from "./PlayerCover";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { QueueDrawer } from "./QueueDrawer";
import { NowPlayingFull } from "./NowPlayingFull";
import { formatDuration, truncate } from "../../lib/format";
import { cn } from "../../lib/cn";

export function PlayerBar() {
  const current = usePlayerStore((s) => s.current());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const queueLength = usePlayerStore((s) => s.queue.length);

  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const [queueOpen, setQueueOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  // Debounce ONLY the toggle — skip buttons should feel instant
  const toggleLockRef = useRef(false);
  const safeToggle = useCallback(() => {
    if (toggleLockRef.current) return;
    toggleLockRef.current = true;
    toggle();
    setTimeout(() => {
      toggleLockRef.current = false;
    }, 150);
  }, [toggle]);

  if (!current) return null;

  const total = duration || current.durationSeconds || 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  const openFull = () => setFullOpen(true);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      <div
        onClick={openFull}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFull();
          }
        }}
        aria-label="Open now playing"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 cursor-pointer select-none",
          "glass glass-glow-top",
          "border-t border-[rgb(var(--glass-border))]"
        )}
      >
        <div className="sm:hidden h-0.5 w-full bg-[rgb(var(--border-strong))]/40">
          <div
            className="h-full btn-gradient"
            style={{ width: total > 0 ? `${(progress / total) * 100}%` : "0%" }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-[72px] sm:h-20 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-72 text-left group">
            <PlayerCover
              src={current.coverUrl}
              alt={current.title}
              seed={current.id}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium group-hover:text-brand-500 transition-colors">
                {truncate(current.title, 40)}
              </div>
              <div className="truncate text-xs text-[rgb(var(--text-secondary))]">
                {truncate(current.artistName, 40)}
              </div>
            </div>
          </div>

          <div
            onClick={stop}
            className="hidden sm:flex flex-1 flex-col items-center gap-1 max-w-2xl cursor-default"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleShuffle}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-md transition-colors",
                  shuffle
                    ? "text-brand-500"
                    : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                )}
                aria-label="Shuffle"
              >
                <Shuffle className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={prev}
                className="grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors"
                aria-label="Previous"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>

              <button
                type="button"
                onClick={safeToggle}
                className="relative grid h-10 w-10 place-items-center rounded-full btn-gradient shadow text-white overflow-hidden"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <span
                  className={cn(
                    "absolute inset-0 grid place-items-center transition-opacity duration-150",
                    isPlaying ? "opacity-100" : "opacity-0"
                  )}
                >
                  <Pause className="h-5 w-5 fill-white" />
                </span>
                <span
                  className={cn(
                    "absolute inset-0 grid place-items-center transition-opacity duration-150",
                    isPlaying ? "opacity-0" : "opacity-100"
                  )}
                >
                  <Play className="h-5 w-5 fill-white ml-0.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={next}
                className="grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors"
                aria-label="Next"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>

              <button
                type="button"
                onClick={cycleRepeat}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-md transition-colors",
                  repeat !== "off"
                    ? "text-brand-500"
                    : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                )}
                aria-label="Repeat"
              >
                <RepeatIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex w-full items-center gap-3">
              <span className="text-[11px] tabular-nums text-[rgb(var(--text-tertiary))] w-10 text-right">
                {formatDuration(progress)}
              </span>
              <SeekBar value={progress} max={total} onChange={seek} />
              <span className="text-[11px] tabular-nums text-[rgb(var(--text-tertiary))] w-10">
                {formatDuration(total)}
              </span>
            </div>
          </div>

          <div
            onClick={stop}
            className="flex items-center gap-2 shrink-0 sm:w-72 justify-end cursor-default"
          >
            <div className="hidden sm:flex">
              <VolumeControl />
            </div>

            <button
              type="button"
              onClick={() => setQueueOpen(true)}
              className="hidden sm:grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors relative"
              aria-label="Open queue"
            >
              <ListMusic className="h-4 w-4" />
              {queueLength > 1 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-medium text-white">
                  {queueLength}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={safeToggle}
              className="sm:hidden relative grid h-11 w-11 place-items-center rounded-full btn-gradient text-white shadow overflow-hidden"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span
                className={cn(
                  "absolute inset-0 grid place-items-center transition-opacity duration-150",
                  isPlaying ? "opacity-100" : "opacity-0"
                )}
              >
                <Pause className="h-5 w-5 fill-white" />
              </span>
              <span
                className={cn(
                  "absolute inset-0 grid place-items-center transition-opacity duration-150",
                  isPlaying ? "opacity-0" : "opacity-100"
                )}
              >
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />
      <NowPlayingFull open={fullOpen} onClose={() => setFullOpen(false)} />
    </>
  );
}