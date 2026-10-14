import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  FileMusic,
  Library,
  ListMusic,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAdminSongsList } from "../../hooks/useAdminSongs";
import { usePublicPlaylistsList } from "../../hooks/useAdminPlaylists";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { SongCover } from "../../components/songs/SongCover";
import { formatRelative, truncate } from "../../lib/format";
import { cn } from "../../lib/cn";
import type { Song } from "../../api/types";

export function AdminDashboardPage() {
  const email = useAuthStore((s) => s.email);

  const songsQuery = useAdminSongsList({ page: 0, size: 200 });
  const playlistsQuery = usePublicPlaylistsList({ page: 0, size: 100 });

  const songs = songsQuery.data?.content ?? [];
  const totalSongs = songsQuery.data?.totalElements ?? 0;

  const published = songs.filter((s) => s.status === "PUBLISHED").length;
  const drafts = songs.filter((s) => s.status === "DRAFT").length;
  const unpublished = songs.filter((s) => s.status === "UNPUBLISHED").length;

  const playlistCount =
    playlistsQuery.data?.totalElements ??
    playlistsQuery.data?.content?.length ??
    0;

  const recent = [...songs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Greeting */}
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Admin
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
        Signed in as{" "}
        <span className="font-mono text-[rgb(var(--text-primary))]">
          {email}
        </span>
      </p>

      {/* Stats grid */}
      <section className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileMusic}
          label="Total songs"
          value={totalSongs}
          loading={songsQuery.isLoading}
          to="/admin/songs"
        />
        <StatCard
          icon={Eye}
          label="Published"
          value={published}
          loading={songsQuery.isLoading}
          accent="success"
          to="/admin/songs"
        />
        <StatCard
          icon={EyeOff}
          label="Drafts / Hidden"
          value={drafts + unpublished}
          loading={songsQuery.isLoading}
          accent="warning"
          to="/admin/songs"
        />
        <StatCard
          icon={Library}
          label="Playlists"
          value={playlistCount}
          loading={playlistsQuery.isLoading}
          to="/admin/playlists"
        />
      </section>

      {/* Quick actions */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
          Quick actions
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            to="/admin/songs"
            icon={ListMusic}
            title="Manage songs"
            description="Browse, filter, edit, publish, or delete tracks."
          />
          <ActionCard
            to="/admin/songs"
            icon={Upload}
            title="Upload a song"
            description="Add a new track with audio and cover art."
          />
          <ActionCard
            to="/admin/playlists"
            icon={Library}
            title="Organize playlists"
            description="Curate collections and reorder tracks."
          />
        </div>
      </section>

      {/* Recent uploads */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
              Recent uploads
            </h2>
            <p className="mt-1 text-xs text-[rgb(var(--text-secondary))]">
              Latest additions to your library
            </p>
          </div>
          <Link
            to="/admin/songs"
            className="group inline-flex items-center gap-1 text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-3 rounded-xl surface overflow-hidden">
          {songsQuery.isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-3 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl surface-muted">
                <FileMusic className="h-5 w-5 text-[rgb(var(--text-tertiary))]" />
              </div>
              <p className="mt-3 text-sm text-[rgb(var(--text-secondary))]">
                No songs yet. Upload your first track to get started.
              </p>
              <Link to="/admin/songs" className="mt-4 inline-block">
                <Button
                  variant="gradient"
                  size="sm"
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Upload song
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--border-subtle))]">
              {recent.map((song) => (
                <RecentRow key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Stat card
   ============================================================ */
function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading?: boolean;
  accent?: "success" | "warning";
  to?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            accent === "success"
              ? "bg-emerald-500/10 text-emerald-500"
              : accent === "warning"
              ? "bg-amber-500/10 text-amber-500"
              : "bg-brand-500/10 text-brand-500"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
          {label}
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold tabular-nums">
        {loading ? (
          <span className="inline-block h-7 w-12 skeleton rounded" />
        ) : (
          value
        )}
      </div>
    </>
  );

  const baseClass =
    "group relative flex flex-col rounded-xl surface p-4 transition-all";

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          baseClass,
          "hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-500/40"
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

/* ============================================================
   Quick action card
   ============================================================ */
function ActionCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-xl surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-500/40"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgb(var(--bg-muted))] transition-colors group-hover:btn-gradient">
        <Icon className="h-5 w-5 text-[rgb(var(--text-secondary))] transition-colors group-hover:text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-[rgb(var(--text-secondary))]">
          {description}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-[rgb(var(--text-tertiary))] transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
    </Link>
  );
}

/* ============================================================
   Recent upload row
   ============================================================ */
function RecentRow({ song }: { song: Song }) {
  return (
    <Link
      to="/admin/songs"
      className="flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--bg-muted))]/40 transition-colors"
    >
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
          {truncate(song.artistName, 40)}
        </div>
      </div>
      <div className="hidden sm:block">
        <StatusBadge status={song.status} />
      </div>
      <div className="hidden md:block w-20 text-right text-xs text-[rgb(var(--text-tertiary))]">
        {formatRelative(song.createdAt)}
      </div>
    </Link>
  );
}