import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

interface SeekBarProps {
  value: number; // seconds
  max: number;   // seconds
  onChange: (v: number) => void;
  className?: string;
  ariaLabel?: string;
}

export function SeekBar({
  value,
  max,
  onChange,
  className,
  ariaLabel = "Seek",
}: SeekBarProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Sync from prop when not dragging
  useEffect(() => {
    if (!dragging) setLocalValue(value);
  }, [value, dragging]);

  const pct = max > 0 ? Math.min(100, (localValue / max) * 100) : 0;

  const positionFromEvent = (clientX: number) => {
    const el = railRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * max;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (max <= 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setLocalValue(positionFromEvent(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setLocalValue(positionFromEvent(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    const next = positionFromEvent(e.clientX);
    setDragging(false);
    setLocalValue(next);
    onChange(next);
  };

  return (
    <div
      ref={railRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(localValue)}
      tabIndex={0}
      className={cn(
        "group relative h-4 w-full cursor-pointer select-none touch-none",
        className
      )}
    >
      {/* Rail */}
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[rgb(var(--border-strong))]/60" />
      {/* Fill */}
      <div
        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full btn-gradient"
        style={{ width: `${pct}%` }}
      />
      {/* Thumb */}
      <div
        className={cn(
          "absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow",
          "opacity-0 transition-opacity group-hover:opacity-100",
          dragging && "opacity-100 scale-110"
        )}
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}