"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { blogApi } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
}

interface BlogResponse {
  posts: BlogPost[];
  total: number;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = (await blogApi.list()) as BlogResponse;
      setPosts(response.posts || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "블로그 글 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      await blogApi.delete(slug, token);
      setPosts(posts.filter((post) => post.slug !== slug));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다");
    }
  };

  return (
    <AdminLayout title="블로그 관리">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-neutral-500 text-sm">총 {posts.length}개의 글</p>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm rounded transition-colors"
        >
          + 새 글 작성
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
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">등록된 블로그 글이 없습니다</p>
          <Link
            href="/admin/blog/new"
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            첫 번째 글을 작성해보세요 →
          </Link>
        </div>
      )}

      {/* Posts List */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg text-neutral-100">{post.title}</h3>
                    {post.published ? (
                      <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">
                        발행됨
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-neutral-800 text-neutral-400 rounded">
                        임시저장
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-sm mb-2 line-clamp-2">
                    {post.excerpt || "내용 없음"}
                  </p>
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-neutral-600 text-xs">
                    {new Date(post.updated_at).toLocaleDateString("ko-KR")} 수정
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  >
                    수정
                  </Link>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  >
                    보기
                  </Link>
                  {deleteConfirm === post.slug ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(post.slug)}
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
                      onClick={() => setDeleteConfirm(post.slug)}
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
