    import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
    import { toast } from "sonner";
    import { playlistsApi } from "../api/playlists.api";
    import { QUERY_KEYS } from "../lib/constants";
    import type {
    AddSongToPlaylistPayload,
    Playlist,
    PlaylistCreatePayload,
    PlaylistUpdatePayload,
    ReorderPlaylistSongsPayload,
    } from "../api/types";
    import type { ApiError } from "../api/client";

    /* ============================================================
    Public queries
    ============================================================ */
    export function usePublicPlaylistsList(params = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.playlists(params),
        queryFn: () => playlistsApi.listPublic(params),
        placeholderData: (prev) => prev,
    });
    }

    export function usePublicPlaylistDetail(id: string | undefined) {
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

    /* ============================================================
    Admin queries — real admin endpoints, public + private
    ============================================================ */
    export function useAdminPlaylistsList(
    params: { page?: number; size?: number; sort?: string } = {}
    ) {
    return useQuery({
        queryKey: ["admin", "playlists", params],
        queryFn: () => playlistsApi.adminList(params),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
    });
    }

    export function useAdminPlaylistDetail(id: string | undefined) {
    return useQuery({
        queryKey: ["admin", "playlist", id ?? ""],
        queryFn: () => playlistsApi.adminGetById(id!),
        enabled: Boolean(id),
        staleTime: 30_000,
    });
    }

    export function useAdminPlaylistSongs(
    id: string | undefined,
    params: { page?: number; size?: number } = {}
    ) {
    return useQuery({
        queryKey: ["admin", "playlist", id ?? "", "songs", params],
        queryFn: () => playlistsApi.adminGetSongs(id!, params),
        enabled: Boolean(id),
        placeholderData: (prev) => prev,
    });
    }

    /* ============================================================
    Shared invalidation helper
    ============================================================ */
    function invalidatePlaylist(
    qc: ReturnType<typeof useQueryClient>,
    id: string
    ) {
    qc.invalidateQueries({ queryKey: ["admin", "playlists"] });
    qc.invalidateQueries({ queryKey: ["admin", "playlist", id] });
    qc.invalidateQueries({ queryKey: ["admin", "playlist", id, "songs"] });
    qc.invalidateQueries({ queryKey: ["playlists"] });
    qc.invalidateQueries({ queryKey: ["playlist", id] });
    }

    /* ============================================================
    Mutations
    ============================================================ */
    export function useCreatePlaylist() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: PlaylistCreatePayload) =>
        playlistsApi.adminCreate(payload),
        onSuccess: (playlist) => {
        qc.invalidateQueries({ queryKey: ["admin", "playlists"] });
        qc.invalidateQueries({ queryKey: ["playlists"] });
        toast.success("Playlist created", {
            description: `"${playlist.name}" is ready to edit.`,
        });
        },
        onError: (err: ApiError) => {
        toast.error("Create failed", { description: err.message });
        },
    });
    }

    export function useUpdatePlaylist(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: PlaylistUpdatePayload) =>
        playlistsApi.adminUpdate(id, payload),
        onSuccess: (playlist) => {
        invalidatePlaylist(qc, id);
        toast.success("Playlist updated", {
            description: `"${playlist.name}" saved.`,
        });
        },
        onError: (err: ApiError) => {
        toast.error("Update failed", { description: err.message });
        },
    });
    }

    export function useDeletePlaylist() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => playlistsApi.adminRemove(id),
        onSuccess: (_data, id) => {
        qc.invalidateQueries({ queryKey: ["admin", "playlists"] });
        qc.invalidateQueries({ queryKey: ["admin", "playlist", id] });
        qc.invalidateQueries({ queryKey: ["playlists"] });
        qc.invalidateQueries({ queryKey: ["playlist", id] });
        toast.success("Playlist deleted");
        },
        onError: (err: ApiError) => {
        toast.error("Delete failed", { description: err.message });
        },
    });
    }

    export function useAddSongToPlaylist(playlistId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddSongToPlaylistPayload) =>
        playlistsApi.adminAddSong(playlistId, payload),
        onSuccess: () => {
        invalidatePlaylist(qc, playlistId);
        toast.success("Song added to playlist");
        },
        onError: (err: ApiError) => {
        toast.error("Couldn't add song", { description: err.message });
        },
    });
    }

    export function useRemoveSongFromPlaylist(playlistId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (songId: string) =>
        playlistsApi.adminRemoveSong(playlistId, songId),
        onSuccess: () => {
        invalidatePlaylist(qc, playlistId);
        toast.success("Song removed");
        },
        onError: (err: ApiError) => {
        toast.error("Couldn't remove song", { description: err.message });
        },
    });
    }

    export function useReorderPlaylistSongs(playlistId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: ReorderPlaylistSongsPayload) =>
        playlistsApi.adminReorder(playlistId, payload),
        onSuccess: () => {
        invalidatePlaylist(qc, playlistId);
        toast.success("Order saved");
        },
        onError: (err: ApiError) => {
        toast.error("Couldn't reorder", { description: err.message });
        },
    });
    }

    // Re-export for convenience
    export type { Playlist };