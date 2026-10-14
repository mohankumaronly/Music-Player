import { ArrowRight, PlayCircle, Shield, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE, GITHUB_URL } from "../lib/constants";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { GithubIcon } from "../components/ui/GithubIcon";
import { AmbientBackdrop } from "../components/effects/AmbientBackdrop";

/**
 * Landing page hero visual — a mock "Now Playing" card
 * using the same glass treatment as the real player.
 */
function HeroMockPlayer() {
  const FAKE_COVER =
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop";

  return (
    <div className="relative mt-16 mx-auto w-full max-w-md">
      {/* Glow behind card */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-60 blur-3xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(217,70,239,0.5))",
        }}
        aria-hidden
      />

      {/* Card */}
      <div className="glass-strong rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          {/* Cover */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-lg">
            <img
              src={FAKE_COVER}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Meta */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              Midnight Drive
            </div>
            <div className="truncate text-xs text-[rgb(var(--text-secondary))]">
              Neon Horizon · Night Sessions
            </div>

            {/* Fake progress */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[rgb(var(--border-strong))]/40">
              <div className="h-full btn-gradient" style={{ width: "42%" }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[rgb(var(--text-tertiary))]">
              <span>1:38</span>
              <span>3:54</span>
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
            aria-label="Shuffle"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-primary))]"
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M6 5h2v14H6zM20 5v14l-11-7z" />
            </svg>
          </button>
          <button
            type="button"
            className="grid h-12 w-12 place-items-center rounded-full btn-gradient shadow-lg text-white"
            aria-label="Play"
          >
            <PlayCircle className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-primary))]"
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
            </svg>
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
            aria-label="Repeat"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <>
      {/* Blurred cover backdrop — fixed behind everything */}
      <AmbientBackdrop />

      <div className="relative flex min-h-screen flex-col">
        {/* Nav */}
        <header className="sticky top-0 z-40">
          <div className="glass border-b border-[rgb(var(--glass-border))]">
            <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
              <Link to="/" className="font-semibold tracking-tight">
                {APP_NAME}
              </Link>
              <nav className="ml-auto flex items-center gap-2">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<GithubIcon className="h-4 w-4" />}
                  >
                    GitHub
                  </Button>
                </a>
                <ThemeToggle />
                <Link to="/discover">
                  <Button
                    variant="gradient"
                    size="sm"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Get started
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-20 text-center flex-1">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-[rgb(var(--text-secondary))] animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Open source · Self-hosted · Ad-free
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1] animate-fade-in">
            Your music.{" "}
            <span className="text-gradient-brand">Your server.</span>
            <br />
            Zero ads.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[rgb(var(--text-secondary))] animate-fade-in">
            {APP_TAGLINE}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            <Link to="/discover">
              <Button
                size="lg"
                variant="gradient"
                leftIcon={<PlayCircle className="h-5 w-5" />}
              >
                Get started Free
              </Button>
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <Button
                size="lg"
                variant="glass"
                leftIcon={<GithubIcon className="h-5 w-5" />}
              >
                Star on GitHub
              </Button>
            </a>
          </div>

          {/* Hero mock player */}
          <div className="animate-fade-in">
            <HeroMockPlayer />
          </div>

          {/* Feature pills */}
          <div className="mt-16 flex flex-wrap justify-center gap-3 text-xs text-[rgb(var(--text-tertiary))]">
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5">
              <Zap className="h-3.5 w-3.5" /> Instant streaming
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5">
              <Shield className="h-3.5 w-3.5" /> Secure OTP admin
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Ambient UI
            </span>
          </div>
        </section>

        <footer className="relative border-t border-[rgb(var(--border-subtle))] py-8 text-center text-xs text-[rgb(var(--text-tertiary))]">
          © {new Date().getFullYear()} {APP_NAME} · MIT License
        </footer>
      </div>
    </>
  );
}