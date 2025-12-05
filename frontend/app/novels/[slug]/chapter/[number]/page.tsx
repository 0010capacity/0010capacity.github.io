'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { novelsApi } from '@/lib/api';
import { Novel, NovelChapter } from '@/lib/types';

export default function ChapterReadPage() {
  const params = useParams();
  const slug = params.slug as string;
  const number = parseInt(params.number as string, 10);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<NovelChapter | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        const [novelData, chapterData, chaptersData] = await Promise.all([
          novelsApi.getBySlug(slug),
          novelsApi.getChapter(slug, number),
          novelsApi.getChapters(slug),
        ]);
        setNovel(novelData);
        setChapter(chapterData);
        setChapters(Array.isArray(chaptersData) ? chaptersData : []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapter');
        setChapter(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug && number) {
      fetchChapterData();
    }
  }, [slug, number]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">챕터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !chapter || !novel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-400 mb-4">{error || '챕터를 찾을 수 없습니다.'}</p>
            <Link href={`/novels/${slug}`} className="text-blue-400 hover:text-blue-300 font-medium">
              ← 소설로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = chapters.findIndex((c) => c.chapter_number === number);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/novels/${slug}`} className="text-blue-400 hover:text-blue-300 font-medium">
            ← {novel.title}
          </Link>
          <span className="text-gray-400">Chapter {number} / {chapters.length}</span>
        </div>

        {/* Chapter Header */}
        <div className="mb-12 pb-8 border-b border-gray-700">
          <h1 className="text-4xl font-bold mb-2">
            Chapter {chapter.chapter_number}: {chapter.title}
          </h1>
          <p className="text-gray-400">
            {new Date(chapter.created_at).toLocaleDateString('ko-KR')} • 👁️ {chapter.view_count.toLocaleString()}
          </p>
        </div>

        {/* Chapter Content */}
        <article className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-12 prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
            {chapter.content}
          </div>
        </article>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-12">
          {prevChapter ? (
            <Link
              href={`/novels/${slug}/chapter/${prevChapter.chapter_number}`}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 hover:border-gray-500 transition-all text-center"
            >
              ← Chapter {prevChapter.chapter_number}
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextChapter ? (
            <Link
              href={`/novels/${slug}/chapter/${nextChapter.chapter_number}`}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded border border-blue-500 hover:border-blue-400 transition-all text-center"
            >
              Chapter {nextChapter.chapter_number} →
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Chapters List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📚 All Chapters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {chapters.map((c) => (
              <Link
                key={c.id}
                href={`/novels/${slug}/chapter/${c.chapter_number}`}
                className={`p-3 rounded transition-all ${
                  c.chapter_number === number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                Chapter {c.chapter_number}: {c.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
