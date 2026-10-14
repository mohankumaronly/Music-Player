import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ListMusic, Play } from "lucide-react";
import {
  usePublicPlaylist,
  usePublicPlaylistSongs,
} from "../hooks/usePlaylists";
import { SongRow } from "../components/songs/SongRow";
import { SongListSkeleton } from "../components/songs/SongListSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { hashGradient, truncate } from "../lib/format";
import { usePlayerStore } from "../store/playerStore";

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const playlistQuery = usePublicPlaylist(id);
  const songsQuery = usePublicPlaylistSongs(id, { page: 0, size: 100 });

  const playQueue = usePlayerStore((s) => s.playQueue);

  const playlist = playlistQuery.data;
  const songs = songsQuery.data?.content ?? [];

  const gradient = hashGradient(id ?? "seed");

  const handlePlayAll = () => {
    if (songs.length > 0) playQueue(songs, 0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        to="/playlists"
        className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to playlists
      </Link>

      {/* Header */}
      {playlistQuery.isLoading ? (
        <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="skeleton h-40 w-40 rounded-2xl" />
          <div className="flex-1 w-full space-y-3">
            <div className="skeleton h-6 w-64 rounded-md" />
            <div className="skeleton h-4 w-96 rounded-md" />
            <div className="skeleton h-10 w-32 rounded-lg" />
          </div>
        </div>
      ) : playlistQuery.isError || !playlist ? (
        <EmptyState
          icon={ListMusic}
          title="Playlist not found"
          description="This playlist doesn't exist or is not public."
          action={
            <Link to="/playlists">
              <Button variant="gradient">Browse playlists</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
          {/* Cover */}
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl shadow-xl">
            {playlist.coverUrl ? (
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="grid h-full w-full place-items-center text-white/80"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                }}
              >
                <ListMusic className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
              Playlist
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
              {truncate(playlist.name, 80)}
            </h1>
            {playlist.description && (
              <p className="mt-2 max-w-2xl text-sm text-[rgb(var(--text-secondary))]">
                {playlist.description}
              </p>
            )}
            <div className="mt-3 text-xs text-[rgb(var(--text-tertiary))]">
              {songs.length} song{songs.length === 1 ? "" : "s"}
              {!playlist.isPublic && " · Private"}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button
                variant="gradient"
                leftIcon={<Play className="h-4 w-4 fill-white" />}
                onClick={handlePlayAll}
                disabled={songs.length === 0}
              >
                Play all
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Songs */}
      <div className="mt-10">
        {songsQuery.isLoading && <SongListSkeleton count={8} />}

        {!songsQuery.isLoading && songs.length === 0 && (
          <EmptyState
            icon={ListMusic}
            title="This playlist is empty"
            description="Songs will appear here once added."
          />
        )}

        {!songsQuery.isLoading && songs.length > 0 && (
          <div className="flex flex-col">
            {songs.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                context={songs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}