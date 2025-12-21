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
  Alert,
  Badge,
  Paper,
  Text,
  Box,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
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
    <Badge color={info.color} size="xs">
      {info.name}
    </Badge>
  );
}

function getChannelName(channel: DistributionChannel): string {
  if (channel.label) return channel.label;
  return CHANNEL_NAMES[channel.type] || channel.type;
}

// App List Component
function AppList() {
  const { navigate } = useNav();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <Container size="md">
        <Stack gap="xl">
          <div>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="subtle"
              size="sm"
              mb="lg"
            >
              ← 돌아가기
            </Button>
            <Text size="xl" fw={300}>
              앱
            </Text>
            <Text size="sm" c="dimmed">
              제가 만든 앱들입니다
            </Text>
          </div>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="오류"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          {loading && (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          )}

          {!loading && apps.length > 0 && (
            <Stack gap="md">
              {apps.map(app => (
                <Paper
                  key={app.id}
                  p="md"
                  radius="md"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
                  component="button"
                  onClick={() => navigate({ view: "detail", slug: app.slug })}
                  style={{ display: "blow="100%"
                  ta="left"
                >
                  <Group gap="md" align="flex-start">
                    {app.icon_url && (
                      <Box
                        component="img"
                        src={app.icon_url}
                        alt={app.name}
                        w={48}
  style={{ width: "100%", height: "100%", obje                      h={48}
                        style={{ borderRadius: "var(--mantine-radius-md)", objectFit: "cover" }}tFit: "cover }}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    )}
                    <Stack gap="sm" style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text fw={500} size="lg">
                          {app.name}
                        </Text>
                        {(app.platforms || []).map(platform => (
                          <PlatformBadge
                            key={platform}
                            platform={platform as Platform}
                          />
                        ))}
                      </Group>
                      {app.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {app.description}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}

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
        <Container size="md">
          <Stack gap="lg">
            <Text c="dimmed">
              {error || "앱을 찾을 수 없습니다"}
            </Text>
            <Button
              onClick={() => navigate({ view: "list" })}
              variant="subtle"
              size="sm"
            >
              ← 앱 목록으로
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box mih="100vh" py="xl">
      <Container size="md">
        <Stack gap="xl">
          <Button
            onClick={() => navigate({ view: "list" })}
px", borderTop: "1px solid #1a1a1a" }}>
          <button
dingTop: "32" }}>→</spn>style={{ pad404040", fontSize: "14pxstyle={{ oor: "# "none", color: "inherit" }}
            >
              <pan tyle={{ color: "#d1d5db" }}>
                개인정보 처리a1a", textDecoration:={{ display: "flex", alignItems: "enter", justifyContent: "space-between", paddingTop: "16px", paddingBottom: "16px", borderBottom: "1px soid #11style", marginBottom: "24px" }}>
              Privacy Policy
Spacing: "0.1em textTrnform: "uppercae", letterstyle={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "14px", oor: "#737373",style={{ width: "100%", borderRadius: "8px" }}
16px" }}>
              {, 1fr)", gap: " gridTemplateColumns: "repeat(2style={{ display: "grid",1em", marginBottom: "24px" }}>
              Screenshots", letterSpacing: "0. "14px", oor: "#737373", textTrnform: "uppercae            <h2 style={{ fontSize:style={{ marginBottom: "48px" }}>
px" }}>→</spn> fontSize: "14            variant="subtle"
            size="sm"
          >
            ← 돌아가기
          </Button>

          <Group gap="md" align="flex-start">
            {app.istyle={{ fontSize: "14px", con_urol && (
              <Box
                component="img"
                src={or: "#737373", cursor: "pointer", bapp.icon_url}
                alt={app.name}
                w={64}
                h={64}
                ckground: "none", border: "none", padding: 0 }}
          >
            ← 앱 목록          </Button>
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
