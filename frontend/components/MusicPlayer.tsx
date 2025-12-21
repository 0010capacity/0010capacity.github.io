"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useMusicPlayer,
  useMusicPlayerStore,
  PLAYLIST,
} from "./MusicPlayerProvider";
import { useSnowfall } from "./SnowfallProvider";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Slider,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import {
  ChevronsLeft,
  ChevronsRight,
  List,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Repeat,
  Repeat1,
  Snowflake,
  Volume2,
  VolumeX,
  Volume1,
} from "lucide-react";

const PLAYER_COLLAPSED_KEY = "music-player-collapsed";

export default function MusicPlayer() {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const { isEnabled: snowfallEnabled, toggle: toggleSnowfall } = useSnowfall();

  const currentSong = PLAYLIST[currentSongIndex] ?? PLAYLIST[0];

  // Load collapsed state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(PLAYER_COLLAPSED_KEY);
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(PLAYER_COLLAPSED_KEY, String(newValue));
      }
      // Close popups when collapsing
      if (newValue) {
        setShowPlaylist(false);
        setShowVolume(false);
      }
      return newValue;
    });
  }, []);

  const handleSelectSong = useCallback(
    (index: number) => {
      selectSong(index);
      setShowPlaylist(false);
    },
    [selectSong]
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      setVolume(value / 100);
    },
    [setVolume]
  );

  // Collapsed state - minimal floating button
  if (isCollapsed) {
    return (
      <Box pos="fixed" bottom={16} right={16} style={{ zIndex: 1000 }}>
        <ActionIcon
          onClick={handleToggleCollapse}
          size="xl"
          radius="xl"
          color="dark"
          variant="filled"
          style={{
            boxShadow: "var(--mantine-shadow-xl)",
            border: "1px solid var(--mantine-color-dark-4)",
          }}
          aria-label="플레이어 열기"
          title="플레이어 열기"
        >
          {isPlaying ? (
            <Box w={12} h={12} bg="green.5" style={{ borderRadius: "50%" }} />
          ) : (
            <Maximize2 size={20} />
          )}
        </ActionIcon>
      </Box>
    );
  }

  return (
    <Box pos="fixed" bottom={16} right={16} style={{ zIndex: 1000 }}>
      {/* Song Title */}
      <Text
        size="xs"
        c="dimmed"
        ta="center"
        mb={8}
        style={{
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {currentSong?.title}
      </Text>

      {/* Playlist Dropdown */}
      <Transition transition="slide-up" mounted={showPlaylist} duration={200}>
        {styles => (
          <Paper
            shadow="xl"
            radius="md"
            withBorder
            p="xs"
            pos="absolute"
            bottom={70}
            right={0}
            w={200}
            style={styles}
            bg="dark.7"
          >
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4} px={8}>
              Playlist
            </Text>
            <Stack gap={2} mah={200} style={{ overflowY: "auto" }}>
              {PLAYLIST.map((song, index) => (
                <Box
                  key={song.id}
                  component="button"
                  onClick={() => handleSelectSong(index)}
                  p={8}
                  style={{
                    textAlign: "left",
                    borderRadius: "var(--mantine-radius-sm)",
                    backgroundColor:
                      index === currentSongIndex
                        ? "var(--mantine-color-dark-5)"
                        : "transparent",
                    color:
                      index === currentSongIndex
                        ? "var(--mantine-color-white)"
                        : "var(--mantine-color-dimmed)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "var(--mantine-font-size-sm)",
                    transition: "background-color 0.2s",
                  }}
                >
                  <Group gap="xs" wrap="nowrap">
                    {index === currentSongIndex && isPlaying && (
                      <Box
                        w={8}
                        h={8}
                        bg="green.5"
                        style={{ borderRadius: "50%" }}
                      />
                    )}
                    <Text size="sm" truncate>
                      {song.title}
                    </Text>
                  </Group>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}
      </Transition>

      {/* Volume Slider Popup */}
      <Transition transition="slide-up" mounted={showVolume} duration={200}>
        {styles => (
          <Paper
            shadow="xl"
            radius="md"
            withBorder
            p="md"
            pos="absolute"
            bottom={70}
            right={48}
            w={150}
            style={styles}
            bg="dark.7"
          >
            <Slider
              value={volume * 100}
              onChange={handleVolumeChange}
              size="sm"
              color="gray"
              label={value => `${value.toFixed(0)}%`}
            />
          </Paper>
        )}
      </Transition>

      {/* Player Controls */}
      <Paper
        radius="xl"
        withBorder
        p={6}
        shadow="lg"
        bg="dark.8"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <Group gap={4}>
          <ActionIcon
            variant="transparent"
            color="dimmed"
            onClick={handleToggleCollapse}
            title="플레이어 접기"
          >
            <Minimize2 size={16} />
          </ActionIcon>

          <ActionIcon
            variant="transparent"
            color="dimmed"
            onClick={playPrev}
            title="이전 곡"
          >
            <ChevronsLeft size={16} />
          </ActionIcon>

          <ActionIcon
            variant="filled"
            color="dark.4"
            radius="xl"
            size="lg"
            onClick={togglePlay}
            disabled={!isLoaded}
            title={isPlaying ? "일시정지" : "재생"}
          >
            {isPlaying ? (
              <Pause size={16} fill="white" />
            ) : (
              <Play size={16} fill="white" />
            )}
          </ActionIcon>

          <ActionIcon
            variant="transparent"
            color="dimmed"
            onClick={playNext}
            title="다음 곡"
          >
            <ChevronsRight size={16} />
          </ActionIcon>

          <ActionIcon
            variant="transparent"
            color={repeatMode === "one" ? "green" : "dimmed"}
            onClick={toggleRepeatMode}
            title={repeatMode === "one" ? "한 곡 반복" : "전체 반복"}
          >
            {repeatMode === "one" ? (
              <Repeat1 size={16} />
            ) : (
              <Repeat size={16} />
            )}
          </ActionIcon>

          <ActionIcon
            variant="transparent"
            color={showVolume ? "white" : "dimmed"}
            onClick={() => {
              setShowVolume(!showVolume);
              setShowPlaylist(false);
            }}
            title="볼륨"
          >
            {volume === 0 ? (
              <VolumeX size={16} />
            ) : volume < 0.5 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </ActionIcon>

          <Box w={1} h={20} bg="dark.4" mx={4} />

          <ActionIcon
            variant="transparent"
            color={snowfallEnabled ? "white" : "dimmed"}
            onClick={toggleSnowfall}
            title={snowfallEnabled ? "눈 효과 끄기" : "눈 효과 켜기"}
          >
            <Snowflake size={16} />
          </ActionIcon>

          <ActionIcon
            variant="transparent"
            color={showPlaylist ? "white" : "dimmed"}
            onClick={() => {
              setShowPlaylist(!showPlaylist);
              setShowVolume(false);
            }}
            title="재생목록"
          >
            <List size={16} />
          </ActionIcon>
        </Group>
      </Paper>
    </Box>
  );
}
