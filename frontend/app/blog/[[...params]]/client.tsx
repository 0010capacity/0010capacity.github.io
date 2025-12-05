"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { blogApi } from "@/lib/api";
import { BlogPost } from "@/lib/types";

// Blog List Component
function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = (await blogApi.list({
          published: true,
          limit: 50,
          offset: 0,
        })) as BlogPost[];
        setPosts(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "포스트를 불러오지 못했습니다"
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
          <h1 className="text-2xl font-light mt-8 mb-2">블로그</h1>
          <p className="text-neutral-500 text-sm">기술, 경험, 그리고 생각들</p>
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

        {!loading && posts.length > 0 && (
          <div className="space-y-1">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-baseline justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-neutral-300 group-hover:text-white transition-colors truncate">
                    {post.title}
                  </h2>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs text-neutral-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <time className="text-sm text-neutral-600 flex-shrink-0">
                  {new Date(
                    post.published_at || post.created_at
                  ).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </Link>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-6">아직 작성된 글이 없습니다</p>
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              ← 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Blog Detail Component
function BlogDetail({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = (await blogApi.getBySlug(slug)) as BlogPost;
        setPost(data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "글을 불러오지 못했습니다"
        );
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <p className="text-neutral-500 mb-6">
            {error || "글을 찾을 수 없습니다"}
          </p>
          <Link
            href="/blog"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/blog"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 블로그
        </Link>

        <header className="mt-12 mb-12">
          <time className="text-sm text-neutral-600 block mb-4">
            {formatDate(post.published_at || post.created_at)}
          </time>
          <h1 className="text-3xl font-light mb-6 leading-tight">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="text-sm text-neutral-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.cover_image_url && (
          <div className="mb-12">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full rounded"
            />
          </div>
        )}

        {post.excerpt && (
          <p className="text-neutral-400 text-lg mb-12 border-l-2 border-neutral-800 pl-6">
            {post.excerpt}
          </p>
        )}

        <article className="mb-16">
          <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        <footer className="pt-8 border-t border-neutral-900">
          <Link
            href="/blog"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 블로그로 돌아가기
          </Link>
        </footer>
      </div>
    </div>
  );
}

// Main Page Component with Client-Side Routing
export default function BlogPageClient() {
  const params = useParams();
  const paramsArray = params?.params as string[] | undefined;

  // Route parsing:
  // /blog -> []
  // /blog/[slug] -> [slug]

  if (!paramsArray || paramsArray.length === 0) {
    return <BlogList />;
  }

  if (paramsArray.length === 1) {
    const slug = paramsArray[0];
    if (slug) {
      return <BlogDetail slug={slug} />;
    }
  }

  // Invalid route - show 404-like message
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-neutral-500 mb-6">페이지를 찾을 수 없습니다</p>
        <Link
          href="/blog"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 블로그로 돌아가기
        </Link>
      </div>
    </div>
  );
}
