"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import MarkdownEditor from "@/components/MarkdownEditor";
import TagInput from "@/components/TagInput";
import { blogApi } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  tags: string[];
}

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    tags: [] as string[],
    published: false,
  });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setFetchLoading(true);
      const post = (await blogApi.getBySlug(slug)) as BlogPost;
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        tags: post.tags || [],
        published: post.published || false,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "블로그 글을 불러오는데 실패했습니다"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish?: boolean) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    const updateData = {
      ...formData,
      published: shouldPublish !== undefined ? shouldPublish : formData.published,
    };

    try {
      await blogApi.update(slug, updateData, token);
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "블로그 글 수정에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout
        title="블로그 글 수정"
        backHref="/admin/blog"
        backLabel="← 블로그 목록"
      >
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="블로그 글 수정"
      backHref="/admin/blog"
      backLabel="← 블로그 목록"
    >
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {formData.published ? (
            <span className="px-3 py-1 text-sm bg-green-900/50 text-green-400 rounded">
              발행됨
            </span>
          ) : (
            <span className="px-3 py-1 text-sm bg-neutral-800 text-neutral-400 rounded">
              임시저장
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm text-neutral-500 mb-2">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            placeholder="블로그 글 제목을 입력하세요"
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
            <span className="text-neutral-600 text-sm">/blog/</span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              placeholder="post-slug"
              disabled={loading}
            />
          </div>
          <p className="text-neutral-600 text-xs mt-1">
            URL에 사용될 고유 식별자입니다. 영문, 숫자, 하이픈만 사용하세요.
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm text-neutral-500 mb-2"
          >
            요약
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            placeholder="목록에 표시될 간단한 요약을 입력하세요"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">태그</label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            placeholder="주제, 카테고리 등을 입력하세요"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm text-neutral-500 mb-2">
            본문 *
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="블로그 글을 마크다운으로 작성하세요..."
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
          {!formData.published ? (
            <>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading || !formData.title || !formData.content}
                className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
              >
                {loading ? "저장 중..." : "발행하기"}
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.content}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-neutral-100 rounded transition-colors"
              >
                {loading ? "저장 중..." : "임시저장"}
              </button>
            </>
          ) : (
            <>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.content}
                className="px-6 py-3 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 rounded transition-colors"
              >
                {loading ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-neutral-100 rounded transition-colors"
              >
                {loading ? "저장 중..." : "발행 취소"}
              </button>
            </>
          )}
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
