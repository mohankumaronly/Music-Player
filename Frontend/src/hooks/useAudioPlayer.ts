import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";
import { extractAmbientColors } from "../lib/color";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Timestamp of the last programmatic src swap. */
  const sourceSwapAtRef = useRef<number>(0);

  /** Re-entrancy guard for `onEnded`. */
  const busyRef = useRef<boolean>(false);

  /** Track the last command we issued so we don't duplicate play/pause calls. */
  const lastCommandRef = useRef<"play" | "pause" | null>(null);

  // ----------------------------------------------------------------
  // Create <audio> once
  // ----------------------------------------------------------------
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto"; // ← auto (not metadata) so the next track buffers ahead
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    return () => {
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    };
  }, []);

  // ----------------------------------------------------------------
  // Store → audio
  // ----------------------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const unsub = usePlayerStore.subscribe((state, prev) => {
      const song = state.queue[state.index] ?? null;
      const prevSong = prev.queue[prev.index] ?? null;
      const songChanged = song?.id !== prevSong?.id;

      // ---------- Source change ----------
      if (song?.audioUrl && songChanged) {
        sourceSwapAtRef.current = performance.now();
        lastCommandRef.current = null;

        try {
          audio.pause();
        } catch {
          /* ignore */
        }
        audio.currentTime = 0;

        // Swap source and immediately kick off playback
        audio.src = song.audioUrl;
        audio.load();
        audio.volume = state.muted ? 0 : state.volume;

        if (state.isPlaying) {
          lastCommandRef.current = "play";
          const p = audio.play();
          if (p && typeof p.catch === "function") {
            p.catch((err: unknown) => {
              // NotAllowedError = autoplay blocked; ignore other aborts
              const name = (err as { name?: string })?.name;
              if (name === "NotAllowedError") {
                usePlayerStore.setState({ isPlaying: false });
              }
              // AbortError is expected during fast skips — ignore it
            });
          }
        }

        // Ambient colors for the new cover
        const songIdAtRequest = song.id;
        extractAmbientColors(song.coverUrl, song.id).then((colors) => {
          const store = usePlayerStore.getState();
          if (store.queue[store.index]?.id === songIdAtRequest) {
            store.setAmbient(colors);
          }
        });
      }

      // ---------- Play / pause intent (no source change) ----------
      if (song && !songChanged) {
        if (state.isPlaying && audio.paused) {
          if (lastCommandRef.current !== "play") {
            lastCommandRef.current = "play";
            const p = audio.play();
            if (p && typeof p.catch === "function") {
              p.catch((err: unknown) => {
                const name = (err as { name?: string })?.name;
                if (name === "NotAllowedError") {
                  usePlayerStore.setState({ isPlaying: false });
                }
              });
            }
          }
        } else if (!state.isPlaying && !audio.paused) {
          if (lastCommandRef.current !== "pause") {
            lastCommandRef.current = "pause";
            audio.pause();
          }
        }
      }

      // ---------- Volume ----------
      const targetVolume = state.muted ? 0 : state.volume;
      if (Math.abs(audio.volume - targetVolume) > 0.01) {
        audio.volume = targetVolume;
      }

      // ---------- Seek ----------
      const msSinceSwap = performance.now() - sourceSwapAtRef.current;
      if (
        msSinceSwap > 300 &&
        audio.readyState >= 1 &&
        Math.abs(audio.currentTime - state.progress) > 1
      ) {
        try {
          audio.currentTime = state.progress;
        } catch {
          /* not seekable yet */
        }
      }
    });

    // ----------------------------------------------------------------
    // Audio → store
    // ----------------------------------------------------------------
    const withinSwapWindow = () =>
      performance.now() - sourceSwapAtRef.current < 250;

    const onTimeUpdate = () => {
      if (busyRef.current) return;
      usePlayerStore.getState().setProgress(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      usePlayerStore.getState().setDuration(audio.duration || 0);
    };

    /**
     * THE BIG FIX — repeat-one handled here, not in the store.
     * We reset the audio element directly and call play().
     * No store updates = no flicker.
     */
    const onEnded = () => {
      if (busyRef.current) return;
      busyRef.current = true;

      try {
        const state = usePlayerStore.getState();
        const { repeat, queue, index } = state;

        if (repeat === "one" && queue[index]) {
          // Restart the same track cleanly
          try {
            audio.currentTime = 0;
          } catch {
            /* ignore */
          }
          audio
            .play()
            .then(() => {
              // Keep the store in sync (progress will catch up via timeupdate)
              usePlayerStore.setState({ isPlaying: true, progress: 0 });
            })
            .catch(() => {
              usePlayerStore.setState({ isPlaying: false });
            });
        } else {
          // Let the store advance. If we're at the end of the queue with
          // repeat=off, the store sets isPlaying=false and stops cleanly.
          state.next();
        }
      } finally {
        setTimeout(() => {
          busyRef.current = false;
        }, 0);
      }
    };

    const onPlay = () => {
      if (withinSwapWindow()) return;
      if (!usePlayerStore.getState().isPlaying) {
        usePlayerStore.setState({ isPlaying: true });
      }
    };

    const onPause = () => {
      if (withinSwapWindow()) return;
      // Browser fires `pause` AFTER `ended`. Ignore that case.
      if (audio.ended) return;
      if (usePlayerStore.getState().isPlaying) {
        usePlayerStore.setState({ isPlaying: false });
      }
    };

    const onError = () => {
      // If the current src errors, try skipping to the next track once.
      const state = usePlayerStore.getState();
      if (state.queue.length > 1) {
        state.next();
      } else {
        usePlayerStore.setState({ isPlaying: false });
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    // ----------------------------------------------------------------
    // Apply already-queued song on mount
    // ----------------------------------------------------------------
    const { queue, index, isPlaying, volume, muted } = usePlayerStore.getState();
    const current = queue[index];
    if (current?.audioUrl) {
      sourceSwapAtRef.current = performance.now();
      audio.src = current.audioUrl;
      audio.volume = muted ? 0 : volume;
      audio.load();
      if (isPlaying) {
        lastCommandRef.current = "play";
        audio.play().catch(() => {});
      }
      extractAmbientColors(current.coverUrl, current.id).then((colors) => {
        usePlayerStore.getState().setAmbient(colors);
      });
    }

    return () => {
      unsub();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  // ----------------------------------------------------------------
  // Media Session
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const unsub = usePlayerStore.subscribe((state) => {
      const song = state.queue[state.index] ?? null;
      if (!song) {
        navigator.mediaSession.metadata = null;
        return;
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artistName,
        album: song.albumName ?? undefined,
        artwork: song.coverUrl
          ? [{ src: song.coverUrl, sizes: "512x512", type: "image/jpeg" }]
          : [],
      });
    });

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        usePlayerStore.setState({ isPlaying: true });
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        usePlayerStore.setState({ isPlaying: false });
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        usePlayerStore.getState().next();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        usePlayerStore.getState().prev();
      });
    } catch {
      /* some browsers throw on unsupported handlers */
    }

    return () => unsub();
  }, []);

  // ----------------------------------------------------------------
  // Keyboard shortcuts
  // ----------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }

      const store = usePlayerStore.getState();

      if (e.code === "Space") {
        e.preventDefault();
        store.toggle();
      } else if (e.code === "ArrowRight" && e.shiftKey) {
        store.next();
      } else if (e.code === "ArrowLeft" && e.shiftKey) {
        store.prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}