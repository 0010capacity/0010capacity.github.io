'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { blogApi } from '@/lib/api';
import { BlogPost } from '@/lib/types';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBySlug(slug);
        setPost(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog post');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">블로그 포스트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-400 mb-4">{error || '포스트를 찾을 수 없습니다.'}</p>
            <Link href="/blog" className="text-blue-400 hover:text-blue-300 font-medium">
              ← 블로그로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <Link href="/blog" className="text-blue-400 hover:text-blue-300 font-medium mb-8 inline-block">
          ← 블로그
        </Link>

        {/* Hero Image */}
        {post.cover_image_url && (
          <div className="w-full h-96 bg-gray-700 rounded-lg overflow-hidden mb-8">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="mb-12 pb-8 border-b border-gray-700">
          <h1 className="text-5xl font-bold mb-4">{post.title}</h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-600 text-blue-100 rounded text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-gray-400">
            <span>
              {new Date(post.published_at || post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span>👁️ {post.view_count.toLocaleString()} views</span>
            {post.published && (
              <>
                <span>•</span>
                <span className="text-green-400">발행됨</span>
              </>
            )}
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div className="mb-8 p-6 bg-gray-800 border border-gray-700 rounded-lg italic text-lg text-gray-300">
            {post.excerpt}
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert max-w-none mb-12">
          <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        {/* Back to Blog */}
        <div className="pt-8 border-t border-gray-700">
          <Link
            href="/blog"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            ← 블로그로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
