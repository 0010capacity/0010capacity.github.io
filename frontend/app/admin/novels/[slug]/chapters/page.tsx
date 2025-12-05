"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { novelsApi } from "@/lib/api";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Novel {
  id: string;
  title: string;
  slug: string;
}

export default function ChaptersPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [novelData, chaptersData] = await Promise.all([
        novelsApi.getBySlug(slug) as Promise<Novel>,
        novelsApi.getChapters(slug) as Promise<{ chapters: Chapter[] }>,
      ]);
      setNovel(novelData);
      setChapters(chaptersData.chapters || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterNumber: number) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await novelsApi.deleteChapter(slug, chapterNumber, token);
      setChapters(chapters.filter((ch) => ch.number !== chapterNumber));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  return (
    <AdminLayout
      title={novel ? `${novel.title} - 챕터 관리` : "챕터 관리"}
      backHref="/admin/novels"
      backLabel="← 소설 목록"
    >
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">
          총 {chapters.length}개의 챕터
        </p>
        <Link
          href={`/admin/novels/${slug}/chapters/new`}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 챕터
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
      {!loading && chapters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">등록된 챕터가 없습니다</p>
          <Link
            href={`/admin/novels/${slug}/chapters/new`}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            첫 번째 챕터를 작성해보세요 →
          </Link>
        </div>
      )}

      {/* Chapters List */}
      {!loading && chapters.length > 0 && (
        <div className="space-y-3">
          {chapters
            .sort((a, b) => a.number - b.number)
            .map((chapter) => (
              <div
                key={chapter.id}
                className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600 text-sm font-mono w-12">
                      #{chapter.number}
                    </span>
                    <div>
                      <h3 className="text-neutral-100">
                        {chapter.title || `제 ${chapter.number}화`}
                      </h3>
                      <p className="text-neutral-600 text-xs mt-1">
                        {new Date(chapter.updated_at).toLocaleDateString(
                          "ko-KR"
                        )}{" "}
                        수정
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/novels/${slug}/chapters/${chapter.number}/edit`}
                      className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                    >
                      수정
                    </Link>
                    {deleteConfirm === chapter.number ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(chapter.number)}
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
                        onClick={() => setDeleteConfirm(chapter.number)}
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

      {/* Quick Navigation */}
      {novel && (
        <div className="mt-8 pt-8 border-t border-neutral-800">
          <div className="flex gap-4">
            <Link
              href={`/admin/novels/${slug}/edit`}
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              소설 정보 수정 →
            </Link>
            <Link
              href={`/novels/${slug}`}
              target="_blank"
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              소설 페이지 보기 ↗
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
