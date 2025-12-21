"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Stack,
  Group,
  Button,
  Center,
  Loader,
  Paper,
  Text,
  Box,
  Title,
  Anchor,
  Skeleton,
  Badge,
} from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { appsApi } from "@/lib/api";
import { App, DistributionChannel, Platform } from "@/lib/types";

// Navigation Context for SPA-style routing
interface NavState {
  view: "list" | "detail";
  slug?: string;
}

interface NavContextType {
  navState: NavState;
  navigate: (state: NavState) => void;
  goBack: () => void;
}

const NavContext = createContext<NavContextType | null>(null);

function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

// Platform display info
const PLATFORM_INFO: Record<Platform, { name: string; color: string }> = {
  ios: { name: "iOS", color: "blue" },
  android: { name: "Android", color: "green" },
  web: { name: "Web", color: "purple" },
  windows: { name: "Windows", color: "cyan" },
  macos: { name: "macOS", color: "gray" },
  linux: { name: "Linux", color: "orange" },
  game: { name: "Game", color: "pink" },
};

// Distribution channel display names
const CHANNEL_NAMES: Record<string, string> = {
  app_store: "App Store",
  play_store: "Google Play",
  web: "Web App",
  steam: "Steam",
  stove: "Stove",
  epic: "Epic Games",
  gog: "GOG",
  itch: "itch.io",
  landing_page: "Website",
  direct_download: "Download",
  github: "GitHub",
  other: "Link",
};

function PlatformBadge({ platform }: { platform: Platform }) {
  const info = PLATFORM_INFO[platform] || {
    name: platform,
    color: "gray",
  };
  return (
    <Badge color={info.color} size="xs" variant="light">
      {info.name}
    </Badge>
  );
}

function getChannelName(channel: DistributionChannel): string {
  if (channel.label) return channel.label;
  return CHANNEL_NAMES[channel.type] || channel.type;
}

