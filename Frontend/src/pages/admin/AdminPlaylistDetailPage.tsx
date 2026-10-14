import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ListMusic,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useAddSongToPlaylist,
  useAdminPlaylistDetail,
  useAdminPlaylistSongs,
  useRemoveSongFromPlaylist,
  useReorderPlaylistSongs,
} from "../../hooks/useAdminPlaylists";
import { useAdminSongsList } from "../../hooks/useAdminSongs";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { SongCover } from "../../components/songs/SongCover";
import { SongListSkeleton } from "../../components/songs/SongListSkeleton";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PlaylistFormModal } from "../../components/admin/PlaylistFormModal";
import { formatDuration, truncate } from "../../lib/format";
import type { Song } from "../../api/types";

export function AdminPlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ✅ Admin endpoints — work for public AND private playlists
  const playlistQuery = useAdminPlaylistDetail(id);
  const songsQuery = useAdminPlaylistSongs(id, { page: 0, size: 200 });

  const addSong = useAddSongToPlaylist(id ?? "");
  const removeSong = useRemoveSongFromPlaylist(id ?? "");
  const reorder = useReorderPlaylistSongs(id ?? "");

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Song | null>(null);

  const playlist = playlistQuery.data;
  const songs = songsQuery.data?.content ?? [];

  const handleMove = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= songs.length) return;
    const ids = songs.map((s) => s.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    reorder.mutate({ songIds: ids });
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeSong.mutateAsync(removeTarget.id);
      setRemoveTarget(null);
    } catch {
      /* toast in hook */
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/admin/playlists")}
        className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to playlists
      </button>

      {/* Header */}
      {playlistQuery.isLoading ? (
        <div className="mt-6 space-y-3">
          <div className="skeleton h-7 w-64 rounded-md" />
          <div className="skeleton h-4 w-96 rounded-md" />
        </div>
      ) : playlist ? (
        <div className="mt-6 flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {truncate(playlist.name, 80)}
            </h1>
            {playlist.description && (
              <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
                {playlist.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-[rgb(var(--text-tertiary))]">
              <span>
                {songs.length} song{songs.length === 1 ? "" : "s"}
              </span>
              <span>·</span>
              <span>{playlist.isPublic ? "Public" : "Private"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit details
            </Button>
            <Button
              variant="gradient"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setAddOpen(true)}
            >
              Add songs
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ListMusic}
          title="Playlist not found"
          description="This playlist doesn't exist or was deleted."
          action={
            <Link to="/admin/playlists">
              <Button variant="gradient">Back to playlists</Button>
            </Link>
          }
        />
      )}

      {/* Songs */}
      <div className="mt-8 rounded-xl surface overflow-hidden">
        {songsQuery.isLoading ? (
          <SongListSkeleton count={5} />
        ) : songs.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title="No songs yet"
            description="Add songs from your library to build this playlist."
            action={
              <Button
                variant="gradient"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setAddOpen(true)}
              >
                Add songs
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-[rgb(var(--border-subtle))]">
            {songs.map((song, i) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[rgb(var(--bg-muted))]/40 transition-colors"
              >
                {/* Reorder controls */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0 || reorder.isPending}
                    className="grid h-4 w-4 place-items-center text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(i, 1)}
                    disabled={i === songs.length - 1 || reorder.isPending}
                    className="grid h-4 w-4 place-items-center text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <span className="w-6 text-center text-xs tabular-nums text-[rgb(var(--text-tertiary))]">
                  {i + 1}
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
                  onClick={() => setRemoveTarget(song)}
                  className="grid h-8 w-8 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label={`Remove ${song.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {playlist && (
        <PlaylistFormModal
          open={editOpen}
          playlist={playlist}
          onClose={() => setEditOpen(false)}
        />
      )}

      <AddSongsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingIds={songs.map((s) => s.id)}
        onAdd={(songId) => addSong.mutate({ songId })}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
        title="Remove song?"
        description={
          removeTarget
            ? `"${removeTarget.title}" will be removed from this playlist. The song itself won't be deleted.`
            : ""
        }
        confirmLabel="Remove"
        variant="danger"
        isLoading={removeSong.isPending}
      />
    </div>
  );
}

/* ============================================================
   Add Songs Modal
   ============================================================ */
function AddSongsModal({
  open,
  onClose,
  existingIds,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  existingIds: string[];
  onAdd: (songId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const listQuery = useAdminSongsList({ page: 0, size: 200 });
  const allSongs = listQuery.data?.content ?? [];

  const existingSet = new Set(existingIds);
  const filtered = allSongs.filter((s) => {
    if (existingSet.has(s.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artistName.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add songs"
      description="Pick tracks from your library to add to this playlist."
      size="lg"
    >
      <div className="p-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or artist…"
          className="mb-4 h-10 w-full rounded-lg surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
        />

        {listQuery.isLoading ? (
          <SongListSkeleton count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title={search ? "No matches" : "All songs already added"}
            description={
              search
                ? "Try a different search term."
                : "Every song from your library is already in this playlist."
            }
          />
        ) : (
          <div className="max-h-[50vh] overflow-y-auto -mx-1">
            {filtered.map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => onAdd(song.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[rgb(var(--bg-muted))] transition-colors"
              >
                <SongCover
                  src={song.coverUrl}
                  alt={song.title}
                  seed={song.id}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {song.title}
                  </div>
                  <div className="truncate text-xs text-[rgb(var(--text-secondary))]">
                    {song.artistName}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-[rgb(var(--text-tertiary))]" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}