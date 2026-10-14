import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="relative min-h-screen grid place-items-center px-4 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px circle at 50% 30%, rgba(99,102,241,0.2), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="text-center max-w-md">
        <div className="text-7xl sm:text-9xl font-bold text-gradient-brand">
          404
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          This page doesn't exist
        </h1>
        <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
          The link may be broken, or the page may have been removed.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/">
            <Button
              variant="gradient"
              leftIcon={<Home className="h-4 w-4" />}
            >
              Go home
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
              Search songs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}