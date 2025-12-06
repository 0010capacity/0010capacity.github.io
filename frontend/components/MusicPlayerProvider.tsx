"use client";

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { create } from "zustand";

// Low-pass filter for softer sound
const FILTER_FREQUENCY = 2000;
const VOLUME_STORAGE_KEY = "music-player-volume";
const REPEAT_MODE_STORAGE_KEY = "music-player-repeat-mode";
const PLAYBACK_STATE_STORAGE_KEY = "music-player-state";
const DEFAULT_VOLUME = 0.5;

type RepeatMode = "one" | "all";

interface Song {
  id: string;
  title: string;
  url: string;
}

export const PLAYLIST: Song[] = [
  { id: "mast-in-mist", title: "Mast in Mist", url: "/music/mast-in-mist.mid" },
  { id: "wind-ahead", title: "Wind Ahead", url: "/music/wind-ahead.mid" },
];

type OscillatorType = "square" | "triangle" | "sawtooth" | "sine";

const TRACK_INSTRUMENTS: OscillatorType[] = [
  "square", // Track 1 - Melody
  "sawtooth", // Track 2 - Harmony/Arp
  "triangle", // Track 3 - Bass
  "sine", // Track 4 - Pad
];

interface MusicPlayerState {
  isPlaying: boolean;
  isLoaded: boolean;
  currentSongIndex: number;
  volume: number;
  repeatMode: RepeatMode;
  setIsPlaying: (playing: boolean) => void;
  setIsLoaded: (loaded: boolean) => void;
  setCurrentSongIndex: (index: number) => void;
  setVolume: (volume: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
}

interface PlaybackState {
  currentSongIndex: number;
  isPlaying: boolean;
  timestamp: number;
}

const getStoredPlaybackState = (): PlaybackState | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(PLAYBACK_STATE_STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as PlaybackState;
      // Only restore if saved within last 5 minutes
      if (Date.now() - state.timestamp < 5 * 60 * 1000) {
        return state;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

const savePlaybackState = (currentSongIndex: number, isPlaying: boolean) => {
  if (typeof window === "undefined") return;
  const state: PlaybackState = {
    currentSongIndex,
    isPlaying,
    timestamp: Date.now(),
  };
  localStorage.setItem(PLAYBACK_STATE_STORAGE_KEY, JSON.stringify(state));
};

export const useMusicPlayerStore = create<MusicPlayerState>(set => ({
  isPlaying: false,
  isLoaded: false,
  currentSongIndex: 0,
  volume: DEFAULT_VOLUME,
  repeatMode: "all",
  setIsPlaying: playing => set({ isPlaying: playing }),
  setIsLoaded: loaded => set({ isLoaded: loaded }),
  setCurrentSongIndex: index => set({ currentSongIndex: index }),
  setVolume: volume => set({ volume }),
  setRepeatMode: mode => set({ repeatMode: mode }),
}));

interface MusicPlayerContextValue {
  togglePlay: () => Promise<void>;
  playNext: () => void;
  playPrev: () => void;
  selectSong: (index: number) => void;
  toggleRepeatMode: () => void;
  setVolume: (volume: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
}

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const synthsRef = useRef<Tone.PolySynth[]>([]);
  const filtersRef = useRef<Tone.Filter[]>([]);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiRef = useRef<Midi | null>(null);
  const masterVolumeRef = useRef<Tone.Volume | null>(null);
  const wasPlayingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const shouldAutoPlayRef = useRef(false);

  const {
    isPlaying,
    currentSongIndex,
    volume,
    setIsPlaying,
    setIsLoaded,
    setCurrentSongIndex,
    setVolume: setStoreVolume,
    setRepeatMode,
  } = useMusicPlayerStore();

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (storedVolume) {
      const vol = parseFloat(storedVolume);
      if (!isNaN(vol) && vol >= 0 && vol <= 1) {
        setStoreVolume(vol);
      }
    }

    const storedRepeatMode = localStorage.getItem(REPEAT_MODE_STORAGE_KEY);
    if (storedRepeatMode === "one" || storedRepeatMode === "all") {
      setRepeatMode(storedRepeatMode);
    }

    // Restore playback state from previous page
    const playbackState = getStoredPlaybackState();
    if (playbackState) {
      setCurrentSongIndex(playbackState.currentSongIndex);
      if (playbackState.isPlaying) {
        shouldAutoPlayRef.current = true;
      }
    }
  }, [setStoreVolume, setRepeatMode, setCurrentSongIndex]);

  const getCurrentSong = useCallback((): Song => {
    const song = PLAYLIST[currentSongIndex];
    if (song) return song;
    return PLAYLIST[0]!;
  }, [currentSongIndex]);

  const createSynth = useCallback(
    (
      trackIndex: number,
      vol: number
    ): { synth: Tone.PolySynth; filter: Tone.Filter } => {
      const oscType =
        TRACK_INSTRUMENTS[trackIndex % TRACK_INSTRUMENTS.length] || "square";

      if (!masterVolumeRef.current) {
        masterVolumeRef.current = new Tone.Volume(0).toDestination();
      }

      const filter = new Tone.Filter({
        frequency: FILTER_FREQUENCY,
        type: "lowpass",
        rolloff: -12,
      }).connect(masterVolumeRef.current);

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: oscType,
        },
        envelope: {
          attack: 0.05,
          decay: 0.15,
          sustain: 0.4,
          release: 0.4,
        },
      }).connect(filter);

