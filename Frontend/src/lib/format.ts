/**
 * Format seconds → "m:ss" or "h:mm:ss" for durations.
 */
export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0 || !Number.isFinite(seconds)) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format ISO date → "Oct 13, 2026"
 */
export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/**
 * Relative time → "2 days ago"
 */
export function formatRelative(iso?: string | null): string {
  if (!iso) return "";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, max = 60): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Deterministic pastel gradient from any string (for placeholder covers).
 */
export function hashGradient(seed: string): { from: string; to: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const hue1 = Math.abs(h) % 360;
  const hue2 = (hue1 + 40) % 360;
  return {
    from: `hsl(${hue1} 70% 55%)`,
    to: `hsl(${hue2} 70% 45%)`,
  };
}

/**
 * Extract a human-friendly color from an image URL.
 * (Simple: hash the URL. Full dominant-color extraction lands in Phase 3.)
 */
export function ambientFromString(seed: string): { a: string; b: string; c: string } {
  const { from, to } = hashGradient(seed);
  return { a: from, b: to, c: from };
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}