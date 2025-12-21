"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { usePathname } from "next/navigation";
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Paper,
  Grid,
  Image,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Center,
  Loader,
  Alert,
  Anchor,
} from "@mantine/core";
import { AlertCircle, X, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { appsApi } from "@/lib/api";

// Navigation Context for SPA-style routing
interface NavState {
  view: "list" | "new" | "edit";
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

// Types
interface DistributionChannel {
  type: string;
  url: string;
  label?: string;
}

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  platforms: string[];
  icon_url: string;
  screenshots: string[];
  distribution_channels: DistributionChannel[];
  privacy_policy_url: string;
  created_at: string;
  updated_at: string;
}

// Platform options
const PLATFORMS = [
  { id: "ios", name: "iOS", color: "blue" as const },
  { id: "android", name: "Android", color: "green" as const },
  { id: "web", name: "Web", color: "grape" as const },
  { id: "windows", name: "Windows", color: "cyan" as const },
  { id: "macos", name: "macOS", color: "gray" as const },
  { id: "linux", name: "Linux", color: "orange" as const },
  { id: "game", name: "Game", color: "pink" as const },
];

// Distribution channel options
const DISTRIBUTION_CHANNELS = [
  {
    id: "app_store",
    name: "App Store",
    placeholder: "https://apps.apple.com/app/...",
  },
  {
    id: "play_store",
    name: "Google Play",
    placeholder: "https://play.google.com/store/apps/...",
  },
  { id: "web", name: "Web App", placeholder: "https://myapp.com" },
  {
    id: "steam",
    name: "Steam",
    placeholder: "https://store.steampowered.com/app/...",
  },
  { id: "stove", name: "Stove", placeholder: "https://stove.com/..." },
  {
    id: "epic",
    name: "Epic Games",
    placeholder: "https://store.epicgames.com/...",
  },
  { id: "gog", name: "GOG", placeholder: "https://gog.com/game/..." },
  { id: "itch", name: "itch.io", placeholder: "https://username.itch.io/game" },
  {
    id: "landing_page",
    name: "Landing Page",
    placeholder: "https://myapp.com/download",
  },
  {
    id: "direct_download",
    name: "Direct Download",
    placeholder: "https://myapp.com/download/file.zip",
  },
  {
    id: "github",
    name: "GitHub Releases",
    placeholder: "https://github.com/user/repo/releases",
  },
  { id: "other", name: "Other", placeholder: "https://..." },
];

// Platform Badge Helper
function PlatformBadge({ platform }: { platform: string }) {
  const platformInfo = PLATFORMS.find(p => p.id === platform);

  return (
    <Badge
      variant="light"
      color={platformInfo?.color || "gray"}
      size="sm"
      radius="sm"
    >
      {platformInfo?.name || platform}
    </Badge>
  );
}

// Apps List Component
function AppsList() {
  const { navigate } = useNav();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await appsApi.list();
      const appsList = Array.isArray(response)
        ? response
        : (response as { apps?: App[] }).apps || [];
      setApps(appsList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "앱 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await appsApi.delete(slug, token);
      setApps(apps.filter(app => app.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "앱 삭제에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="앱 관리">
        <Center py="xl">
          <Loader />
        </Center>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="앱 관리">
        <Alert
          icon={<AlertCircle size={16} />}
          title="오류"
          color="red"
          mb="lg"
        >
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="앱 관리">
      <Group justify="space-between" mb="lg">
        <Text size="sm" c="dimmed">
          총 {apps.length}개의 앱
        </Text>
        <Button size="sm" onClick={() => navigate({ view: "new" })}>
          + 새 앱 등록
        </Button>
      </Group>

      {apps.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Text size="sm" c="dimmed">
              등록된 앱이 없습니다
            </Text>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => navigate({ view: "new" })}
              rightSection={<ChevronRight size={16} />}
            >
              첫 번째 앱을 등록해보세요
            </Button>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {apps.map(app => (
            <Paper key={app.id} p="md" radius="md" withBorder>
              <Group justify="space-between" align="flex-start">
                <Group align="flex-start" gap="md">
                  {app.icon_url && (
                    <Image
                      src={app.icon_url}
                      alt={app.name}
                      width={64}
                      height={64}
                      radius="md"
                      fit="cover"
                    />
                  )}
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text fw={500}>{app.name}</Text>
                    <Group gap="xs" wrap="wrap">
                      {(app.platforms || []).map(platform => (
                        <PlatformBadge key={platform} platform={platform} />
                      ))}
                    </Group>
                    {app.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {app.description}
                      </Text>
                    )}
                    {(app.distribution_channels || []).length > 0 && (
                      <Group gap="xs" wrap="wrap">
                        {app.distribution_channels.map((channel, idx) => {
                          const channelInfo = DISTRIBUTION_CHANNELS.find(
                            c => c.id === channel.type
                          );
                          return (
                            <Anchor
                              key={idx}
                              href={channel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="xs"
                            >
                              {channel.label ||
                                channelInfo?.name ||
                                channel.type}{" "}
                              ↗
                            </Anchor>
                          );
                        })}
                      </Group>
                    )}
                  </Stack>
                </Group>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => navigate({ view: "edit", slug: app.slug })}
                  >
                    수정
                  </Button>
                  {deleteConfirm === app.slug ? (
                    <>
                      <Button
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => handleDelete(app.slug)}
                      >
                        확인
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="xs"
                      color="red"
                      variant="subtle"
                      onClick={() => setDeleteConfirm(app.slug)}
                    >
                      삭제
                    </Button>
                  )}
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </AdminLayout>
  );
}

// Platform Selector Component
function PlatformSelector({
  selected,
  onChange,
  disabled,
}: {
  selected: string[];
  onChange: (platforms: string[]) => void;
  disabled?: boolean;
}) {
  const togglePlatform = (platformId: string) => {
    if (selected.includes(platformId)) {
      onChange(selected.filter(p => p !== platformId));
    } else {
      onChange([...selected, platformId]);
    }
  };

  return (
    <Group gap="xs" wrap="wrap">
      {PLATFORMS.map(platform => (
        <Button
          key={platform.id}
          size="sm"
          variant={selected.includes(platform.id) ? "filled" : "light"}
          onClick={() => togglePlatform(platform.id)}
          disabled={disabled}
        >
          {platform.name}
        </Button>
      ))}
    </Group>
  );
}

// Distribution Channel Editor Component
function DistributionChannelEditor({
  channels,
  onChange,
  disabled,
}: {
  channels: DistributionChannel[];
  onChange: (channels: DistributionChannel[]) => void;
  disabled?: boolean;
}) {
  const addChannel = () => {
    onChange([...channels, { type: "app_store", url: "", label: "" }]);
  };

  const updateChannel = (
    index: number,
    field: keyof DistributionChannel,
    value: string
  ) => {
    const newChannels = [...channels];
    const current = newChannels[index];
    if (!current) return;

    const updated: DistributionChannel = {
      type: current.type,
      url: current.url,
      label: current.label,
    };
    if (field === "type") {
      updated.type = value;
    } else if (field === "url") {
      updated.url = value;
    } else if (field === "label") {
      updated.label = value;
    }
    newChannels[index] = updated;
    onChange(newChannels);
  };

  const removeChannel = (index: number) => {
    onChange(channels.filter((_, i) => i !== index));
  };

  const getPlaceholder = (type: string) => {
    return (
      DISTRIBUTION_CHANNELS.find(c => c.id === type)?.placeholder ||
      "https://..."
    );
  };

  return (
    <Stack gap="md">
      {channels.map((channel, index) => (
        <Paper key={index} p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                배포 채널 {index + 1}
              </Text>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => removeChannel(index)}
                disabled={disabled}
              >
                <X size={16} />
              </ActionIcon>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="채널 유형"
                  placeholder="선택하세요"
                  value={channel.type}
                  onChange={val => updateChannel(index, "type", val || "")}
                  disabled={disabled}
                  data={DISTRIBUTION_CHANNELS.map(opt => ({
                    value: opt.id,
                    label: opt.name,
                  }))}
                  size="sm"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="커스텀 라벨 (선택)"
                  placeholder="예: 한국 앱스토어"
                  value={channel.label || ""}
                  onChange={e => updateChannel(index, "label", e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="URL"
              type="url"
              placeholder={getPlaceholder(channel.type)}
              value={channel.url}
              onChange={e => updateChannel(index, "url", e.target.value)}
              disabled={disabled}
              size="sm"
            />
          </Stack>
        </Paper>
      ))}

      <Button
        variant="light"
        fullWidth
        onClick={addChannel}
        disabled={disabled}
      >
        + 배포 채널 추가
      </Button>
    </Stack>
  );
}

// App Form Data
interface AppFormData {
  name: string;
  description: string;
  platforms: string[];
  icon_url: string;
  screenshots: string[];
  distribution_channels: DistributionChannel[];
  privacy_policy_url: string;
}

// App Form Component
interface AppFormProps {
  initialData?: Partial<App>;
  onSubmit: (data: AppFormData) => Promise<void>;
  isEdit?: boolean;
}

function AppForm({ initialData, onSubmit, isEdit = false }: AppFormProps) {
  const { navigate } = useNav();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<AppFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    platforms: initialData?.platforms || [],
    icon_url: initialData?.icon_url || "",
    screenshots: initialData?.screenshots?.length
      ? initialData.screenshots
      : [],
    distribution_channels: initialData?.distribution_channels || [],
    privacy_policy_url: initialData?.privacy_policy_url || "",
  });

  const handleScreenshotChange = (index: number, value: string) => {
    const newScreenshots = [...formData.screenshots];
    newScreenshots[index] = value;
    setFormData({ ...formData, screenshots: newScreenshots });
  };

  const addScreenshot = () => {
    setFormData({ ...formData, screenshots: [...formData.screenshots, ""] });
  };

  const removeScreenshot = (index: number) => {
    setFormData({
      ...formData,
      screenshots: formData.screenshots.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanedData: AppFormData = {
      ...formData,
      screenshots: formData.screenshots.filter(s => s.trim() !== ""),
      distribution_channels: formData.distribution_channels.filter(
        c => c.url.trim() !== ""
      ),
    };

    try {
      await onSubmit(cleanedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} maw={600}>
      <Stack gap="xl">
        {error && (
          <Alert icon={<AlertCircle size={16} />} title="오류" color="red">
            {error}
          </Alert>
        )}

        {/* Basic Info Section */}
        <Stack gap="md">
          <Text size="lg" fw={600}>
            기본 정보
          </Text>

          <TextInput
            label="앱 이름 *"
            placeholder="앱 이름을 입력하세요"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
            required
            size="sm"
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              플랫폼 (복수 선택 가능)
            </Text>
            <PlatformSelector
              selected={formData.platforms}
              onChange={platforms => setFormData({ ...formData, platforms })}
              disabled={loading}
            />
          </Stack>

          <Textarea
            label="설명"
            placeholder="앱에 대한 간단한 설명을 입력하세요"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={loading}
            minRows={4}
            size="sm"
          />
        </Stack>

        {/* Distribution Channels Section */}
        <Stack gap="md">
          <Stack gap="xs">
            <Text size="lg" fw={600}>
              배포 채널
            </Text>
            <Text size="sm" c="dimmed">
              앱이 배포되는 스토어, 웹사이트 등의 링크를 추가하세요.
            </Text>
          </Stack>
          <DistributionChannelEditor
            channels={formData.distribution_channels}
            onChange={channels =>
              setFormData({ ...formData, distribution_channels: channels })
            }
            disabled={loading}
          />
        </Stack>

        {/* Media Section */}
        <Stack gap="md">
          <Text size="lg" fw={600}>
            미디어
          </Text>

          <Stack gap="xs">
            <TextInput
              label="앱 아이콘 URL"
              placeholder="https://example.com/icon.png"
              value={formData.icon_url}
              onChange={e =>
                setFormData({ ...formData, icon_url: e.target.value })
              }
              disabled={loading}
              type="url"
              size="sm"
            />
            {formData.icon_url && (
              <Image
                src={formData.icon_url}
                alt="Icon preview"
                width={64}
                height={64}
                radius="md"
                fit="cover"
              />
            )}
          </Stack>

          {/* Screenshots */}
          <Stack gap="md">
            <Text size="sm" fw={500}>
              스크린샷
            </Text>
            {formData.screenshots.map((screenshot, index) => (
              <Stack key={index} gap="xs">
                <Group gap="xs">
                  <TextInput
                    type="url"
                    placeholder={`스크린샷 URL ${index + 1}`}
                    value={screenshot}
                    onChange={e =>
                      handleScreenshotChange(index, e.target.value)
                    }
                    disabled={loading}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeScreenshot(index)}
                    disabled={loading}
                  >
                    <X size={16} />
                  </ActionIcon>
                </Group>
                {screenshot && (
                  <Image
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    height={160}
                    width={100}
                    radius="md"
                    fit="cover"
                  />
                )}
              </Stack>
            ))}
            <Button
              variant="subtle"
              size="sm"
              onClick={addScreenshot}
              disabled={loading}
            >
              + 스크린샷 추가
            </Button>
          </Stack>
        </Stack>

        {/* Additional Info Section */}
        <Stack gap="md">
          <Text size="lg" fw={600}>
            추가 정보
          </Text>

          <TextInput
            label="개인정보처리방침 URL"
            placeholder="https://example.com/privacy"
            value={formData.privacy_policy_url}
            onChange={e =>
              setFormData({ ...formData, privacy_policy_url: e.target.value })
            }
            disabled={loading}
            type="url"
            size="sm"
          />
        </Stack>

        {/* Submit Buttons */}
        <Group justify="flex-start" pt="md">
          <Button
            type="submit"
            disabled={loading || !formData.name}
            loading={loading}
          >
            {isEdit ? "저장" : "앱 등록"}
          </Button>
          <Button
            variant="subtle"
            onClick={() => navigate({ view: "list" })}
            disabled={loading}
          >
            취소
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

// New App Component
function NewApp() {
  const { navigate } = useNav();

  const handleSubmit = async (data: AppFormData) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      throw new Error("로그인이 필요합니다");
    }

    await appsApi.create(data, token);
    navigate({ view: "list" });
  };

  return (
    <AdminLayout
      title="새 앱 등록"
      backHref="/admin/apps"
      backLabel="← 앱 목록"
      onBack={() => navigate({ view: "list" })}
    >
      <AppForm onSubmit={handleSubmit} />
    </AdminLayout>
  );
}

// Edit App Component
function EditApp({ slug }: { slug: string }) {
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
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "앱을 불러오는데 실패했습니다"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [slug]);

  const handleSubmit = async (data: AppFormData) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      throw new Error("로그인이 필요합니다");
    }

    await appsApi.update(slug, data, token);
    navigate({ view: "list" });
  };

  if (loading) {
    return (
      <AdminLayout
        title="앱 수정"
        backHref="/admin/apps"
        backLabel="← 앱 목록"
        onBack={() => navigate({ view: "list" })}
      >
        <Center py="xl">
          <Loader />
        </Center>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="앱 수정"
        backHref="/admin/apps"
        backLabel="← 앱 목록"
        onBack={() => navigate({ view: "list" })}
      >
        <Alert icon={<AlertCircle size={16} />} title="오류" color="red">
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="앱 수정"
      backHref="/admin/apps"
      backLabel="← 앱 목록"
      onBack={() => navigate({ view: "list" })}
    >
      <AppForm initialData={app || undefined} onSubmit={handleSubmit} isEdit />
    </AdminLayout>
  );
}

// Main Client Component with SPA-style Routing
export default function AppsAdminClient() {
  const pathname = usePathname();
  const [navState, setNavState] = useState<NavState>({ view: "list" });
  const [history, setHistory] = useState<NavState[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts.length === 3 && pathParts[2] === "new") {
      setNavState({ view: "new" });
    } else if (pathParts.length === 4 && pathParts[3] === "edit") {
      setNavState({ view: "edit", slug: pathParts[2] });
    }

    setInitialized(true);
  }, [pathname, initialized]);

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
      case "new":
        return <NewApp />;
      case "edit":
        return navState.slug ? <EditApp slug={navState.slug} /> : <AppsList />;
      case "list":
      default:
        return <AppsList />;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
