import { useEffect } from "react";
import { usePlayerStore } from "../../store/playerStore";

/**
 * Default ambient colors so the background glows even before a song plays.
 * These match the CSS defaults in index.css.
 */
const DEFAULTS = {
  a: "rgb(99 102 241)",   // indigo
  b: "rgb(217 70 239)",   // fuchsia
  c: "rgb(56 189 248)",   // sky
};

/**
 * Writes current song's ambient colors to CSS variables on <html>.
 * Picked up automatically by `.ambient-bg::before` / `::after`.
 * Falls back to brand defaults when no song is playing.
 */
export function AmbientSync() {
  const ambient = usePlayerStore((s) => s.ambient);

  // Seed defaults on mount so the layer is always visible
  useEffect(() => {
    const root = document.documentElement;
    if (!root.style.getPropertyValue("--ambient-1")) {
      root.style.setProperty("--ambient-1", DEFAULTS.a);
      root.style.setProperty("--ambient-2", DEFAULTS.b);
      root.style.setProperty("--ambient-3", DEFAULTS.c);
    }
  }, []);

  // React to song changes
  useEffect(() => {
    if (!ambient) return;
    const root = document.documentElement;
    root.style.setProperty("--ambient-1", ambient.a);
    root.style.setProperty("--ambient-2", ambient.b);
    root.style.setProperty("--ambient-3", ambient.c);
  }, [ambient]);

  return null;
}