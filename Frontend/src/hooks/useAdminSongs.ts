import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { songsApi } from "../api/songs.api";
import { QUERY_KEYS } from "../lib/constants";
import type {
  Song,
  SongListParams,
  SongStatus,
  SongUpdatePayload,
  SongUploadPayload,
} from "../api/types";
import type { ApiError } from "../api/client";

/* ============================================================
   Queries
   ============================================================ */
export function useAdminSongsList(params: SongListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminSongs(params),
    queryFn: () => songsApi.adminList(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminSongDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "song", id ?? ""],
    queryFn: () => songsApi.adminGetById(id!),
    enabled: Boolean(id),
  });
}

/* ============================================================
   Mutations
   ============================================================ */
export function useUploadSong() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SongUploadPayload) => songsApi.upload(payload),
    onSuccess: (song) => {
      // Invalidate all admin song list queries
      qc.invalidateQueries({ queryKey: ["admin", "songs"] });
      // Also refresh public lists
      qc.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Song uploaded", {
        description: `"${song.title}" saved as ${song.status.toLowerCase()}.`,
      });
    },
    onError: (err: ApiError) => {
      toast.error("Upload failed", {
        description: err.message,
      });
    },
  });
}

export function useUpdateSong(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SongUpdatePayload) => songsApi.update(id, payload),
    onSuccess: (song) => {
      qc.invalidateQueries({ queryKey: ["admin", "songs"] });
      qc.invalidateQueries({ queryKey: ["admin", "song", id] });
      qc.invalidateQueries({ queryKey: ["song", id] });
      qc.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Song updated", {
        description: `"${song.title}" saved.`,
      });
    },
    onError: (err: ApiError) => {
      toast.error("Update failed", { description: err.message });
    },
  });
}

export function useSetSongStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Extract<SongStatus, "PUBLISHED" | "UNPUBLISHED">;
    }) => songsApi.setStatus(id, status),
    onSuccess: (song) => {
      qc.invalidateQueries({ queryKey: ["admin", "songs"] });
      qc.invalidateQueries({ queryKey: ["admin", "song", song.id] });
      qc.invalidateQueries({ queryKey: ["songs"] });

      const verb =
        song.status === "PUBLISHED" ? "published" : "unpublished";
      toast.success(`Song ${verb}`, {
        description: `"${song.title}" is now ${song.status.toLowerCase()}.`,
      });
    },
    onError: (err: ApiError) => {
      toast.error("Status update failed", { description: err.message });
    },
  });
}

export function useDeleteSong() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => songsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "songs"] });
      qc.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Song deleted");
    },
    onError: (err: ApiError) => {
      toast.error("Delete failed", { description: err.message });
    },
  });
}

// Re-export Song type for convenience in components
export type { Song };