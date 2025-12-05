"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { appsApi } from "@/lib/api";

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
  { id: "ios", name: "iOS", color: "blue" },
  { id: "android", name: "Android", color: "green" },
  { id: "web", name: "Web", color: "purple" },
  { id: "windows", name: "Windows", color: "cyan" },
  { id: "macos", name: "macOS", color: "gray" },
  { id: "linux", name: "Linux", color: "orange" },
  { id: "game", name: "Game", color: "pink" },
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
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-900/50 text-blue-400",
    green: "bg-green-900/50 text-green-400",
    purple: "bg-purple-900/50 text-purple-400",
    cyan: "bg-cyan-900/50 text-cyan-400",
    gray: "bg-gray-700/50 text-gray-300",
    orange: "bg-orange-900/50 text-orange-400",
    pink: "bg-pink-900/50 text-pink-400",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded ${colorClasses[platformInfo?.color || "gray"] || "bg-neutral-800 text-neutral-400"}`}
    >
      {platformInfo?.name || platform}
    </span>
  );
}

// Apps List Component
function AppsList() {
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
      // API returns array directly or wrapped
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
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="앱 관리">
        <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="앱 관리">
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">총 {apps.length}개의 앱</p>
        <Link
          href="/admin/apps/new"
          className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 rounded transition-colors text-sm"
        >
          + 새 앱 등록
        </Link>
      </div>
      {apps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm mb-4">등록된 앱이 없습니다</p>
          <Link
            href="/admin/apps/new"
            className="text-neutral-400 hover:text-white transition-colors text-sm"
          >
            첫 번째 앱을 등록해보세요 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <div
              key={app.id}
              className="p-6 border border-neutral-800 rounded hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {app.icon_url && (
                    <div className="w-16 h-16 bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={app.icon_url}
                        alt={app.name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg text-neutral-200 mb-1">
                      {app.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(app.platforms || []).map(platform => (
                        <PlatformBadge key={platform} platform={platform} />
                      ))}
                    </div>
                    {app.description && (
                      <p className="text-neutral-500 text-sm line-clamp-2">
                        {app.description}
                      </p>
                    )}
                    {(app.distribution_channels || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {app.distribution_channels.map((channel, idx) => {
                          const channelInfo = DISTRIBUTION_CHANNELS.find(
                            c => c.id === channel.type
                          );
                          return (
                            <a
                              key={idx}
                              href={channel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-neutral-400 hover:text-white transition-colors"
                            >
                              {channel.label ||
                                channelInfo?.name ||
                                channel.type}{" "}
                              ↗
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/apps/${app.slug}/edit`}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    수정
                  </Link>
                  {deleteConfirm === app.slug ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(app.slug)}
                        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(app.slug)}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:text-red-400 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map(platform => (
        <button
          key={platform.id}
          type="button"
          onClick={() => togglePlatform(platform.id)}
          disabled={disabled}
          className={`px-4 py-2 rounded border transition-colors ${
            selected.includes(platform.id)
              ? "border-neutral-400 bg-neutral-800 text-white"
              : "border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
          }`}
        >
          {platform.name}
        </button>
      ))}
    </div>
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
    <div className="space-y-4">
      {channels.map((channel, index) => (
        <div
          key={index}
          className="p-4 border border-neutral-800 rounded space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">
              배포 채널 {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeChannel(index)}
              disabled={disabled}
              className="text-neutral-500 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                채널 유형
              </label>
              <select
                value={channel.type}
                onChange={e => updateChannel(index, "type", e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 text-sm focus:outline-none focus:border-neutral-600 transition-colors"
              >
                {DISTRIBUTION_CHANNELS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                커스텀 라벨 (선택)
              </label>
              <input
                type="text"
                value={channel.label || ""}
                onChange={e => updateChannel(index, "label", e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                placeholder="예: 한국 앱스토어"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-600 mb-1">URL</label>
            <input
              type="url"
              value={channel.url}
              onChange={e => updateChannel(index, "url", e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder={getPlaceholder(channel.type)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addChannel}
        disabled={disabled}
        className="w-full py-3 border border-dashed border-neutral-700 rounded text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 transition-colors text-sm"
      >
        + 배포 채널 추가
      </button>
    </div>
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
  const router = useRouter();
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

    // Clean up empty strings from arrays
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-6">
        <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
          기본 정보
        </h2>

        <div>
          <label htmlFor="name" className="block text-sm text-neutral-500 mb-2">
            앱 이름 *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="앱 이름을 입력하세요"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-neutral-600">
            URL 슬러그는 UUID 기반으로 자동 생성됩니다
          </p>
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-3">
            플랫폼 (복수 선택 가능)
          </label>
          <PlatformSelector
            selected={formData.platforms}
            onChange={platforms => setFormData({ ...formData, platforms })}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm text-neutral-500 mb-2"
          >
            설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="앱에 대한 간단한 설명을 입력하세요"
            disabled={loading}
          />
        </div>
      </div>

      {/* Distribution Channels Section */}
      <div className="space-y-4">
        <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
          배포 채널
        </h2>
        <p className="text-sm text-neutral-600">
          앱이 배포되는 스토어, 웹사이트 등의 링크를 추가하세요.
        </p>
        <DistributionChannelEditor
          channels={formData.distribution_channels}
          onChange={channels =>
            setFormData({ ...formData, distribution_channels: channels })
          }
          disabled={loading}
        />
      </div>

      {/* Media Section */}
      <div className="space-y-6">
        <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
          미디어
        </h2>

        <div>
          <label
            htmlFor="icon_url"
            className="block text-sm text-neutral-500 mb-2"
          >
            앱 아이콘 URL
          </label>
          <input
            type="url"
            id="icon_url"
            value={formData.icon_url}
            onChange={e =>
              setFormData({ ...formData, icon_url: e.target.value })
            }
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="https://example.com/icon.png"
            disabled={loading}
          />
          {formData.icon_url && (
            <div className="mt-2">
              <div className="w-16 h-16 bg-neutral-800 rounded-xl overflow-hidden">
                <img
                  src={formData.icon_url}
                  alt="Icon preview"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Screenshots */}
        <div className="space-y-3">
          <label className="block text-sm text-neutral-500">스크린샷</label>

          {formData.screenshots.map((screenshot, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={screenshot}
                  onChange={e => handleScreenshotChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                  placeholder={`스크린샷 URL ${index + 1}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(index)}
                  className="p-3 text-neutral-500 hover:text-red-400 transition-colors"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
              {screenshot && (
                <div className="w-24 h-40 bg-neutral-800 rounded overflow-hidden ml-4">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addScreenshot}
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            disabled={loading}
          >
            + 스크린샷 추가
          </button>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="space-y-6">
        <h2 className="text-lg text-neutral-300 border-b border-neutral-800 pb-2">
          추가 정보
        </h2>

        <div>
          <label
            htmlFor="privacy_policy_url"
            className="block text-sm text-neutral-500 mb-2"
          >
            개인정보처리방침 URL
          </label>
          <input
            type="url"
            id="privacy_policy_url"
            value={formData.privacy_policy_url}
            onChange={e =>
              setFormData({ ...formData, privacy_policy_url: e.target.value })
            }
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="https://example.com/privacy"
            disabled={loading}
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4 border-t border-neutral-800">
        <button
          type="submit"
          disabled={loading || !formData.name}
          className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
        >
          {loading ? "저장 중..." : isEdit ? "저장" : "앱 등록"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 text-neutral-400 hover:text-white transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}

// New App Component
function NewApp() {
  const router = useRouter();

  const handleSubmit = async (data: AppFormData) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      throw new Error("로그인이 필요합니다");
    }

    await appsApi.create(data, token);
    router.push("/admin/apps/");
  };

  return (
    <AdminLayout
      title="새 앱 등록"
      backHref="/admin/apps"
      backLabel="← 앱 목록"
    >
      <AppForm onSubmit={handleSubmit} />
    </AdminLayout>
  );
}

// Edit App Component
function EditApp({ slug }: { slug: string }) {
  const router = useRouter();
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
    router.push("/admin/apps/");
  };

  if (loading) {
    return (
      <AdminLayout title="앱 수정" backHref="/admin/apps" backLabel="← 앱 목록">
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="앱 수정" backHref="/admin/apps" backLabel="← 앱 목록">
        <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="앱 수정" backHref="/admin/apps" backLabel="← 앱 목록">
      <AppForm initialData={app || undefined} onSubmit={handleSubmit} isEdit />
    </AdminLayout>
  );
}

// Main Client Component with Router
export default function AppsAdminClient() {
  const pathname = usePathname();

  // Parse the pathname to determine which view to show
  // /admin/apps -> list
  // /admin/apps/new -> new
  // /admin/apps/[slug]/edit -> edit

  const pathParts = pathname.split("/").filter(Boolean);
  // pathParts = ["admin", "apps", ...rest]

  if (pathParts.length === 2) {
    // /admin/apps
    return <AppsList />;
  }

  if (pathParts.length === 3 && pathParts[2] === "new") {
    // /admin/apps/new
    return <NewApp />;
  }

  if (pathParts.length === 4 && pathParts[3] === "edit") {
    // /admin/apps/[slug]/edit
    const slug = pathParts[2] as string;
    return <EditApp slug={slug} />;
  }

  // Default to list
  return <AppsList />;
}
