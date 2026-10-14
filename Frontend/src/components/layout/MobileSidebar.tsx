import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Compass,
  Home,
  Library,
  ListMusic,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/cn";

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

export function MobileSidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const setOpen = useUIStore((s) => s.setSidebarOpen);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  // Esc to close + lock scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[90] h-full w-72 lg:hidden",
          "glass-strong border-r border-[rgb(var(--glass-border))]",
          "flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-label="Navigation menu"
      >
        <header className="flex items-center justify-between px-4 h-14 border-b border-[rgb(var(--border-subtle))]">
          <span className="font-semibold tracking-tight">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-[rgb(var(--bg-muted))]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Section
            items={publicItems}
            title="Browse"
            onNavigate={() => setOpen(false)}
          />
          {isAdmin && (
            <Section
              items={adminItems}
              title="Administration"
              onNavigate={() => setOpen(false)}
            />
          )}
        </div>
      </aside>
    </>
  );
}

function Section({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: Item[];
  onNavigate?: () => void;
}) {
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
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
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