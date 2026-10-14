import { api, unwrap } from "./client";
import type {
  AddSongToPlaylistPayload,
  Page,
  Playlist,
  PlaylistCreatePayload,
  PlaylistUpdatePayload,
  ReorderPlaylistSongsPayload,
  Song,
} from "./types";

export const playlistsApi = {
  /* ============================================================
     Public
     ============================================================ */
  listPublic: (params: { page?: number; size?: number } = {}) =>
    unwrap<Page<Playlist>>(
      api.get("/api/v1/playlists", {
        params: { page: 0, size: 20, ...params },
      })
    ),

  getPublicById: (id: string) =>
    unwrap<Playlist>(api.get(`/api/v1/playlists/${id}`)),

  getPublicSongs: (
    id: string,
    params: { page?: number; size?: number } = {}
  ) =>
    unwrap<Page<Song>>(
      api.get(`/api/v1/playlists/${id}/songs`, {
        params: { page: 0, size: 20, ...params },
      })
    ),

  /* ============================================================
     Admin reads — return public + private playlists
     ============================================================ */
  adminList: (params: { page?: number; size?: number; sort?: string } = {}) =>
    unwrap<Page<Playlist>>(
      api.get("/api/v1/admin/playlists", {
        params: { page: 0, size: 20, sort: "createdAt,desc", ...params },
      })
    ),

  adminGetById: (id: string) =>
    unwrap<Playlist>(api.get(`/api/v1/admin/playlists/${id}`)),

  adminGetSongs: (
    id: string,
    params: { page?: number; size?: number } = {}
  ) =>
    unwrap<Page<Song>>(
      api.get(`/api/v1/admin/playlists/${id}/songs`, {
        params: { page: 0, size: 200, ...params },
      })
    ),

  /* ============================================================
     Admin writes
     ============================================================ */
  adminCreate: (payload: PlaylistCreatePayload) =>
    unwrap<Playlist>(api.post("/api/v1/admin/playlists", payload)),

  adminUpdate: (id: string, payload: PlaylistUpdatePayload) =>
    unwrap<Playlist>(api.put(`/api/v1/admin/playlists/${id}`, payload)),

  adminRemove: (id: string) => api.delete(`/api/v1/admin/playlists/${id}`),

  adminAddSong: (playlistId: string, payload: AddSongToPlaylistPayload) =>
    api.post(`/api/v1/admin/playlists/${playlistId}/songs`, payload),

  adminRemoveSong: (playlistId: string, songId: string) =>
    api.delete(`/api/v1/admin/playlists/${playlistId}/songs/${songId}`),

  adminReorder: (playlistId: string, payload: ReorderPlaylistSongsPayload) =>
    api.put(`/api/v1/admin/playlists/${playlistId}/songs/reorder`, payload),
};