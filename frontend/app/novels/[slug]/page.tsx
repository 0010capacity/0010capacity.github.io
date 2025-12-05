'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { novelsApi } from '@/lib/api';
import { Novel, NovelChapter } from '@/lib/types';

export default function NovelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNovelData = async () => {
      try {
        setLoading(true);
        const [novelData, chaptersData] = await Promise.all([
          novelsApi.getBySlug(slug),
          novelsApi.getChapters(slug),
        ]);
        setNovel(novelData);
        setChapters(Array.isArray(chaptersData) ? chaptersData : []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load novel');
        setNovel(null);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNovelData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">소설을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-400 mb-4">{error || '소설을 찾을 수 없습니다.'}</p>
            <Link href="/novels" className="text-blue-400 hover:text-blue-300 font-medium">
              ← 소설 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Navigation */}
        <Link href="/novels" className="text-blue-400 hover:text-blue-300 font-medium mb-8 inline-block">
          ← 소설 목록
        </Link>

        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Cover Image */}
          <div className="md:col-span-1">
            <div className="w-full bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
              {novel.cover_image_url ? (
                <img
                  src={novel.cover_image_url}
                  alt={novel.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl">📖</div>
              )}
            </div>
          </div>

          {/* Novel Info */}
          <div className="md:col-span-3">
            <h1 className="text-5xl font-bold mb-4">{novel.title}</h1>

            {/* Status & Genre */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <span className="px-3 py-1 bg-blue-600 text-blue-100 rounded text-sm font-medium">
                {statusLabel(novel.status)}
              </span>
              {novel.genre && (
                <span className="px-3 py-1 bg-gray-700 text-gray-200 rounded text-sm font-medium">
                  {novel.genre}
                </span>
              )}
            </div>

            {/* Description */}
            {novel.description && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {novel.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700">
              <div>
                <p className="text-gray-400 text-sm">조회수</p>
                <p className="text-2xl font-bold">👁️ {novel.view_count.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">챕터</p>
                <p className="text-2xl font-bold">📖 {chapters.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">작성일</p>
                <p className="text-lg">
                  {new Date(novel.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6">📚 챕터</h2>

          {chapters.length > 0 ? (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/novels/${slug}/chapter/${chapter.chapter_number}`}
                  className="block p-4 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(chapter.created_at).toLocaleDateString('ko-KR')} • 👁️{' '}
                        {chapter.view_count.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-blue-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">아직 챕터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
