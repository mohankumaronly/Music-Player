import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { SongCover } from "../songs/SongCover";
import { formatDuration, truncate } from "../../lib/format";
import { cn } from "../../lib/cn";
import type { Song } from "../../api/types";

interface SortableSongRowProps {
  song: Song;
  index: number;
  onRemove: (song: Song) => void;
  disabled?: boolean;
}

export function SortableSongRow({
  song,
  index,
  onRemove,
  disabled,
}: SortableSongRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-3 py-2 bg-[rgb(var(--bg-elevated))]",
        isDragging && "opacity-60 shadow-lg ring-1 ring-brand-500/40 rounded-lg"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        className={cn(
          "grid h-8 w-6 place-items-center cursor-grab active:cursor-grabbing",
          "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))]",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          "touch-none"
        )}
        aria-label={`Reorder ${song.title}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="w-6 text-center text-xs tabular-nums text-[rgb(var(--text-tertiary))]">
        {index + 1}
      </span>

      <SongCover
        src={song.coverUrl}
        alt={song.title}
        seed={song.id}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {truncate(song.title, 60)}
        </div>
        <div className="truncate text-xs text-[rgb(var(--text-secondary))]">
          {truncate(song.artistName, 60)}
        </div>
      </div>

      <span className="hidden sm:block w-14 text-right text-xs tabular-nums text-[rgb(var(--text-tertiary))]">
        {formatDuration(song.durationSeconds)}
      </span>

      <button
        type="button"
        onClick={() => onRemove(song)}
        className="grid h-8 w-8 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
        aria-label={`Remove ${song.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}