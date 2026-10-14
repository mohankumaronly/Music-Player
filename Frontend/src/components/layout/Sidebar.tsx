import { NavLink } from "react-router-dom";
import {
  Compass,
  Home,
  Library,
  ListMusic,
  Settings,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuthStore } from "../../store/authStore";

interface Item {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const publicItems: Item[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/playlists", label: "Playlists", icon: Library },
];

const adminItems: Item[] = [
  { to: "/admin", label: "Dashboard", icon: ShieldCheck },
  { to: "/admin/songs", label: "Songs", icon: ListMusic },
  { to: "/admin/songs/new", label: "Upload", icon: Upload },
  { to: "/admin/playlists", label: "Playlists", icon: Library },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const isAdmin = useAuthStore((s) => s.isAdmin());

  return (
    <aside
      className={cn(
        "hidden lg:flex w-60 shrink-0 flex-col gap-6 p-4",
        // Glass treatment — matches the PlayerBar
        "glass glass-glow-top",
        "border-r-0"
      )}
    >
      <Section items={publicItems} title="Browse" />
      {isAdmin && <Section items={adminItems} title="Administration" />}
    </aside>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
        {title}
      </div>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/" || to === "/admin"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-[rgb(var(--bg-muted))] text-[rgb(var(--text-primary))] font-medium"
                : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-muted))] hover:text-[rgb(var(--text-primary))]"
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </div>
  );
}