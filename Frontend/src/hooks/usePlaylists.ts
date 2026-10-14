import { useQuery } from "@tanstack/react-query";
import { playlistsApi } from "../api/playlists.api";
import { QUERY_KEYS } from "../lib/constants";

export function usePublicPlaylists(params: { page?: number; size?: number } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.playlists(params),
    queryFn: () => playlistsApi.listPublic(params),
    placeholderData: (prev) => prev,
  });
}

export function usePublicPlaylist(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.playlist(id ?? ""),
    queryFn: () => playlistsApi.getPublicById(id!),
    enabled: Boolean(id),
  });
}

export function usePublicPlaylistSongs(
  id: string | undefined,
  params: { page?: number; size?: number } = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.playlistSongs(id ?? "", params),
    queryFn: () => playlistsApi.getPublicSongs(id!, params),
    enabled: Boolean(id),
    placeholderData: (prev) => prev,
  });
}