function AppListSkeleton() {
  return (
    <Stack gap="md" aria-label="앱 목록 로딩" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper
          key={i}
          p="lg"
          withBorder
          style={{
            borderColor: "var(--mantine-color-dark-4)",
            transition: "all 0.2s ease",
          }}
        >
          <Group justify="space-between" align="flex-start" gap="lg">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" mb="sm">
                <Skeleton height={16} width={60} radius="sm" />
                <Skeleton height={16} width={48} radius="sm" />
              </Group>
              <Skeleton height={24} width="70%" radius="sm" mb="sm" />
              <Skeleton height={16} width="100%" radius="sm" />
            </Box>
            <Skeleton height={16} width={80} radius="sm" />
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

// App List Component
function AppList() {
  const { navigate } = useNav();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await appsApi.list({ limit: 50 });
        // API might return array directly or wrapped
        const appsList = Array.isArray(data) ? data : [];
        setApps(appsList as App[]);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "앱을 불러오지 못했습니다"
        );
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  return (
    <Box mih="100vh" py="xl">
      <Container size="sm">
        <Stack gap="xl">
          {/* Header */}
          <Box
            pb="xl"
            style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
          >
            <Button
              onClick={() => (window.location.href = "/")}
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<ArrowLeft size={16} />}
              mb="lg"
              style={{
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "var(--mantine-color-accent-5)",
                },
              }}
            >
              돌아가기
            </Button>

            <Title
              order={1}
              fw={300}
              size="h1"
              mb="sm"
              style={{
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              앱
            </Title>

            <Text size="md" c="dimmed" style={{ fontSize: "1.05rem" }}>
              제가 만든 앱들입니다
            </Text>

            {apps.length > 0 && (
              <Text size="xs" c="dark.6" mt="md">
                총 {apps.length}개의 앱
              </Text>
            )}
          </Box>

          {/* Error Message */}
          {error && (
            <Paper
              withBorder
              p="md"
              bg="rgba(255, 0, 0, 0.05)"
              style={{
                borderColor: "var(--mantine-color-red-9)",
                borderLeft: "3px solid var(--mantine-color-red-9)",
              }}
            >
              <Group gap="sm">
                <Text size="sm" c="red.4">
                  오류가 발생했습니다
                </Text>
                <Text size="xs" c="red.6">
                  {error}
                </Text>
              </Group>
            </Paper>
          )}

          {/* Loading State */}
          {loading && <AppListSkeleton />}

          {/* Apps List */}
          {!loading && apps.length > 0 && (
            <Stack gap="md">
              {apps.map(app => (
                <Anchor
                  component="button"
                  key={app.id}
                  onClick={() => navigate({ view: "detail", slug: app.slug })}
                  onMouseEnter={() => setHoveredSlug(app.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  underline="never"
                  style={{
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <Paper
                    p="lg"
                    withBorder
                    style={{
                      borderColor:
                        hoveredSlug === app.slug
                          ? "var(--mantine-color-accent-5)"
                          : "var(--mantine-color-dark-4)",
                      background:
                        hoveredSlug === app.slug
                          ? "linear-gradient(135deg, rgba(58, 158, 236, 0.05) 0%, rgba(58, 158, 236, 0.02) 100%)"
                          : "transparent",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      transform:
                        hoveredSlug === app.slug
                          ? "translateX(4px)"
                          : "translateX(0)",
                      boxShadow:
                        hoveredSlug === app.slug
                          ? "0 4px 12px rgba(58, 158, 236, 0.1)"
                          : "none",
                    }}
                  >
                    <Group justify="space-between" align="flex-start" gap="md">
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        {/* Platforms */}
                        {(app.platforms || []).length > 0 && (
                          <Group gap="xs" mb="sm">
                            {app.platforms!.map(platform => (
                              <PlatformBadge
                                key={platform}
                                platform={platform as Platform}
                              />
                            ))}
                          </Group>
                        )}

                        {/* Title */}
                        <Title
                          order={2}
                          size="h4"
                          fw={600}
                          c={hoveredSlug === app.slug ? "white" : "gray.0"}
                          mb="sm"
                          style={{
                            transition: "color 0.2s ease",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.3,
                          }}
                        >
                          {app.name}
                        </Title>

                        {/* Description/Excerpt */}
                        {app.description && (
                          <Text
                            size="sm"
                            c="dimmed"
                            lineClamp={2}
                            style={{
                              transition: "color 0.2s ease",
                            }}
                          >
                            {app.description}
                          </Text>
                        )}
                      </Box>

                      {/* Arrow icon for interaction cue */}
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: hoveredSlug === app.slug ? 1 : 0.4,
                          transition: "all 0.2s ease",
                          transform:
                            hoveredSlug === app.slug
                              ? "translateX(4px)"
                              : "translateX(0)",
                        }}
                      >
                        <ArrowRight
                          size={20}
                          style={{
                            color: "var(--mantine-color-accent-5)",
                          }}
                        />
                      </Box>
                    </Group>
                  </Paper>
                </Anchor>
              ))}
            </Stack>
          )}

          {/* Empty State */}
          {!loading && apps.length === 0 && !error && (
            <Center py="xl">
              <Stack align="center">
                <Text c="dimmed">아직 등록된 앱이 없습니다</Text>
                <Text size="sm" c="dimmed">
                  곧 추가될 예정입니다
                </Text>
              </Stack>
            </Center>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// App Detail Component
function AppDetail({ slug }: { slug: string }) {
  const { navigate } = useNav();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApp = async () => {
      try {
        setLoading(true);
        const data = (await appsApi.getBySlug(slug)) as App;
        setApp(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "앱을 불러오지 못했습니다"
        );
        setApp(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchApp();
    }
  }, [slug]);

  if (loading) {
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  if (error || !app) {
    return (
      <Box mih="100vh" py="xl">
        <Container size="sm">
          <Stack gap="lg">
            <Button
              onClick={() => navigate({ view: "list" })}
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<ArrowLeft size={16} />}
              style={{
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "var(--mantine-color-accent-5)",
                },
              }}
            >
              앱 목록으로
            </Button>
            <Text c="dimmed">{error || "앱을 찾을 수 없습니다"}</Text>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box mih="100vh" py="xl">
      <Container size="sm">
        <Stack gap="xl">
          <Button
            onClick={() => navigate({ view: "list" })}
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
            style={{
              transition: "all 0.2s ease",
              "&:hover": {
                color: "var(--mantine-color-accent-5)",
              },
            }}
          >
            돌아가기
          </Button>

          {/* App Header */}
          <Box
            pb="xl"
            style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
          >
            <Group gap="md" align="flex-start" mb="md">
              {app.icon_url && (
                <Box
                  component="img"
                  src={app.icon_url}
                  alt={app.name}
                  w={80}
                  h={80}
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    objectFit: "cover",
                    border: "1px solid var(--mantine-color-dark-4)",
                  }}
                />
              )}
              <Stack gap="sm" style={{ flex: 1 }}>
                <div>
                  <Title order={1} fw={600} mb="sm">
                    {app.name}
                  </Title>
                  {(app.platforms || []).length > 0 && (
                    <Group gap="xs">
                      {app.platforms!.map(platform => (
                        <PlatformBadge
                          key={platform}
                          platform={platform as Platform}
                        />
                      ))}
                    </Group>
                  )}
                </div>
                {app.description && (
                  <Text size="sm" c="dimmed">
                    {app.description}
                  </Text>
                )}
              </Stack>
            </Group>
          </Box>

          {/* Distribution Channels */}
          {app.distribution_channels &&
            app.distribution_channels.length > 0 && (
              <Stack gap="md">
                <div>
                  <Title order={2} size="h5" fw={600} mb="sm">
                    다운로드
                  </Title>
                  <Text size="sm" c="dimmed" mb="md">
                    다음 플랫폼에서 앱을 다운로드할 수 있습니다
                  </Text>
                </div>
                <Group gap="sm">
                  {app.distribution_channels.map((channel, idx) => (
                    <Button
                      key={idx}
                      component="a"
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="light"
                      color="accent"
                      rightSection={<ArrowRight size={16} />}
                    >
                      {getChannelName(channel)}
                    </Button>
                  ))}
                </Group>
              </Stack>
            )}

          {/* Screenshots */}
          {app.screenshots && app.screenshots.length > 0 && (
            <Stack gap="md">
              <div>
                <Title order={2} size="h5" fw={600} mb="sm">
                  스크린샷
                </Title>
              </div>
              <Group gap="md">
                {app.screenshots.map((screenshot, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={screenshot}
                    alt={`Screenshot ${idx + 1}`}
                    style={{
                      maxWidth: "200px",
                      borderRadius: "var(--mantine-radius-md)",
                      border: "1px solid var(--mantine-color-dark-4)",
                    }}
                  />
                ))}
              </Group>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// Main Page Component with SPA-style Routing
export default function AppsPageClient() {
  const params = useParams();
  const paramsArray = params?.params as string[] | undefined;

  const [navState, setNavState] = useState<NavState>({ view: "list" });
  const [history, setHistory] = useState<NavState[]>([]);

  // Parse URL params on mount to determine initial state
  useEffect(() => {
    if (paramsArray && paramsArray.length === 1 && paramsArray[0]) {
      setNavState({ view: "detail", slug: paramsArray[0] });
    }
  }, [paramsArray]);

  const navigate = useCallback(
    (state: NavState) => {
      setHistory(prev => [...prev, navState]);
      setNavState(state);
    },
    [navState]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevState = newHistory.pop();
      setHistory(newHistory);
      setNavState(prevState || { view: "list" });
    } else {
      setNavState({ view: "list" });
    }
  }, [history]);

  const renderView = () => {
    switch (navState.view) {
      case "detail":
        return navState.slug ? <AppDetail slug={navState.slug} /> : <AppList />;
      case "list":
      default:
        return <AppList />;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
