"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";
import {
  parseMusicScore,
  type MusicScore,
  type Track,
} from "@/lib/musicParser";

interface Song {
  id: string;
  title: string;
  url: string;
}

const PLAYLIST: Song[] = [
  { id: "mast-in-mist", title: "Mast in Mist", url: "/music/mast-in-mist.txt" },
  { id: "wind-ahead", title: "Wind Ahead", url: "/music/wind-ahead.txt" },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const synthsRef = useRef<Tone.Synth[]>([]);
  const sequencesRef = useRef<Tone.Part[]>([]);
  const scoreRef = useRef<MusicScore | null>(null);

  const getCurrentSong = (): Song => {
    const song = PLAYLIST[currentSongIndex];
    if (song) return song;
    return { id: "mist", title: "Mist of the Sea", url: "/music/theme.txt" };
  };

  const currentSong = getCurrentSong();

  const createSynth = useCallback((track: Track): Tone.Synth => {
    const synth = new Tone.Synth({
      oscillator: {
        type: track.instrument,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
    }).toDestination();

    synth.volume.value = Tone.gainToDb(track.volume);
    return synth;
  }, []);

  const scheduleTrack = useCallback(
    (track: Track, synth: Tone.Synth): Tone.Part => {
      const events: { time: number; note: string; duration: string }[] = [];
      let currentTime = 0;

      const durationToSeconds = (duration: string, bpm: number): number => {
        const quarterNote = 60 / bpm;
        const durationMap: Record<string, number> = {
          "1n": 4,
          "2n": 2,
          "4n": 1,
          "8n": 0.5,
          "16n": 0.25,
          "32n": 0.125,
        };
        return (durationMap[duration] || 1) * quarterNote;
      };

      const bpm = scoreRef.current?.bpm || 120;

      for (const note of track.notes) {
        const durationInSeconds = durationToSeconds(note.duration, bpm);

        if (note.pitch !== "-") {
          events.push({
            time: currentTime,
            note: note.pitch,
            duration: note.duration,
          });
        }

        currentTime += durationInSeconds;
      }

      const part = new Tone.Part((time, event) => {
        synth.triggerAttackRelease(event.note, event.duration, time);
      }, events);

      part.loop = true;
      part.loopEnd = currentTime;

      return part;
    },
    []
  );

  const cleanup = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    sequencesRef.current.forEach(seq => {
      seq.stop();
      seq.dispose();
    });
    synthsRef.current.forEach(synth => synth.dispose());
    sequencesRef.current = [];
    synthsRef.current = [];
  }, []);

  const loadScore = useCallback(
    async (url: string) => {
      cleanup();
      setIsLoaded(false);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn("Music score not found:", url);
          return;
        }
        const content = await response.text();
        const score = parseMusicScore(content);
        scoreRef.current = score;
        setIsLoaded(true);
      } catch (error) {
        console.warn("Failed to load music score:", error);
      }
    },
    [cleanup]
  );

  const startPlayback = useCallback(async () => {
    if (!scoreRef.current) return;

    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }

    cleanup();

    Tone.getTransport().bpm.value = scoreRef.current.bpm;

    for (const track of scoreRef.current.tracks) {
      const synth = createSynth(track);
      synthsRef.current.push(synth);

      const sequence = scheduleTrack(track, synth);
      sequence.start(0);
      sequencesRef.current.push(sequence);
    }

    Tone.getTransport().start();
    setIsPlaying(true);
  }, [cleanup, createSynth, scheduleTrack]);

  const stopPlayback = useCallback(() => {
    Tone.getTransport().pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (Tone.getTransport().state === "paused") {
        Tone.getTransport().start();
        setIsPlaying(true);
      } else {
        await startPlayback();
      }
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  const playNext = useCallback(() => {
    const nextIndex = (currentSongIndex + 1) % PLAYLIST.length;
    setCurrentSongIndex(nextIndex);
  }, [currentSongIndex]);

  const playPrev = useCallback(() => {
    const prevIndex =
      (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentSongIndex(prevIndex);
  }, [currentSongIndex]);

  const selectSong = useCallback((index: number) => {
    setCurrentSongIndex(index);
    setShowPlaylist(false);
  }, []);

  // Load score when song changes
  useEffect(() => {
    loadScore(currentSong.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong.url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Playlist Dropdown */}
      {showPlaylist && (
        <div className="absolute bottom-14 right-0 w-48 bg-neutral-900/95 border border-neutral-700 rounded-lg overflow-hidden backdrop-blur-sm mb-2">
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
