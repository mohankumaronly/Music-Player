export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Rockranger";
export const APP_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE ?? "Self-hosted music streaming. Zero ads.";
export const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL ?? "https://github.com/mohankumaronly81";

export const STORAGE_KEYS = {
  THEME: "theme",
  AUTH: "rockrangerz.auth",
} as const;

export const QUERY_KEYS = {
  songs: (params?: unknown) => ["songs", params] as const,
  song: (id: string) => ["song", id] as const,
  adminSongs: (params?: unknown) => ["admin", "songs", params] as const,
  playlists: (params?: unknown) => ["playlists", params] as const,
  playlist: (id: string) => ["playlist", id] as const,
  playlistSongs: (id: string, params?: unknown) =>
    ["playlist", id, "songs", params] as const,
  adminPlaylists: (params?: unknown) => ["admin", "playlists", params] as const,
} as const;