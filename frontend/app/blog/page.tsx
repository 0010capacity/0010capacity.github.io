'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { blogApi } from '@/lib/api';
import { BlogPost } from '@/lib/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'published'>('published');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data: BlogPost[] = await blogApi.list({
          published: filter === 'published' ? true : undefined,
          limit: 50,
          offset: 0,
        });
        setPosts(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">📝 Blog</h1>
          <p className="text-gray-400 text-lg">
            기술, 경험, 그리고 일상에 대한 이야기를 나눕니다.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex gap-3">
          {(['published', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status === 'published' ? '발행됨' : '모두'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">블로그 포스트를 불러오는 중...</p>
          </div>
        )}

        {/* Blog Posts List */}
        {!loading && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block group bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-2xl hover:border-blue-600 transition-all duration-300"
              >
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  {post.cover_image_url && (
                    <div className="w-32 h-32 bg-gray-700 rounded overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new Date(post.published_at || post.created_at).toLocaleDateString(
                          'ko-KR'
                        )}
                      </span>
                      <span>👁️ {post.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">아직 발행된 포스트가 없습니다.</p>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              ← 메인 페이지로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
