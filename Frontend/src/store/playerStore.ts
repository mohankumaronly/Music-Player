import { create } from "zustand";
import type { Song } from "../api/types";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: Song[];
  index: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  progress: number;
  duration: number;
  ambient: { a: string; b: string; c: string } | null;

  current: () => Song | null;
  playQueue: (songs: Song[], startIndex?: number) => void;
  playSong: (song: Song, context?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setProgress: (s: number) => void;
  setDuration: (s: number) => void;
  setAmbient: (a: PlayerState["ambient"]) => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  index: -1,
  isPlaying: false,
  volume: 0.9,
  muted: false,
  repeat: "off",
  shuffle: false,
  progress: 0,
  duration: 0,
  ambient: null,

  current: () => {
    const { queue, index } = get();
    if (index < 0 || index >= queue.length) return null;
    return queue[index];
  },

  playQueue: (songs, startIndex = 0) => {
    if (!songs.length) return;
    set({
      queue: songs,
      index: Math.max(0, Math.min(startIndex, songs.length - 1)),
      isPlaying: true,
      progress: 0,
      duration: 0,
    });
  },

  playSong: (song, context) => {
    const queue = context?.length ? context : [song];
    const idx = Math.max(0, queue.findIndex((s) => s.id === song.id));
    set({
      queue,
      index: idx,
      isPlaying: true,
      progress: 0,
      duration: 0,
    });
  },

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, index, repeat, shuffle } = get();
    if (!queue.length) return;

    // Repeat-one: handled inside onEnded; if called manually (skip button),
    // we just restart the current track.
    if (repeat === "one") {
      set({ progress: 0, duration: 0 });
      return;
    }

    // Shuffle: random other index
    if (shuffle && queue.length > 1) {
      let nextIdx: number;
      do {
        nextIdx = Math.floor(Math.random() * queue.length);
      } while (nextIdx === index);
      set({ index: nextIdx, isPlaying: true, progress: 0, duration: 0 });
      return;
    }

    // Sequential
    const nextIdx = index + 1;
    if (nextIdx >= queue.length) {
      if (repeat === "all") {
        set({ index: 0, isPlaying: true, progress: 0, duration: 0 });
      } else {
        // End of queue — stop cleanly
        set({ isPlaying: false, progress: 0 });
      }
      return;
    }

    set({ index: nextIdx, isPlaying: true, progress: 0, duration: 0 });
  },

  prev: () => {
    const { queue, index, progress } = get();
    if (!queue.length) return;

    // If >3s in, restart the current track
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }

    const prevIdx = index - 1 < 0 ? queue.length - 1 : index - 1;
    set({
      index: prevIdx,
      isPlaying: true,
      progress: 0,
      duration: 0,
    });
  },

  seek: (seconds) => set({ progress: seconds }),

  setVolume: (v) => {
    const clamped = Math.max(0, Math.min(1, v));
    set({ volume: clamped, muted: clamped === 0 });
  },

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setAmbient: (ambient) => set({ ambient }),

  clear: () =>
    set({
      queue: [],
      index: -1,
      isPlaying: false,
      progress: 0,
      duration: 0,
      ambient: null,
    }),
}));