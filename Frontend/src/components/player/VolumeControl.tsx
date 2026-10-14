import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { useState } from "react";
import { usePlayerStore } from "../../store/playerStore";
import { cn } from "../../lib/cn";

export function VolumeControl({ className }: { className?: string }) {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const [hoverOpen, setHoverOpen] = useState(false);

  const effective = muted ? 0 : volume;
  const Icon = effective === 0 ? VolumeX : effective < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <button
        type="button"
        onClick={toggleMute}
        className="grid h-8 w-8 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        <Icon className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          hoverOpen ? "w-24 opacity-100" : "w-0 opacity-0"
        )}
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effective}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 cursor-pointer accent-brand-500"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}