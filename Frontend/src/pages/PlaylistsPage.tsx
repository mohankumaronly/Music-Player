import { useState } from "react";
import { ListMusic } from "lucide-react";
import { usePublicPlaylists } from "../hooks/usePlaylists";
import { PlaylistGrid } from "../components/playlists/PlaylistGrid";
import { PlaylistGridSkeleton } from "../components/playlists/PlaylistGridSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Pagination } from "../components/songs/Pagination";
import { Button } from "../components/ui/Button";

export function PlaylistsPage() {
  const [page, setPage] = useState(0);
  const query = usePublicPlaylists({ page, size: 24 });

  const playlists = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Playlists</h1>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
        Curated collections from the RockrangerZ library.
      </p>

      <div className="mt-8">
        {query.isLoading && <PlaylistGridSkeleton count={12} />}

        {query.isError && (
          <EmptyState
            icon={ListMusic}
            title="Couldn't load playlists"
            description="Something went wrong while fetching playlists."
            action={
              <Button variant="gradient" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          />
        )}

        {!query.isLoading && !query.isError && playlists.length === 0 && (
          <EmptyState
            icon={ListMusic}
            title="No playlists yet"
            description="Playlists will appear here once published."
          />
        )}

        {!query.isLoading && playlists.length > 0 && (
          <>
            <PlaylistGrid playlists={playlists} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}