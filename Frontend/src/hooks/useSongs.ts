import { useQuery } from "@tanstack/react-query";
import { songsApi } from "../api/songs.api";
import { QUERY_KEYS } from "../lib/constants";
import type { SongListParams, SongSearchParams } from "../api/types";

export function useSongs(params: SongListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.songs(params),
    queryFn: () => songsApi.listPublished(params),
    placeholderData: (prev) => prev,
  });
}

export function useSong(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.song(id ?? ""),
    queryFn: () => songsApi.getPublishedById(id!),
    enabled: Boolean(id),
  });
}

export function useSearchSongs(params: SongSearchParams, enabled = true) {
  return useQuery({
    queryKey: ["songs", "search", params],
    queryFn: () => songsApi.search(params),
    enabled: enabled && params.q.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}

/* -------- Admin -------- */
export function useAdminSongs(params: SongListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminSongs(params),
    queryFn: () => songsApi.adminList(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminSong(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "song", id ?? ""],
    queryFn: () => songsApi.adminGetById(id!),
    enabled: Boolean(id),
  });
}