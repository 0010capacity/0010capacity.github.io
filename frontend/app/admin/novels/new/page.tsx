"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import TagInput from "@/components/TagInput";
import { novelsApi } from "@/lib/api";

export default function NewNovelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "ongoing",
    tags: [] as string[],
    cover_image: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
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
      await novelsApi.create(formData, token);
      router.push("/admin/novels");
    } catch (err) {
      setError(err instanceof Error ? err.message : "소설 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="새 소설" backHref="/admin/novels" backLabel="← 소설 목록">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm text-neutral-500 mb-2">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="소설 제목을 입력하세요"
            required
            disabled={loading}
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm text-neutral-500 mb-2">
            슬러그 (URL)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-neutral-600 text-sm">/novels/</span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="novel-slug"
              disabled={loading}
            />
          </div>
          <p className="text-neutral-600 text-xs mt-1">
            URL에 사용될 고유 식별자입니다. 영문, 숫자, 하이픈만 사용하세요.
          </p>
        </div>

        {/* Description */}
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="소설에 대한 간단한 설명을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm text-neutral-500 mb-2">
            연재 상태
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600 transition-colors"
            disabled={loading}
          >
            <option value="ongoing">연재중</option>
            <option value="completed">완결</option>
            <option value="hiatus">휴재</option>
            <option value="draft">임시저장</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">태그</label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            placeholder="장르, 키워드 등을 입력하세요"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label
            htmlFor="cover_image"
            className="block text-sm text-neutral-500 mb-2"
          >
            표지 이미지 URL
          </label>
          <input
            type="url"
            id="cover_image"
            value={formData.cover_image}
            onChange={(e) =>
              setFormData({ ...formData, cover_image: e.target.value })
            }
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="https://example.com/cover.jpg"
            disabled={loading}
          />
        </div>

        {/* Preview */}
        {formData.cover_image && (
          <div>
            <p className="text-sm text-neutral-500 mb-2">표지 미리보기</p>
            <div className="w-32 h-48 bg-neutral-900 rounded overflow-hidden">
              <img
                src={formData.cover_image}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
          >
            {loading ? "생성 중..." : "소설 생성"}
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
