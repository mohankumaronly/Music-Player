import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, Music2, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { APP_NAME, GITHUB_URL } from "../../lib/constants";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";
import { GithubIcon } from "../ui/GithubIcon";
import { cn } from "../../lib/cn";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useUIStore } from "../../store/uiStore";

const navItems = [
  { to: "/discover", label: "Discover" },
  { to: "/playlists", label: "Playlists" },
  { to: "/docs", label: "Self-host" },
];

export function TopBar() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const email = useAuthStore((s) => s.email);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const handleLogout = () => {
    setMenuOpen(false);
    logout.mutate();
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-[rgb(var(--glass-border))]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-muted))] transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="grid h-8 w-8 place-items-center rounded-lg btn-gradient">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight hidden xs:inline">
              {APP_NAME}
            </span>
          </Link>

          {/* Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    isActive
                      ? "text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-muted))]"
                      : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                  )
                }
              >
                {it.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <button
              className="hidden sm:flex items-center gap-2 h-9 rounded-lg px-3 text-sm text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-muted))] hover:text-[rgb(var(--text-secondary))] transition-colors min-w-50"
              onClick={() => navigate("/search")}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
              <span>Search songs…</span>
              <kbd className="ml-auto rounded border border-[rgb(var(--border-subtle))] px-1.5 py-0.5 text-[10px] font-mono">
                /
              </kbd>
            </button>

            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                aria-label="GitHub repository"
              >
                <GithubIcon className="h-4 w-4" />
              </Button>
            </a>

            <ThemeToggle />

            {isAdmin ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 h-9 rounded-lg pl-2 pr-3 surface hover:bg-[rgb(var(--bg-muted))] transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full btn-gradient">
                    <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="hidden sm:inline max-w-[10rem] truncate text-xs font-medium">
                    {email ?? "Admin"}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl surface shadow-2xl overflow-hidden animate-fade-in">
                      <div className="px-3 py-2.5 border-b border-[rgb(var(--border-subtle))]">
                        <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
                          Signed in as
                        </div>
                        <div className="mt-0.5 truncate text-sm font-medium">
                          {email ?? "Admin"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin");
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[rgb(var(--bg-muted))] transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-[rgb(var(--text-secondary))]" />
                        Admin dashboard
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-60"
                      >
                        <LogOut className="h-4 w-4" />
                        {logout.isPending ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/admin/login" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LogIn className="h-4 w-4" />}
                >
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}