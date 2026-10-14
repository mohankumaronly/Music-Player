import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableSongRow } from "./SortableSongRow";
import type { Song } from "../../api/types";

interface SortableSongListProps {
  songs: Song[];
  onReorder: (ids: string[]) => void;
  onRemove: (song: Song) => void;
  disabled?: boolean;
}

export function SortableSongList({
  songs,
  onReorder,
  onRemove,
  disabled,
}: SortableSongListProps) {
  const [items, setItems] = useState(songs);

  // Sync from props when they change (refetch, add, remove)
  useEffect(() => {
    setItems(songs);
  }, [songs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // small movement = click, not drag
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);

    setItems(next);                    // optimistic
    onReorder(next.map((s) => s.id));  // persist
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={items.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-[rgb(var(--border-subtle))]">
          {items.map((song, i) => (
            <SortableSongRow
              key={song.id}
              song={song}
              index={i}
              onRemove={onRemove}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}