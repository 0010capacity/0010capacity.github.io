"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "@mantine/core";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { appsApi } from "@/lib/api";
import { App, DistributionChannel, Platform } from "@/lib/types";

// Platform display names
const PLATFORM_NAMES: Record<Platform, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  game: "Game",
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

function getChannelName(channel: DistributionChannel): string {
  if (channel.label) return channel.label;
  return CHANNEL_NAMES[channel.type] || channel.type;
}

function AppListSkeleton() {
  return (
    <Stack gap="md" aria-label="앱 목록 로딩" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper key={i} p="lg" withBorder>
          <Group justify="space-between" align="flex-start" gap="lg">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Skeleton height={24} width="70%" radius="sm" mb="sm" />
              <Skeleton height={16} width="100%" radius="sm" />
            </Box>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

// App List Component
function AppList() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = (await appsApi.list({ limit: 50 })) as {
          apps?: App[];
        };
        setApps(data.apps || []);
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
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <Button
              component={Link}
              href="/"
              variant="subtle"
              size="sm"
              leftSection={<ArrowLeft size={16} />}
              mb="lg"
            >
              돌아가기
            </Button>

            <Title order={1} fw={400} size="h2" mb="sm">
              앱
            </Title>

            {apps.length > 0 && (
              <Text size="xs" c="dimmed">
                총 {apps.length}개
              </Text>
            )}
          </Box>

          {/* Error Message */}
          {error && (
            <Paper withBorder p="md">
              <Text size="sm">{error}</Text>
            </Paper>
          )}

          {/* Loading State */}
          {loading && <AppListSkeleton />}

          {/* Apps List */}
          {!loading && apps.length > 0 && (
            <Stack gap="md">
              {apps.map(app => (
                <Anchor
                  component={Link}
                  key={app.id}
                  href={`/apps/${app.slug}`}
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
                      borderColor: "var(--color-border)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease-in-out",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = "var(--color-text-primary)";
                      el.style.backgroundColor = "var(--color-foreground)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = "var(--color-border)";
                      el.style.backgroundColor = "transparent";
                    }}
                  >
                    <Group justify="space-between" align="flex-start" gap="md">
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Title order={2} size="h4" fw={500} mb="xs">
                          {app.name}
                        </Title>

                        {app.description && (
                          <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                            {app.description}
                          </Text>
                        )}

                        <Group gap="sm">
                          {app.platforms && app.platforms.length > 0 && (
                            <Text size="xs" c="dimmed">
                              {app.platforms
                                .map(p => PLATFORM_NAMES[p] || p)
                                .join(", ")}
                            </Text>
                          )}
                        </Group>
                      </Box>

                      <ArrowRight size={16} style={{ flexShrink: 0 }} />
                    </Group>
                  </Paper>
                </Anchor>
              ))}
            </Stack>
          )}

          {/* Empty State */}
          {!loading && apps.length === 0 && !error && (
            <Center py="xl">
              <Text c="dimmed">등록된 앱이 없습니다</Text>
            </Center>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// App Detail Component
function AppDetail({ slug }: { slug: string }) {
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
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [slug]);

  if (loading) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  if (error || !app) {
    return (
      <Container size="sm" py="xl" mih="100vh">
        <Stack gap="md">
          <Button
            component={Link}
            href="/apps"
            variant="subtle"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
          >
            돌아가기
          </Button>
          <Text c="red">{error || "앱을 찾을 수 없습니다"}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl" mih="100vh">
      <Stack gap="xl">
        <Button
          component={Link}
          href="/apps"
          variant="subtle"
          size="sm"
          leftSection={<ArrowLeft size={16} />}
        >
          돌아가기
        </Button>

        <Box pb="xl" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <Title order={1} fw={400} size="h2" mb="md">
            {app.name}
          </Title>

          {app.description && (
            <Text size="md" c="dimmed" mb="md">
              {app.description}
            </Text>
          )}

          <Group gap="sm">
            {app.platforms && app.platforms.length > 0 && (
              <Text size="xs" c="dimmed">
                {app.platforms.map(p => PLATFORM_NAMES[p] || p).join(", ")}
              </Text>
            )}
          </Group>
        </Box>

        {/* Distribution Links */}
        {app.distribution_channels && app.distribution_channels.length > 0 && (
          <Stack gap="md">
            <Title order={2} size="h4" fw={500}>
              다운로드
            </Title>
            <Group gap="xs" wrap="wrap">
              {app.distribution_channels.map((channel, index) => (
                <Button
                  key={`${channel.type}-${index}`}
                  component="a"
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="default"
                  size="sm"
                  rightSection={<ExternalLink size={14} />}
                >
                  {getChannelName(channel)}
                </Button>
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

// Main Page Component
export default function AppsPageClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("app");

  if (slug) {
    return <AppDetail slug={slug} />;
  }

  return <AppList />;
}
