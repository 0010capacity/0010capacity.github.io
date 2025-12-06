"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useParams } from "next/navigation";
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
  ios: { name: "iOS", color: "bg-blue-900/50 text-blue-400" },
  android: { name: "Android", color: "bg-green-900/50 text-green-400" },
  web: { name: "Web", color: "bg-purple-900/50 text-purple-400" },
  windows: { name: "Windows", color: "bg-cyan-900/50 text-cyan-400" },
  macos: { name: "macOS", color: "bg-gray-700/50 text-gray-300" },
  linux: { name: "Linux", color: "bg-orange-900/50 text-orange-400" },
  game: { name: "Game", color: "bg-pink-900/50 text-pink-400" },
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
    color: "bg-neutral-800 text-neutral-400",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded ${info.color}`}>
      {info.name}
    </span>
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-16">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </button>
          <h1 className="text-2xl font-light mt-8 mb-2">앱</h1>
          <p className="text-neutral-500 text-sm">제가 만든 앱들입니다</p>
        </header>

        {error && (
          <div className="mb-8 p-4 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <p className="text-neutral-600 text-sm">불러오는 중...</p>
          </div>
        )}

        {!loading && apps.length > 0 && (
          <ul className="space-y-6">
            {apps.map(app => (
              <li key={app.id}>
                <button
                  onClick={() => navigate({ view: "detail", slug: app.slug })}
                  className="block w-full text-left group py-6 border-b border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {app.icon_url && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800">
                        <img
                          src={app.icon_url}
                          alt={app.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h2 className="text-lg font-medium text-neutral-200 group-hover:text-white transition-colors">
                          {app.name}
                        </h2>
                        {(app.platforms || []).map(platform => (
                          <PlatformBadge
                            key={platform}
                            platform={platform as Platform}
                          />
                        ))}
                      </div>
                      {app.description && (
                        <p className="text-sm text-neutral-500 line-clamp-2">
                          {app.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && apps.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-2">아직 등록된 앱이 없습니다</p>
            <p className="text-neutral-600 text-sm">곧 추가될 예정입니다</p>
          </div>
        )}
      </div>
    </div>
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
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <p className="text-neutral-500 mb-6">
            {error || "앱을 찾을 수 없습니다"}
          </p>
          <button
            onClick={() => navigate({ view: "list" })}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 앱 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate({ view: "list" })}
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 돌아가기
        </button>

        <header className="mt-12 mb-16">
          <div className="flex items-center gap-4 mb-6">
            {app.icon_url && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-800">
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
              <h1 className="text-3xl font-light mb-2">{app.name}</h1>
              <div className="flex flex-wrap gap-2">
                {(app.platforms || []).map(platform => (
                  <PlatformBadge
                    key={platform}
                    platform={platform as Platform}
                  />
                ))}
              </div>
            </div>
          </div>

          {app.description && (
            <p className="text-neutral-400 leading-relaxed">
              {app.description}
            </p>
          )}

          <div className="flex gap-6 mt-8 pt-6 border-t border-neutral-900 text-sm text-neutral-600">
            <span>{new Date(app.created_at).toLocaleDateString("ko-KR")}</span>
          </div>
        </header>

        {/* Distribution Channels */}
        {app.distribution_channels && app.distribution_channels.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm text-neutral-600 uppercase tracking-widest mb-6">
              Download / Links
            </h2>
            <div className="space-y-2">
              {app.distribution_channels.map((channel, index) => (
                <a
                  key={index}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
                >
                  <span className="text-neutral-300 group-hover:text-white transition-colors">
                    {getChannelName(channel)}
                  </span>
                  <span className="text-neutral-700 text-sm">→</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Screenshots */}
        {app.screenshots && app.screenshots.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm text-neutral-600 uppercase tracking-widest mb-6">
              Screenshots
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {app.screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot}
                  alt={`${app.name} screenshot ${index + 1}`}
                  className="w-full rounded-lg"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Privacy Policy */}
        {app.privacy_policy_url && (
          <section className="mb-12">
            <h2 className="text-sm text-neutral-600 uppercase tracking-widest mb-6">
              Privacy Policy
            </h2>
            <a
              href={app.privacy_policy_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
            >
              <span className="text-neutral-300 group-hover:text-white transition-colors">
                개인정보 처리방침
              </span>
              <span className="text-neutral-700 text-sm">→</span>
            </a>
          </section>
        )}

        <footer className="pt-8 border-t border-neutral-900">
          <button
            onClick={() => navigate({ view: "list" })}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 앱 목록으로
          </button>
        </footer>
      </div>
    </div>
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
