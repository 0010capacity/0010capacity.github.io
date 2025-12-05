"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { novelsApi } from "@/lib/api";
import { Novel, NovelChapter } from "@/lib/types";

// Novel List Component
function NovelList() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        setLoading(true);
        const data = (await novelsApi.list({ limit: 50 })) as Novel[];
        setNovels(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "소설을 불러오지 못했습니다"
        );
        setNovels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

  const statusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "작성 중";
      case "ongoing":
        return "연재 중";
      case "completed":
        return "완결";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-16">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-3xl font-light mt-8 mb-4">소설</h1>
          <p className="text-neutral-500">이야기를 씁니다</p>
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

        {!loading && novels.length > 0 && (
          <div className="space-y-8">
            {novels.map(novel => (
              <Link
                key={novel.id}
                href={`/novels/${novel.slug}`}
                className="group block py-6 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-medium text-neutral-200 group-hover:text-white transition-colors">
                    {novel.title}
                  </h2>
                  <span className="text-xs text-neutral-600 ml-4 flex-shrink-0">
                    {statusLabel(novel.status)}
                  </span>
                </div>
                {novel.description && (
                  <p className="text-neutral-500 text-sm line-clamp-2 mb-3">
                    {novel.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-neutral-600">
                  {novel.genre && <span>{novel.genre}</span>}
                  <span>{novel.view_count.toLocaleString()} views</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && novels.length === 0 && !error && (
          <div className="text-center py-24">
            <p className="text-neutral-600 mb-2">아직 등록된 소설이 없습니다</p>
            <p className="text-neutral-700 text-sm">
              곧 새로운 이야기가 시작됩니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Novel Detail Component
function NovelDetail({ slug }: { slug: string }) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNovelData = async () => {
      try {
        setLoading(true);
        const [novelData, chaptersData] = await Promise.all([
          novelsApi.getBySlug(slug),
          novelsApi.getChapters(slug),
        ]);
        setNovel(novelData as Novel);
        setChapters(
          Array.isArray(chaptersData) ? (chaptersData as NovelChapter[]) : []
        );
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "소설을 불러오지 못했습니다"
        );
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

  const statusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "작성 중";
      case "ongoing":
        return "연재 중";
      case "completed":
        return "완결";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <p className="text-neutral-500 mb-6">
            {error || "소설을 찾을 수 없습니다"}
          </p>
          <Link
            href="/novels"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/novels"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 목록으로
        </Link>

        <header className="mt-12 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-neutral-600 border border-neutral-800 px-2 py-1 rounded">
              {statusLabel(novel.status)}
            </span>
            {novel.genre && (
              <span className="text-xs text-neutral-600">{novel.genre}</span>
            )}
          </div>

          <h1 className="text-3xl font-light mb-6">{novel.title}</h1>

          {novel.description && (
            <p className="text-neutral-400 leading-relaxed">
              {novel.description}
            </p>
          )}

          <div className="flex gap-6 mt-8 pt-8 border-t border-neutral-900 text-sm text-neutral-600">
            <span>{novel.view_count.toLocaleString()} views</span>
            <span>{chapters.length} chapters</span>
            <span>
              {new Date(novel.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </header>

        <section>
          <h2 className="text-sm text-neutral-600 uppercase tracking-widest mb-8">
            Chapters
          </h2>

          {chapters.length > 0 ? (
            <div className="space-y-1">
              {chapters.map(chapter => (
                <Link
                  key={chapter.id}
                  href={`/novels/${slug}/chapter/${chapter.chapter_number}`}
                  className="group flex items-baseline justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-neutral-600 text-sm w-8">
                      {chapter.chapter_number}
                    </span>
                    <span className="text-neutral-300 group-hover:text-white transition-colors">
                      {chapter.title}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-700">
                    {new Date(chapter.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 text-sm">아직 챕터가 없습니다</p>
          )}
        </section>
      </div>
    </div>
  );
}

// Chapter Read Component
function ChapterRead({
  slug,
  chapterNumber,
}: {
  slug: string;
  chapterNumber: number;
}) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<NovelChapter | null>(null);
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        const [novelData, chapterData, chaptersData] = await Promise.all([
          novelsApi.getBySlug(slug),
          novelsApi.getChapter(slug, chapterNumber),
          novelsApi.getChapters(slug),
        ]);
        setNovel(novelData as Novel);
        setChapter(chapterData as NovelChapter);
        setChapters(
          Array.isArray(chaptersData) ? (chaptersData as NovelChapter[]) : []
        );
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "챕터를 불러오지 못했습니다"
        );
        setChapter(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug && chapterNumber) {
      fetchChapterData();
    }
  }, [slug, chapterNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (error || !chapter || !novel) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <p className="text-neutral-500 mb-6">
            {error || "챕터를 찾을 수 없습니다"}
          </p>
          <Link
            href={`/novels/${slug}`}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = chapters.findIndex(
    c => c.chapter_number === chapterNumber
  );
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <Link
            href={`/novels/${slug}`}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← {novel.title}
          </Link>
          <span className="text-sm text-neutral-700">
            {chapterNumber} / {chapters.length}
          </span>
        </div>

        <header className="mb-12 pb-8 border-b border-neutral-900">
          <span className="text-sm text-neutral-600 block mb-2">
            Chapter {chapter.chapter_number}
          </span>
          <h1 className="text-2xl font-light mb-4">{chapter.title}</h1>
          <time className="text-sm text-neutral-700">
            {new Date(chapter.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        <article className="mb-16">
          <div className="whitespace-pre-wrap text-neutral-300 leading-relaxed">
            {chapter.content}
          </div>
        </article>

        <div className="flex justify-between items-center py-8 border-t border-neutral-900">
          {prevChapter ? (
            <Link
              href={`/novels/${slug}/chapter/${prevChapter.chapter_number}`}
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← 이전
            </Link>
          ) : (
            <span />
          )}

          <Link
            href={`/novels/${slug}`}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            목차
          </Link>

          {nextChapter ? (
            <Link
              href={`/novels/${slug}/chapter/${nextChapter.chapter_number}`}
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              다음 →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Component with Client-Side Routing
export default function NovelsPageClient() {
  const params = useParams();
  const paramsArray = params?.params as string[] | undefined;

  // Route parsing:
  // /novels -> []
  // /novels/[slug] -> [slug]
  // /novels/[slug]/chapter/[number] -> [slug, "chapter", number]

  if (!paramsArray || paramsArray.length === 0) {
    return <NovelList />;
  }

  const slug = paramsArray[0];

  if (!slug) {
    return <NovelList />;
  }

  if (paramsArray.length === 1) {
    return <NovelDetail slug={slug} />;
  }

  if (paramsArray.length === 3 && paramsArray[1] === "chapter") {
    const chapterNumberStr = paramsArray[2];
    if (chapterNumberStr) {
      const chapterNumber = parseInt(chapterNumberStr, 10);
      if (!isNaN(chapterNumber)) {
        return <ChapterRead slug={slug} chapterNumber={chapterNumber} />;
      }
    }
  }

  // Invalid route - show 404-like message
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-neutral-500 mb-6">페이지를 찾을 수 없습니다</p>
        <Link
          href="/novels"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 소설 목록으로
        </Link>
      </div>
    </div>
  );
}
