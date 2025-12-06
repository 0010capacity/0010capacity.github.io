"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

// Low-pass filter for softer sound
const FILTER_FREQUENCY = 2000;
const VOLUME_STORAGE_KEY = "music-player-volume";
const REPEAT_MODE_STORAGE_KEY = "music-player-repeat-mode";
const DEFAULT_VOLUME = 0.5;

type RepeatMode = "one" | "all";

interface Song {
  id: string;
  title: string;
  url: string;
}

const PLAYLIST: Song[] = [
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

const getStoredVolume = (): number => {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (stored) {
    const vol = parseFloat(stored);
    if (!isNaN(vol) && vol >= 0 && vol <= 1) return vol;
  }
  return DEFAULT_VOLUME;
};

const getStoredRepeatMode = (): RepeatMode => {
  if (typeof window === "undefined") return "all";
  const stored = localStorage.getItem(REPEAT_MODE_STORAGE_KEY);
  if (stored === "one" || stored === "all") return stored;
  return "all";
};

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [showVolume, setShowVolume] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");
  const synthsRef = useRef<Tone.PolySynth[]>([]);
  const filtersRef = useRef<Tone.Filter[]>([]);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiRef = useRef<Midi | null>(null);
  const masterVolumeRef = useRef<Tone.Volume | null>(null);
  const wasPlayingRef = useRef(false);

  // Load volume and repeat mode from localStorage on mount
  useEffect(() => {
    const storedVolume = getStoredVolume();
    setVolume(storedVolume);
    const storedRepeatMode = getStoredRepeatMode();
    setRepeatMode(storedRepeatMode);
  }, []);

  const getCurrentSong = (): Song => {
    const song = PLAYLIST[currentSongIndex];
    if (song) return song;
    return {
      id: "mast-in-mist",
      title: "Mast in Mist",
      url: "/music/mast-in-mist.mid",
    };
  };

  const currentSong = getCurrentSong();

  const createSynth = useCallback(
    (
      trackIndex: number,
      vol: number
    ): { synth: Tone.PolySynth; filter: Tone.Filter } => {
      const oscType =
        TRACK_INSTRUMENTS[trackIndex % TRACK_INSTRUMENTS.length] || "square";

      // Create master volume if not exists
      if (!masterVolumeRef.current) {
        masterVolumeRef.current = new Tone.Volume(0).toDestination();
      }

      // Create a low-pass filter to soften harsh frequencies
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
          attack: 0.05, // Softer attack
          decay: 0.15,
          sustain: 0.4,
          release: 0.4, // Longer release for smoother sound
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
    [cleanup]
  );

  const startPlayback = useCallback(async () => {
    const midi = midiRef.current;
    if (!midi) return;

    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    cleanup();

    Tone.getTransport().bpm.value = midi.header.tempos[0]?.bpm || 120;

    // Calculate total duration for looping
    let maxEndTime = 0;
    midi.tracks.forEach(track => {
      track.notes.forEach(note => {
        const endTime = note.time + note.duration;
        if (endTime > maxEndTime) {
          maxEndTime = endTime;
        }
      });
    });

    // Create synths and parts for each track
    midi.tracks.forEach((track, trackIndex) => {
      if (track.notes.length === 0) return;

      // Calculate volume based on track (melody louder, bass medium, etc.)
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
  }, [cleanup, createSynth]);

  const stopPlayback = useCallback(() => {
    Tone.getTransport().pause();
    setIsPlaying(false);
  }, []);

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
  }, [isPlaying, startPlayback, stopPlayback]);

  const playNext = useCallback(() => {
    wasPlayingRef.current = isPlaying;
    const nextIndex = (currentSongIndex + 1) % PLAYLIST.length;
    setCurrentSongIndex(nextIndex);
  }, [currentSongIndex, isPlaying]);

  const playPrev = useCallback(() => {
    wasPlayingRef.current = isPlaying;
    const prevIndex =
      (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentSongIndex(prevIndex);
  }, [currentSongIndex, isPlaying]);

  const selectSong = useCallback(
    (index: number) => {
      wasPlayingRef.current = isPlaying;
      setCurrentSongIndex(index);
      setShowPlaylist(false);
    },
    [isPlaying]
  );

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      const newMode = prev === "one" ? "all" : "one";
      if (typeof window !== "undefined") {
        localStorage.setItem(REPEAT_MODE_STORAGE_KEY, newMode);
      }
      return newMode;
    });
  }, []);

  // Load MIDI when song changes and auto-play if was playing
  useEffect(() => {
    const loadAndPlay = async () => {
      const loaded = await loadMidi(currentSong.url);
      if (loaded && wasPlayingRef.current) {
        await startPlayback();
      }
    };
    loadAndPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong.url]);

  // Update master volume when volume changes
  useEffect(() => {
    if (masterVolumeRef.current) {
      // Convert 0-1 range to dB (-60 to 0)
      const dbValue = volume === 0 ? -Infinity : Tone.gainToDb(volume);
      masterVolumeRef.current.volume.value = dbValue;
    }
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
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

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    },
    []
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Playlist Dropdown */}
      {showPlaylist && (
        <div className="absolute bottom-16 right-0 w-48 bg-neutral-900/95 border border-neutral-700 rounded-lg overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="p-2 border-b border-neutral-800">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">
              Playlist
            </span>
          </div>
          <ul>
            {PLAYLIST.map((song, index) => (
              <li key={song.id}>
                <button
                  onClick={() => selectSong(index)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    index === currentSongIndex
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                  }`}
                >
                  {index === currentSongIndex && isPlaying && (
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  )}
                  {song.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Volume Slider Popup */}
      {showVolume && (
        <div className="absolute bottom-16 right-12 bg-neutral-900/95 border border-neutral-700 rounded-lg p-3 backdrop-blur-sm shadow-xl">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="accent-neutral-400 cursor-pointer"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              height: "80px",
              width: "4px",
            }}
          />
        </div>
      )}

      {/* Player Controls */}
      <div className="flex items-center gap-1 bg-neutral-900/80 border border-neutral-700 rounded-full px-2 py-1 backdrop-blur-sm">
        {/* Prev Button */}
        <button
          onClick={playPrev}
          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          aria-label="이전 곡"
          title="이전 곡"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isPlaying ? "일시정지" : "재생"}
          title={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={playNext}
          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          aria-label="다음 곡"
          title="다음 곡"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        {/* Repeat Mode Toggle */}
        <button
          onClick={toggleRepeatMode}
          className={`w-8 h-8 flex items-center justify-center transition-colors ${
            repeatMode === "one"
              ? "text-green-400"
              : "text-neutral-400 hover:text-white"
          }`}
          aria-label={repeatMode === "one" ? "한 곡 반복" : "전체 반복"}
          title={repeatMode === "one" ? "한 곡 반복" : "전체 반복"}
        >
          {repeatMode === "one" ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              <text
                x="12"
                y="14.5"
                fontSize="7"
                textAnchor="middle"
                fill="currentColor"
              >
                1
              </text>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          )}
        </button>

        {/* Volume Control */}
        <button
          onClick={() => setShowVolume(!showVolume)}
          className={`w-8 h-8 flex items-center justify-center transition-colors ${
            showVolume ? "text-white" : "text-neutral-400 hover:text-white"
          }`}
          aria-label="볼륨"
          title="볼륨"
        >
          {volume === 0 ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : volume < 0.5 ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-700 mx-1" />

        {/* Playlist Toggle */}
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className={`w-8 h-8 flex items-center justify-center transition-colors ${
            showPlaylist ? "text-white" : "text-neutral-400 hover:text-white"
          }`}
          aria-label="재생목록"
          title="재생목록"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
        </button>
      </div>

      {/* Song Title */}
      <div className="text-center mt-1">
        <span className="text-xs text-neutral-500">{currentSong.title}</span>
      </div>
    </div>
  );
}
