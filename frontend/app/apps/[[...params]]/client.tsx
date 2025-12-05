"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { appsApi } from "@/lib/api";
import { App } from "@/lib/types";

// App List Component
function AppList() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = (await appsApi.list({ limit: 50 })) as App[];
        setApps(Array.isArray(data) ? data : []);
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

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "ios":
        return "iOS";
      case "android":
        return "Android";
      case "web":
        return "Web";
      case "desktop":
        return "Desktop";
      default:
        return platform;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-16">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </Link>
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
                <Link
                  href={`/apps/${app.slug}`}
                  className="block group py-6 border-b border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-medium text-neutral-200 group-hover:text-white transition-colors">
                      {app.name}
                    </h2>
                    <span className="text-xs text-neutral-600 border border-neutral-800 px-2 py-1 rounded">
                      {getPlatformLabel(app.platform)}
                    </span>
                  </div>
                  {app.description && (
                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {app.description}
                    </p>
                  )}
                </Link>
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

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "ios":
        return "iOS";
      case "android":
        return "Android";
      case "web":
        return "Web";
      case "desktop":
        return "Desktop";
      default:
        return platform;
    }
  };

  const getDownloadLabel = (key: string) => {
    switch (key) {
      case "appstore":
        return "App Store";
      case "googleplay":
        return "Google Play";
      case "website":
        return "Website";
      case "github":
        return "GitHub";
      default:
        return key;
    }
  };

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
          <Link
            href="/apps"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 앱 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/apps"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 돌아가기
        </Link>

        <header className="mt-12 mb-16">
          <div className="flex items-center gap-4 mb-6">
            {app.icon_url && (
              <img
                src={app.icon_url}
                alt={app.name}
                className="w-16 h-16 rounded-xl"
              />
            )}
            <div>
              <h1 className="text-3xl font-light">{app.name}</h1>
              <span className="text-sm text-neutral-600">
                {getPlatformLabel(app.platform)}
              </span>
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

        {/* Download Links */}
        {app.download_links && Object.keys(app.download_links).length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm text-neutral-600 uppercase tracking-widest mb-6">
              Download
            </h2>
            <div className="space-y-2">
              {Object.entries(app.download_links).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
                >
                  <span className="text-neutral-300 group-hover:text-white transition-colors">
                    {getDownloadLabel(key)}
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
          <Link
            href="/apps"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 앱 목록으로
          </Link>
        </footer>
      </div>
    </div>
  );
}

// Main Page Component with Client-Side Routing
export default function AppsPageClient() {
  const params = useParams();
  const paramsArray = params?.params as string[] | undefined;

  // Route parsing:
  // /apps -> []
  // /apps/[slug] -> [slug]

  if (!paramsArray || paramsArray.length === 0) {
    return <AppList />;
  }

  if (paramsArray.length === 1) {
    const slug = paramsArray[0];
    if (slug) {
      return <AppDetail slug={slug} />;
    }
  }

  // Invalid route - show 404-like message
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-neutral-500 mb-6">페이지를 찾을 수 없습니다</p>
        <Link
          href="/apps"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 앱 목록으로
        </Link>
      </div>
    </div>
  );
}
