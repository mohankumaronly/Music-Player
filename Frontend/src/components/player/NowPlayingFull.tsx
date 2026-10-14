import { useCallback, useEffect, useRef } from "react";
import {
  ChevronDown,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { SongCover } from "../songs/SongCover";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { formatDuration, truncate } from "../../lib/format";
import { API_BASE_URL } from "../../lib/constants";
import { cn } from "../../lib/cn";

interface NowPlayingFullProps {
  open: boolean;
  onClose: () => void;
}

function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function NowPlayingFull({ open, onClose }: NowPlayingFullProps) {
  const current = usePlayerStore((s) => s.current());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  // Debounced toggle
  const toggleLockRef = useRef(false);
  const safeToggle = useCallback(() => {
    if (toggleLockRef.current) return;
    toggleLockRef.current = true;
    toggle();
    setTimeout(() => {
      toggleLockRef.current = false;
    }, 150);
  }, [toggle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!current) return null;

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  const coverUrl = resolveUrl(current.coverUrl);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col overflow-hidden",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
    >
      {/* Blurred cover backdrop */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: "blur(80px) saturate(200%) brightness(0.7)",
                transform: "scale(1.4)",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: "blur(30px) saturate(150%) brightness(0.85)",
                transform: "scale(1.15)",
                opacity: 0.9,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </>
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(900px circle at 30% 30%, rgba(99,102,241,0.6), transparent 60%)," +
                "radial-gradient(900px circle at 70% 70%, rgba(217,70,239,0.6), transparent 60%)",
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/35" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-4 h-14 text-white shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
        <span className="text-xs uppercase tracking-wider text-white/70">
          Now playing
        </span>
        <div className="w-9" />
      </header>

      {/* Cover */}
      <div className="relative flex-1 grid place-items-center px-6 min-h-0">
        <div className="w-full max-w-sm">
          <SongCover
            src={current.coverUrl}
            alt={current.title}
            seed={current.id}
            size="lg"
            className="shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>

      {/* Info + controls */}
      <div className="relative px-6 pb-8 pt-4 max-w-md mx-auto w-full text-white shrink-0">
        <div className="text-center mb-6">
          <div className="text-lg font-semibold truncate" title={current.title}>
            {truncate(current.title, 60)}
          </div>
          <div className="text-sm text-white/70 truncate">
            {truncate(current.artistName, 60)}
          </div>
        </div>

        <SeekBar
          value={progress}
          max={duration || current.durationSeconds || 0}
          onChange={seek}
        />
        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-white/60">
          <span>{formatDuration(progress)}</span>
          <span>{formatDuration(duration || current.durationSeconds || 0)}</span>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleShuffle}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-md transition-colors",
              shuffle ? "text-brand-400" : "text-white/70 hover:text-white"
            )}
            aria-label="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={prev}
            className="grid h-12 w-12 place-items-center rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="h-6 w-6 fill-current" />
          </button>

          {/* Play/pause with crossfade */}
          <button
            type="button"
            onClick={safeToggle}
            className="relative grid h-16 w-16 place-items-center rounded-full btn-gradient shadow-lg text-white overflow-hidden"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span
              className={cn(
                "absolute inset-0 grid place-items-center transition-opacity duration-150",
                isPlaying ? "opacity-100" : "opacity-0"
              )}
            >
              <Pause className="h-7 w-7 fill-white" />
            </span>
            <span
              className={cn(
                "absolute inset-0 grid place-items-center transition-opacity duration-150",
                isPlaying ? "opacity-0" : "opacity-100"
              )}
            >
              <Play className="h-7 w-7 fill-white ml-0.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={next}
            className="grid h-12 w-12 place-items-center rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label="Next"
          >
            <SkipForward className="h-6 w-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-md transition-colors",
              repeat !== "off"
                ? "text-brand-400"
                : "text-white/70 hover:text-white"
            )}
            aria-label="Repeat"
          >
            <RepeatIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}