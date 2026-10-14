import { useState } from "react";
import { Library, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useAdminPlaylistsList,
  useDeletePlaylist,
} from "../../hooks/useAdminPlaylists";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PlaylistCard } from "../../components/playlists/PlaylistCard";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PlaylistFormModal } from "../../components/admin/PlaylistFormModal";
import type { Playlist } from "../../api/types";
import { truncate } from "../../lib/format";

export function AdminPlaylistsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [deletePlaylist, setDeletePlaylist] = useState<Playlist | null>(null);

  // ✅ Admin endpoint — includes private playlists
  const query = useAdminPlaylistsList({ page: 0, size: 100 });
  const deleteMutation = useDeletePlaylist();

  const playlists = query.data?.content ?? [];

  const handleConfirmDelete = async () => {
    if (!deletePlaylist) return;
    try {
      await deleteMutation.mutateAsync(deletePlaylist.id);
      setDeletePlaylist(null);
    } catch {
      /* toast in hook */
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            {playlists.length} playlist{playlists.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="gradient"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setCreateOpen(true)}
          >
            New playlist
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {query.isLoading ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl p-3 surface">
                <div className="skeleton aspect-square w-full rounded-xl" />
                <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                <div className="skeleton mt-1.5 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <EmptyState
            icon={Library}
            title="No playlists yet"
            description="Create your first playlist to organize songs."
            action={
              <Button
                variant="gradient"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setCreateOpen(true)}
              >
                Create playlist
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {playlists.map((p) => (
              <div key={p.id} className="relative group">
                {/* ✅ Card links to the ADMIN editor */}
                <PlaylistCard playlist={p} to={`/admin/playlists/${p.id}`} />

                {/* Hover actions — floating above the card */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditPlaylist(p);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-md glass text-[rgb(var(--text-primary))] hover:bg-brand-500/20"
                    aria-label={`Edit ${p.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletePlaylist(p);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-md glass text-[rgb(var(--text-primary))] hover:bg-red-500/20 hover:text-red-500"
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!p.isPublic && (
                  <span className="absolute top-2 left-2 z-10 text-[10px] uppercase tracking-wider rounded-full bg-amber-500/90 text-white px-2 py-0.5 font-medium">
                    Private
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PlaylistFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <PlaylistFormModal
        open={!!editPlaylist}
        playlist={editPlaylist}
        onClose={() => setEditPlaylist(null)}
      />
      <ConfirmDialog
        open={!!deletePlaylist}
        onClose={() => setDeletePlaylist(null)}
        onConfirm={handleConfirmDelete}
        title="Delete playlist?"
        description={
          deletePlaylist
            ? `"${truncate(deletePlaylist.name, 60)}" will be permanently removed. Songs inside it won't be deleted.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}