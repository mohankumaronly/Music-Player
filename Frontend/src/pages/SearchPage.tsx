import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Music2, Search as SearchIcon, X } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchSongs } from "../hooks/useSongs";
import { SongGrid } from "../components/songs/SongGrid";
import { SongGridSkeleton } from "../components/songs/SongGridSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebounce(q.trim(), 350);
  const hasQuery = debounced.length > 0;

  // Sync URL
  useEffect(() => {
    if (hasQuery) setParams({ q: debounced }, { replace: true });
    else if (initialQ) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchQuery = useSearchSongs(
    useMemo(() => ({ q: debounced, page: 0, size: 24 }), [debounced]),
    hasQuery
  );

  const songs = searchQuery.data?.content ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
        Find songs by title, artist, album, or genre.
      </p>

      {/* Search input */}
      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to search…"
          className="h-12 w-full rounded-xl surface pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
          aria-label="Search songs"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-8">
        {!hasQuery && (
          <EmptyState
            icon={SearchIcon}
            title="Start typing to search"
            description="Results will appear here as you type. Minimum one character."
          />
        )}

        {hasQuery && searchQuery.isLoading && <SongGridSkeleton count={12} />}

        {hasQuery && searchQuery.isError && (
          <EmptyState
            icon={Music2}
            title="Search failed"
            description="Something went wrong. Please try again."
            action={
              <Button variant="gradient" onClick={() => searchQuery.refetch()}>
                Retry
              </Button>
            }
          />
        )}

        {hasQuery &&
          !searchQuery.isLoading &&
          !searchQuery.isError &&
          songs.length === 0 && (
            <EmptyState
              icon={Music2}
              title={`No results for "${debounced}"`}
              description="Try a different keyword, artist, or genre."
            />
          )}

        {hasQuery && !searchQuery.isLoading && songs.length > 0 && (
          <>
            <div className="mb-4 text-sm text-[rgb(var(--text-secondary))]">
              {searchQuery.data!.totalElements} result
              {searchQuery.data!.totalElements === 1 ? "" : "s"} for{" "}
              <span className="text-[rgb(var(--text-primary))] font-medium">
                "{debounced}"
              </span>
            </div>
            <SongGrid songs={songs} />
          </>
        )}
      </div>
    </div>
  );
}