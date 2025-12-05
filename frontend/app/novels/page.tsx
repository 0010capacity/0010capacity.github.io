'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { novelsApi } from '@/lib/api';
import { Novel } from '@/lib/types';

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        setLoading(true);
        const data: Novel[] = await novelsApi.list({
          status: filter === 'all' ? undefined : filter,
          limit: 50,
          offset: 0,
        });
        setNovels(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load novels');
        setNovels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, [filter]);

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-600 text-gray-100';
      case 'ongoing':
        return 'bg-blue-600 text-blue-100';
      case 'completed':
        return 'bg-green-600 text-green-100';
      default:
        return 'bg-gray-600';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return '임시 저장';
      case 'ongoing':
        return '연재 중';
      case 'completed':
        return '완료';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">📚 Novels</h1>
          <p className="text-gray-400 text-lg">
            여러 소설을 읽고 감상해보세요.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {(['all', 'draft', 'ongoing', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status === 'all'
                ? '모두'
                : status === 'draft'
                ? '임시 저장'
                : status === 'ongoing'
                ? '연재 중'
                : '완료'}
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
            <p className="text-gray-400">소설 목록을 불러오는 중...</p>
          </div>
        )}

        {/* Novels Grid */}
        {!loading && novels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.slug}`}
                className="group bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-2xl hover:border-blue-600 transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {novel.cover_image_url ? (
                    <img
                      src={novel.cover_image_url}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">📖</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusBadgeColor(
                        novel.status
                      )}`}
                    >
                      {statusLabel(novel.status)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {novel.title}
                  </h3>

                  {/* Description */}
                  {novel.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {novel.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-700">
                    {novel.genre && <span className="text-blue-400">{novel.genre}</span>}
                    <span>👁️ {novel.view_count.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && novels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">아직 등록된 소설이 없습니다.</p>
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
