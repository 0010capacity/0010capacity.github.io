"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import MarkdownEditor from "@/components/MarkdownEditor";
import { novelsApi } from "@/lib/api";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
}

interface Novel {
  id: string;
  title: string;
  slug: string;
}

export default function EditChapterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const chapterNumber = parseInt(params.number as string, 10);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    number: chapterNumber,
    title: "",
    content: "",
  });

  useEffect(() => {
    if (slug && !isNaN(chapterNumber)) {
      fetchData();
    }
  }, [slug, chapterNumber]);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      const [novelData, chapterData] = await Promise.all([
        novelsApi.getBySlug(slug) as Promise<Novel>,
        novelsApi.getChapter(slug, chapterNumber) as Promise<Chapter>,
      ]);
      setNovel(novelData);
      setFormData({
        number: chapterData.number,
        title: chapterData.title || "",
        content: chapterData.content || "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    try {
      await novelsApi.updateChapter(slug, chapterNumber, formData, token);
      router.push(`/admin/novels/${slug}/chapters`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챕터 수정에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout
        title="챕터 수정"
        backHref={`/admin/novels/${slug}/chapters`}
        backLabel="← 챕터 목록"
      >
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={novel ? `${novel.title} - 챕터 ${chapterNumber} 수정` : "챕터 수정"}
      backHref={`/admin/novels/${slug}/chapters`}
      backLabel="← 챕터 목록"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Chapter Info Row */}
        <div className="flex gap-4">
          {/* Chapter Number */}
          <div className="w-32">
            <label
              htmlFor="number"
              className="block text-sm text-neutral-500 mb-2"
            >
              화수 *
            </label>
            <input
              type="number"
              id="number"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: parseInt(e.target.value) || 1 })
              }
              min={1}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600 transition-colors"
              required
              disabled={loading}
            />
          </div>

          {/* Chapter Title */}
          <div className="flex-1">
            <label
              htmlFor="title"
              className="block text-sm text-neutral-500 mb-2"
            >
              챕터 제목 (선택)
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder={`제 ${formData.number}화`}
              disabled={loading}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">
            본문 *
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="챕터 내용을 마크다운으로 작성하세요..."
            height={500}
            minHeight={400}
          />
        </div>

        {/* Word Count */}
        <div className="text-right">
          <span className="text-neutral-600 text-sm">
            {formData.content.length.toLocaleString()}자
          </span>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={loading || !formData.content}
            className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
          >
            {loading ? "저장 중..." : "저장"}
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
    </AdminLayout>
  );
}
