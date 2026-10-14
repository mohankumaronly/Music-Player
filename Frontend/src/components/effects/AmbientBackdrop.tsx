import { AnimatePresence, motion } from "framer-motion";
import { usePlayerStore } from "../../store/playerStore";
import { API_BASE_URL } from "../../lib/constants";

/** Prefix relative URLs with the API base. */
function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Full-viewport blurred cover backdrop.
 * Maximized visibility — the cover is the star of the show.
 */
export function AmbientBackdrop() {
  const current = usePlayerStore((s) => s.current());
  const coverUrl = resolveUrl(current?.coverUrl);
  const songId = current?.id ?? "__idle__";

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* Fallback gradient — only visible when no cover is loaded */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px circle at 20% 20%, rgba(99,102,241,0.35), transparent 60%)," +
            "radial-gradient(1000px circle at 80% 80%, rgba(217,70,239,0.35), transparent 60%)",
        }}
      />

      {/* Blurred cover layer — crossfades on song change */}
      <AnimatePresence initial={false}>
        {coverUrl && (
          <motion.div
            key={songId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {/*
              Layer 1: soft color wash (still provides a base)
              Slightly less blur so it blends with layer 2 nicely.
            */}
            <img
              src={coverUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: "blur(50px) saturate(240%) brightness(1)",
                transform: "scale(1.35)",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />

            {/*
              Layer 2: minimal blur — the cover is very clearly visible.
              This is the layer your eye locks onto.
            */}
            <img
              src={coverUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: "blur(10px) saturate(200%) brightness(1)",
                transform: "scale(1.08)",
                opacity: 1,
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barely-there darkening — mainly for text legibility */}
      <div className="absolute inset-0 bg-black/8 dark:bg-black/15" />

      {/* Very subtle vignette — only darkens the outermost corners */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 65%, rgb(var(--bg-canvas) / 0.45) 100%)",
        }}
      />
    </div>
  );
}