      synth.volume.value = Tone.gainToDb(vol);
      return { synth, filter };
    },
    []
  );

  const cleanup = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    Tone.getTransport().position = 0;

    partsRef.current.forEach(part => {
      part.stop();
      part.dispose();
    });
    synthsRef.current.forEach(synth => synth.dispose());
    filtersRef.current.forEach(filter => filter.dispose());

    partsRef.current = [];
    synthsRef.current = [];
    filtersRef.current = [];
  }, []);

  const loadMidi = useCallback(
    async (url: string) => {
      cleanup();
      setIsLoaded(false);

      try {
        const midi = await Midi.fromUrl(url);
        midiRef.current = midi;
        setIsLoaded(true);
        return true;
      } catch (error) {
        console.warn("Failed to load MIDI file:", error);
        return false;
      }
    },
    [cleanup, setIsLoaded]
  );

  const startPlayback = useCallback(async () => {
    const midi = midiRef.current;
    if (!midi) return;

    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    cleanup();

    Tone.getTransport().bpm.value = midi.header.tempos[0]?.bpm || 120;

    // Save playback state
    savePlaybackState(useMusicPlayerStore.getState().currentSongIndex, true);

    let maxEndTime = 0;
    midi.tracks.forEach(track => {
      track.notes.forEach(note => {
        const endTime = note.time + note.duration;
        if (endTime > maxEndTime) {
          maxEndTime = endTime;
        }
      });
    });

    midi.tracks.forEach((track, trackIndex) => {
      if (track.notes.length === 0) return;

      const baseVolume = trackIndex === 0 ? 0.6 : trackIndex === 2 ? 0.45 : 0.3;
      const { synth, filter } = createSynth(trackIndex, baseVolume);
      synthsRef.current.push(synth);
      filtersRef.current.push(filter);

      const events = track.notes.map(note => ({
        time: note.time,
        note: note.name,
        duration: note.duration,
        velocity: note.velocity,
      }));

      const part = new Tone.Part((time, event) => {
        synth.triggerAttackRelease(
          event.note,
          event.duration,
          time,
          event.velocity
        );
      }, events);

      part.loop = true;
      part.loopEnd = maxEndTime;
      part.start(0);

      partsRef.current.push(part);
    });

    Tone.getTransport().start();
    setIsPlaying(true);
  }, [cleanup, createSynth, setIsPlaying]);

  const stopPlayback = useCallback(() => {
    Tone.getTransport().pause();
    setIsPlaying(false);
    // Save paused state
    savePlaybackState(useMusicPlayerStore.getState().currentSongIndex, false);
  }, [setIsPlaying]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (
        Tone.getTransport().state === "paused" &&
        partsRef.current.length > 0
      ) {
        Tone.getTransport().start();
        setIsPlaying(true);
      } else {
        await startPlayback();
      }
    }
  }, [isPlaying, startPlayback, stopPlayback, setIsPlaying]);

  const playNext = useCallback(() => {
    wasPlayingRef.current = isPlaying;
    const nextIndex = (currentSongIndex + 1) % PLAYLIST.length;
    setCurrentSongIndex(nextIndex);
    savePlaybackState(nextIndex, isPlaying);
  }, [currentSongIndex, isPlaying, setCurrentSongIndex]);

  const playPrev = useCallback(() => {
    wasPlayingRef.current = isPlaying;
    const prevIndex =
      (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentSongIndex(prevIndex);
    savePlaybackState(prevIndex, isPlaying);
  }, [currentSongIndex, isPlaying, setCurrentSongIndex]);

  const selectSong = useCallback(
    (index: number) => {
      wasPlayingRef.current = isPlaying;
      setCurrentSongIndex(index);
      savePlaybackState(index, isPlaying);
    },
    [isPlaying, setCurrentSongIndex]
  );

  const toggleRepeatMode = useCallback(() => {
    const currentMode = useMusicPlayerStore.getState().repeatMode;
    const newMode = currentMode === "one" ? "all" : "one";
    setRepeatMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem(REPEAT_MODE_STORAGE_KEY, newMode);
    }
  }, [setRepeatMode]);

  const setVolume = useCallback(
    (newVolume: number) => {
      setStoreVolume(newVolume);
      if (masterVolumeRef.current) {
        const dbValue = newVolume === 0 ? -Infinity : Tone.gainToDb(newVolume);
        masterVolumeRef.current.volume.value = dbValue;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(VOLUME_STORAGE_KEY, newVolume.toString());
      }
    },
    [setStoreVolume]
  );

  // Load MIDI when song changes
  useEffect(() => {
    const currentSong = getCurrentSong();
    const loadAndPlay = async () => {
      const loaded = await loadMidi(currentSong.url);
      if (loaded && (wasPlayingRef.current || shouldAutoPlayRef.current)) {
        shouldAutoPlayRef.current = false;
        await startPlayback();
      }
    };
    loadAndPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIndex]);

  // Update master volume when volume changes
  useEffect(() => {
    if (masterVolumeRef.current) {
      const dbValue = volume === 0 ? -Infinity : Tone.gainToDb(volume);
      masterVolumeRef.current.volume.value = dbValue;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (masterVolumeRef.current) {
        masterVolumeRef.current.dispose();
        masterVolumeRef.current = null;
      }
    };
  }, [cleanup]);

  const contextValue: MusicPlayerContextValue = {
    togglePlay,
    playNext,
    playPrev,
    selectSong,
    toggleRepeatMode,
    setVolume,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}
