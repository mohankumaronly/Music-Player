import { useState } from "react";
import { Music2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useSongs } from "../hooks/useSongs";
import { usePublicPlaylists } from "../hooks/usePlaylists";
import { SongGrid } from "../components/songs/SongGrid";
import { SongGridSkeleton } from "../components/songs/SongGridSkeleton";
import { PlaylistGrid } from "../components/playlists/PlaylistGrid";
import { PlaylistGridSkeleton } from "../components/playlists/PlaylistGridSkeleton";
import { SectionHeader } from "../components/songs/SectionHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Pagination } from "../components/songs/Pagination";
import { Button } from "../components/ui/Button";

export function DiscoverPage() {
  const [page, setPage] = useState(0);

  const songsQuery = useSongs({ page, size: 18, sort: "createdAt,desc" });
  const playlistsQuery = usePublicPlaylists({ page: 0, size: 6 });

  const songs = songsQuery.data?.content ?? [];
  const totalPages = songsQuery.data?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Hero strip — glass, picks up ambient colors behind it */}
      <section className="mb-10 overflow-hidden rounded-2xl glass p-6 sm:p-8 relative">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full surface-muted px-2.5 py-1 text-[11px] uppercase tracking-wider text-[rgb(var(--text-secondary))]">
            <Sparkles className="h-3 w-3 text-brand-500" />
            New this week
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            Discover something <span className="text-gradient-brand">new</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[rgb(var(--text-secondary))]">
            Fresh uploads, curated playlists, and zero ads. Press play and let it ride.
          </p>
        </div>
      </section>

      {/* Playlists */}
      {(playlistsQuery.isLoading || (playlistsQuery.data?.content?.length ?? 0) > 0) && (
        <section className="mb-12">
          <SectionHeader
            title="Featured playlists"
            subtitle="Hand-picked collections"
            viewAllHref="/playlists"
          />
          {playlistsQuery.isLoading ? (
            <PlaylistGridSkeleton count={6} />
          ) : (
            <PlaylistGrid playlists={playlistsQuery.data!.content} />
          )}
        </section>
      )}

      {/* Songs */}
      <section>
        <SectionHeader
          title="Latest songs"
          subtitle="Straight from the studio"
        />

        {songsQuery.isLoading && <SongGridSkeleton count={18} />}

        {songsQuery.isError && (
          <EmptyState
            icon={Music2}
            title="Couldn't load songs"
            description="Something went wrong while fetching songs. Please try again."
            action={
              <Button variant="gradient" onClick={() => songsQuery.refetch()}>
                Retry
              </Button>
            }
          />
        )}

        {!songsQuery.isLoading && !songsQuery.isError && songs.length === 0 && (
          <EmptyState
            icon={Music2}
            title="No songs yet"
            description="Once you upload music in the admin panel, it'll appear here."
            action={
              <Link to="/admin/login">
                <Button variant="gradient">Go to admin</Button>
              </Link>
            }
          />
        )}

        {!songsQuery.isLoading && songs.length > 0 && (
          <>
            <SongGrid songs={songs} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}