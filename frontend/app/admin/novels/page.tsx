"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { novelsApi } from "@/lib/api";

interface Novel {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface NovelsResponse {
  novels: Novel[];
  total: number;
}

export default function AdminNovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      const response = (await novelsApi.list()) as NovelsResponse;
      setNovels(response.novels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "소설 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await novelsApi.delete(slug, token);
      setNovels(novels.filter((novel) => novel.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="px-2 py-1 text-xs bg-blue-900/50 text-blue-400 rounded">
            연재중
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">
            완결
          </span>
        );
      case "hiatus":
        return (
          <span className="px-2 py-1 text-xs bg-yellow-900/50 text-yellow-400 rounded">
            휴재
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-neutral-800 text-neutral-400 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout title="소설 관리">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">
          총 {novels.length}개의 소설
        </p>
        <Link
          href="/admin/novels/new"
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 소설
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
      {!loading && novels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">등록된 소설이 없습니다</p>
          <Link
            href="/admin/novels/new"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            첫 소설을 작성해보세요 →
          </Link>
        </div>
      )}

      {/* Novels List */}
      {!loading && novels.length > 0 && (
        <div className="space-y-4">
          {novels.map((novel) => (
            <div
              key={novel.id}
              className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg text-neutral-100">{novel.title}</h3>
                    {getStatusBadge(novel.status)}
                  </div>
                  <p className="text-neutral-500 text-sm mb-2 line-clamp-2">
                    {novel.description || "설명 없음"}
                  </p>
                  <p className="text-neutral-600 text-xs">
                    {new Date(novel.created_at).toLocaleDateString("ko-KR")} 생성
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/admin/novels/${novel.slug}/chapters`}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  >
                    챕터
                  </Link>
                  <Link
                    href={`/admin/novels/${novel.slug}/edit`}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  >
                    수정
                  </Link>
                  {deleteConfirm === novel.slug ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(novel.slug)}
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
                      onClick={() => setDeleteConfirm(novel.slug)}
                      className="px-3 py-1.5 text-sm text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
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
