"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { appsApi } from "@/lib/api";

interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  platform: string;
  icon_url: string;
  store_url: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

interface AppsResponse {
  apps: App[];
  total: number;
}

export default function AdminAppsPage() {
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
      const response = (await appsApi.list()) as AppsResponse;
      setApps(response.apps || []);
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
      setApps(apps.filter((app) => app.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "ios":
        return (
          <span className="px-2 py-1 text-xs bg-blue-900/50 text-blue-400 rounded">
            iOS
          </span>
        );
      case "android":
        return (
          <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">
            Android
          </span>
        );
      case "web":
        return (
          <span className="px-2 py-1 text-xs bg-purple-900/50 text-purple-400 rounded">
            Web
          </span>
        );
      case "macos":
        return (
          <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded">
            macOS
          </span>
        );
      case "windows":
        return (
          <span className="px-2 py-1 text-xs bg-cyan-900/50 text-cyan-400 rounded">
            Windows
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-neutral-800 text-neutral-400 rounded">
            {platform}
          </span>
        );
    }
  };

  return (
    <AdminLayout title="앱 관리">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">총 {apps.length}개의 앱</p>
        <Link
          href="/admin/apps/new"
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 앱 등록
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 mb-6 border border-red-900/50 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && apps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">등록된 앱이 없습니다</p>
          <Link
            href="/admin/apps/new"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            첫 번째 앱을 등록해보세요 →
          </Link>
        </div>
      )}

      {/* Apps List */}
      {!loading && apps.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* App Icon */}
                <div className="w-16 h-16 bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0">
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-2xl">
                      📱
                    </div>
                  )}
                </div>

                {/* App Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg text-neutral-100 truncate">
                      {app.name}
                    </h3>
                    {getPlatformBadge(app.platform)}
                  </div>
                  <p className="text-neutral-500 text-sm mb-2 line-clamp-2">
                    {app.description || "설명 없음"}
                  </p>
                  {/* Tags */}
                  {app.tags && app.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {app.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {app.tags.length > 3 && (
                        <span className="text-xs text-neutral-600">
                          +{app.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-800">
                <Link
                  href={`/admin/apps/${app.slug}/edit`}
                  className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                >
                  수정
                </Link>
                <Link
                  href={`/apps/${app.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                >
                  보기
                </Link>
                {app.store_url && (
                  <a
                    href={app.store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  >
                    스토어
                  </a>
                )}
                {deleteConfirm === app.slug ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(app.slug)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-300 rounded transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(app.slug)}
                    className="px-3 py-1.5 text-sm text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
