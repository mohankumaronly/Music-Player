import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ListMusic,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { useAdminSongsList, useDeleteSong, useSetSongStatus } from "../../hooks/useAdminSongs";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SongCover } from "../../components/songs/SongCover";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { SongUploadModal } from "../../components/admin/SongUploadModal";
import { SongEditModal } from "../../components/admin/SongEditModal";
import { formatDate, formatDuration, truncate } from "../../lib/format";
import { cn } from "../../lib/cn";
import type { Song, SongStatus } from "../../api/types";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { label: string; value: SongStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Unpublished", value: "UNPUBLISHED" },
];

export function AdminSongsPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<SongStatus | "ALL">("ALL");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);

  const query = useAdminSongsList({ page, size: PAGE_SIZE });
  const statusMutation = useSetSongStatus();
  const deleteMutation = useDeleteSong();

  const allSongs = query.data?.content ?? [];
  const songs =
    filter === "ALL"
      ? allSongs
      : allSongs.filter((s) => s.status === filter);
  const totalPages = query.data?.totalPages ?? 0;
  const totalElements = query.data?.totalElements ?? 0;

  const handleConfirmDelete = async () => {
    if (!deleteSong) return;
    try {
      await deleteMutation.mutateAsync(deleteSong.id);
      setDeleteSong(null);
    } catch {
      /* toast in hook */
    }
  };

  const handleToggleStatus = async (song: Song) => {
    const next =
      song.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    try {
      await statusMutation.mutateAsync({ id: song.id, status: next });
    } catch {
      /* toast in hook */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Songs</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            {totalElements} {totalElements === 1 ? "song" : "songs"} in library
          </p>
        </div>

        <div className="ml-auto">
          <Button
            variant="gradient"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => setUploadOpen(true)}
          >
            Upload song
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-brand-600 text-white"
                : "surface text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl surface">
        {query.isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title={
              filter === "ALL" ? "No songs yet" : `No ${filter.toLowerCase()} songs`
            }
            description={
              filter === "ALL"
                ? "Upload your first track to get started."
                : "Try a different filter."
            }
            action={
              filter === "ALL" ? (
                <Button
                  variant="gradient"
                  leftIcon={<Upload className="h-4 w-4" />}
                  onClick={() => setUploadOpen(true)}
                >
                  Upload song
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setFilter("ALL")}>
                  Clear filter
                </Button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-[rgb(var(--border-subtle))]">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[60px_1fr_200px_140px_120px_180px] gap-3 px-4 py-2 text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-muted))]/40">
              <div></div>
              <div>Title</div>
              <div>Artist</div>
              <div>Status</div>
              <div>Created</div>
              <div className="text-right">Actions</div>
            </div>

            {songs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                onEdit={() => setEditSong(song)}
                onDelete={() => setDeleteSong(song)}
                onToggleStatus={() => handleToggleStatus(song)}
                statusLoading={statusMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--text-tertiary))]">
          <div>
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={page >= totalPages - 1}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SongUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      <SongEditModal
        open={!!editSong}
        song={editSong}
        onClose={() => setEditSong(null)}
      />
      <ConfirmDialog
        open={!!deleteSong}
        onClose={() => setDeleteSong(null)}
        onConfirm={handleConfirmDelete}
        title="Delete song?"
        description={
          deleteSong
            ? `"${deleteSong.title}" will be permanently removed. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function SongRow({
  song,
  onEdit,
  onDelete,
  onToggleStatus,
  statusLoading,
}: {
  song: Song;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  statusLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_200px_140px_120px_180px] gap-3 px-4 py-3 items-center hover:bg-[rgb(var(--bg-muted))]/40 transition-colors">
      <SongCover
        src={song.coverUrl}
        alt={song.title}
        seed={song.id}
        size="md"
      />

      <div className="min-w-0">
        <div className="truncate text-sm font-medium" title={song.title}>
          {truncate(song.title, 60)}
        </div>
        {song.genre && (
          <div className="text-xs text-[rgb(var(--text-tertiary))]">
            {song.genre} · {formatDuration(song.durationSeconds)}
          </div>
        )}
      </div>

      <div className="truncate text-sm text-[rgb(var(--text-secondary))]">
        {truncate(song.artistName, 40)}
      </div>

      <div>
        <StatusBadge status={song.status} />
      </div>

      <div className="text-xs text-[rgb(var(--text-tertiary))]">
        {formatDate(song.createdAt)}
      </div>

      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={statusLoading}
          className="grid h-8 w-8 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors disabled:opacity-50"
          aria-label={
            song.status === "PUBLISHED" ? "Unpublish" : "Publish"
          }
          title={song.status === "PUBLISHED" ? "Unpublish" : "Publish"}
        >
          {song.status === "PUBLISHED" ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors"
          aria-label="Edit"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="grid h-8 w-8 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}