import { Link } from "react-router-dom";
import {
  ListMusic,
  Upload,
  Library,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function AdminDashboardPage() {
  const email = useAuthStore((s) => s.email);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <ActionCard
          to="/admin/songs"
          icon={ListMusic}
          title="Manage songs"
          description="Browse, publish, and edit the music library."
        />
        <ActionCard
          to="/admin/songs/new"
          icon={Upload}
          title="Upload new song"
          description="Add a track with audio and cover art."
        />
        <ActionCard
          to="/admin/playlists"
          icon={Library}
          title="Playlists"
          description="Create curated collections and reorder tracks."
        />
      </div>
    </div>
  );
}

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
      className="group flex items-start gap-4 rounded-xl surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-500/40"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgb(var(--bg-muted))] group-hover:btn-gradient">
        <Icon className="h-5 w-5 text-[rgb(var(--text-secondary))] group-hover:text-white transition-colors" />
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