/* ============================================================
   Common envelopes
   ============================================================ */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

/* ============================================================
   Auth
   ============================================================ */
export interface RequestOtpPayload {
  email: string;
}

export interface RequestOtpResponse {
  challengeId: string;
  expiresIn?: number;
}

export interface VerifyOtpPayload {
  challengeId: string;
  email: string;
  otp: string;
}

export type Role = "ADMIN" | "USER";

export interface AuthSession {
  accessToken: string;
  role: Role;
  email: string;
  expiresIn?: number;
}

/* ============================================================
   Songs
   ============================================================ */
export type SongStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export interface Song {
  id: string;
  title: string;
  description?: string | null;
  artistName: string;
  albumName?: string | null;
  genre?: string | null;
  audioUrl: string;
  coverUrl?: string | null;
  durationSeconds?: number | null;
  status: SongStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SongUploadPayload {
  title: string;
  description?: string;
  artistName: string;
  albumName?: string;
  genre?: string;
  audio: File;
  cover?: File;
}

export interface SongUpdatePayload {
  title: string;
  description?: string;
  artistName: string;
  albumName?: string;
  genre?: string;
}

export interface SongListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface SongSearchParams extends SongListParams {
  q: string;
}

/* ============================================================
   Playlists
   ============================================================ */
export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  coverUrl?: string | null;
  songCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PlaylistCreatePayload {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface PlaylistUpdatePayload {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface AddSongToPlaylistPayload {
  songId: string;
  position?: number;
}

export interface ReorderPlaylistSongsPayload {
  songIds: string[];
}