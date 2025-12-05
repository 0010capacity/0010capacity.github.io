"use client";

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import Link from "next/link";
import { novelsApi } from "@/lib/api";
import { Novel, NovelChapter } from "@/lib/types";

// Navigation Context for SPA-style routing
interface NavState {
  view: "list" | "detail" | "chapter";
  slug?: string;
  chapterNumber?: number;
}

interface NavContextType {
  navState: NavState;
  navigate: (state: NavState) => void;
  goBack: () => void;
}

const NavContext = createContext<NavContextType | null>(null);

function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}

// Novel List Component
function NovelList() {
  const { navigate } = useNav();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        setLoading(true);
        const response = (await novelsApi.list({ limit: 50 })) as {
          novels: Novel[];
          total: number;
        };
        setNovels(response.novels || []);
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
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-16">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-2xl font-light mt-8 mb-2">소설</h1>
          <p className="text-neutral-500 text-sm">이야기를 씁니다</p>
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
              <button
                key={novel.id}
                onClick={() => navigate({ view: "detail", slug: novel.slug })}
                className="group block w-full text-left py-6 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
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
                  <span>{novel.view_count?.toLocaleString() || 0} views</span>
                </div>
              </button>
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
  const { navigate } = useNav();
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

  // 소설 유형에 따른 단위
  const getUnit = (novelType?: string) => {
    return novelType === "series" ? "화" : "장";
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
          <button
            onClick={() => navigate({ view: "list" })}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 목록으로
          </button>
        </div>
      </div>
    );
  }

  const unit = getUnit(novel.novel_type);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate({ view: "list" })}
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 목록으로
        </button>

        <header className="mt-12 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-neutral-600 border border-neutral-800 px-2 py-1 rounded">
              {statusLabel(novel.status)}
            </span>
            {novel.genre && (
              <span className="text-xs text-neutral-600">{novel.genre}</span>
            )}
            {novel.novel_type && (
              <span className="text-xs text-neutral-600">
                {novel.novel_type === "series"
                  ? "연재물"
                  : novel.novel_type === "long"
                    ? "장편"
                    : "단편"}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-light mb-6">{novel.title}</h1>

          {novel.description && (
            <p className="text-neutral-400 leading-relaxed">
              {novel.description}
            </p>
          )}

          <div className="flex gap-6 mt-8 pt-8 border-t border-neutral-900 text-sm text-neutral-600">
            <span>{novel.view_count?.toLocaleString() || 0} views</span>
            <span>
              {chapters.length} {unit}
            </span>
            <span>
              {new Date(novel.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </header>

        <section>
          <h2 className="text-sm text-neutral-600 uppercase tracking-widest mb-8">
            {novel.novel_type === "series" ? "회차 목록" : "목차"}
          </h2>

          {chapters.length > 0 ? (
            <div className="space-y-1">
              {chapters.map(chapter => (
                <button
                  key={chapter.id}
                  onClick={() =>
                    navigate({
                      view: "chapter",
                      slug,
                      chapterNumber: chapter.chapter_number,
                    })
                  }
                  className="group flex items-baseline justify-between w-full text-left py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-neutral-600 text-sm w-12">
                      {chapter.chapter_number}
                      {unit}
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
                </button>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 text-sm">아직 {unit}이 없습니다</p>
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
  const { navigate } = useNav();
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

  // 소설 유형에 따른 단위
  const getUnit = (novelType?: string) => {
    return novelType === "series" ? "화" : "장";
  };

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
          <button
            onClick={() => navigate({ view: "detail", slug })}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const unit = getUnit(novel.novel_type);
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
          <button
            onClick={() => navigate({ view: "detail", slug })}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← {novel.title}
          </button>
          <span className="text-sm text-neutral-700">
            {chapterNumber} / {chapters.length}
          </span>
        </div>

        <header className="mb-12 pb-8 border-b border-neutral-900">
          <span className="text-sm text-neutral-600 block mb-2">
            {chapterNumber}
            {unit}
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
            <button
              onClick={() =>
                navigate({
                  view: "chapter",
                  slug,
                  chapterNumber: prevChapter.chapter_number,
                })
              }
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← 이전
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={() => navigate({ view: "detail", slug })}
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            목차
          </button>

          {nextChapter ? (
            <button
              onClick={() =>
                navigate({
                  view: "chapter",
                  slug,
                  chapterNumber: nextChapter.chapter_number,
                })
              }
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              다음 →
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Component with SPA-style Routing
export default function NovelsPageClient() {
  const [navState, setNavState] = useState<NavState>({ view: "list" });
  const [history, setHistory] = useState<NavState[]>([]);

  const navigate = useCallback(
    (state: NavState) => {
      setHistory(prev => [...prev, navState]);
      setNavState(state);
    },
    [navState]
  );

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevState = newHistory.pop();
      setHistory(newHistory);
      setNavState(prevState || { view: "list" });
    } else {
      setNavState({ view: "list" });
    }
  }, [history]);

  const renderView = () => {
    switch (navState.view) {
      case "detail":
        return navState.slug ? (
          <NovelDetail slug={navState.slug} />
        ) : (
          <NovelList />
        );
      case "chapter":
        return navState.slug && navState.chapterNumber ? (
          <ChapterRead
            slug={navState.slug}
            chapterNumber={navState.chapterNumber}
          />
        ) : (
          <NovelList />
        );
      case "list":
      default:
        return <NovelList />;
    }
  };

  return (
    <NavContext.Provider value={{ navState, navigate, goBack }}>
      {renderView()}
    </NavContext.Provider>
  );
}
