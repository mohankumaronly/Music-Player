import { api, unwrap } from "./client";
import type {
  Page,
  Song,
  SongListParams,
  SongSearchParams,
  SongStatus,
  SongUpdatePayload,
  SongUploadPayload,
} from "./types";

export const songsApi = {
  /* -------- Public -------- */
  listPublished: (params: SongListParams = {}) =>
    unwrap<Page<Song>>(
      api.get("/api/v1/songs", {
        params: { page: 0, size: 20, sort: "createdAt,desc", ...params },
      })
    ),

  getPublishedById: (id: string) =>
    unwrap<Song>(api.get(`/api/v1/songs/${id}`)),

  search: ({ q, ...rest }: SongSearchParams) =>
    unwrap<Page<Song>>(
      api.get("/api/v1/songs/search", {
        params: { q, page: 0, size: 20, ...rest },
      })
    ),

  /* -------- Admin -------- */
  adminList: (params: SongListParams = {}) =>
    unwrap<Page<Song>>(
      api.get("/api/v1/admin/songs", {
        params: { page: 0, size: 20, ...params },
      })
    ),

  adminGetById: (id: string) =>
    unwrap<Song>(api.get(`/api/v1/admin/songs/${id}`)),

  upload: (payload: SongUploadPayload) => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    form.append("artistName", payload.artistName);
    if (payload.albumName) form.append("albumName", payload.albumName);
    if (payload.genre) form.append("genre", payload.genre);
    form.append("audio", payload.audio);
    if (payload.cover) form.append("cover", payload.cover);

    return unwrap<Song>(
      api.post("/api/v1/admin/songs", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  update: (id: string, payload: SongUpdatePayload) =>
    unwrap<Song>(api.put(`/api/v1/admin/songs/${id}`, payload)),

  setStatus: (id: string, status: Extract<SongStatus, "PUBLISHED" | "UNPUBLISHED">) =>
    unwrap<Song>(api.patch(`/api/v1/admin/songs/${id}/status`, { status })),

  remove: (id: string) => api.delete(`/api/v1/admin/songs/${id}`),
};