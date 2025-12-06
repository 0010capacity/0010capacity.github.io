"use client";

import { useState, useCallback } from "react";
import {
  useMusicPlayer,
  useMusicPlayerStore,
  PLAYLIST,
} from "./MusicPlayerProvider";

export default function MusicPlayer() {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const { isPlaying, isLoaded, currentSongIndex, volume, repeatMode } =
    useMusicPlayerStore();

  const {
    togglePlay,
    playNext,
    playPrev,
    selectSong,
    toggleRepeatMode,
    setVolume,
  } = useMusicPlayer();

  const currentSong = PLAYLIST[currentSongIndex] ?? PLAYLIST[0];

  const handleSelectSong = useCallback(
    (index: number) => {
      selectSong(index);
      setShowPlaylist(false);
    },
    [selectSong]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    },
    [setVolume]
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
                  onClick={() => handleSelectSong(index)}
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
        <span className="text-xs text-neutral-500">{currentSong?.title}</span>
      </div>
    </div>
  );
}
