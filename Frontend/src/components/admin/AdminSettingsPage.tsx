import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { LogOut } from "lucide-react";

export function AdminSettingsPage() {
  const email = useAuthStore((s) => s.email);
  const logout = useLogout();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
        Manage your admin account.
      </p>

      <div className="mt-6 rounded-xl surface p-5">
        <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
          Signed in as
        </div>
        <div className="mt-1 font-mono text-sm">{email}</div>

        <div className="mt-6 border-t border-[rgb(var(--border-subtle))] pt-5">
          <Button
            variant="outline"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}