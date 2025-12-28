import type { Metadata } from "next";
import { Suspense } from "react";
import NovelsPageClient from "../client";
import { Novel, NovelChapter } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://0010capacity-backend.fly.dev";

// Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams(): Promise<
  Array<{ params: string[] }>
> {
  const paths: Array<{ params: string[] }> = [];

  // 1. Index page: /novels
  paths.push({ params: [] });

  try {
    // Fetch all novels
    // Note: We need a way to fetch ALL novels. The existing list API has a limit.
    // We'll try to fetch a reasonably large number or use pagination if needed.
    // For SSG, we ideally want everything. Let's assume a large limit covers it for now.
    const response = await fetch(
      `${API_BASE_URL}/api/novels?limit=1000&status=ongoing`, // Fetch ongoing
      { next: { revalidate: 3600 } }
    );
    const responseCompleted = await fetch(
      `${API_BASE_URL}/api/novels?limit=1000&status=completed`, // Fetch completed
      { next: { revalidate: 3600 } }
    );

    // Combine results if successful
    let novels: Novel[] = [];
    if (response.ok) {
      const data = await response.json();
      novels = [...novels, ...(data.novels || [])];
    }
    if (responseCompleted.ok) {
      const data = await responseCompleted.json();
      novels = [...novels, ...(data.novels || [])];
    }

    // Remove duplicates just in case
    const uniqueNovels = Array.from(
      new Map(novels.map(n => [n.slug, n])).values()
    );

    for (const novel of uniqueNovels) {
      if (!novel.slug) continue;

      // 2. Novel detail page: /novels/[slug]
      paths.push({ params: [novel.slug] });

      // Fetch chapters for this novel
      try {
        const chaptersResponse = await fetch(
          `${API_BASE_URL}/api/novels/${novel.slug}/chapters`,
          { next: { revalidate: 3600 } }
        );

        if (chaptersResponse.ok) {
          const chapters: NovelChapter[] = await chaptersResponse.json();
          for (const chapter of chapters) {
            // 3. Chapter page: /novels/[slug]/[chapter]
            paths.push({
              params: [novel.slug, chapter.chapter_number.toString()],
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch chapters for novel ${novel.slug}`, err);
      }
    }

    return paths;
  } catch (error) {
    console.warn("Error generating static params for novels:", error);
    return [{ params: [] }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ params: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const pathParams = resolvedParams.params || [];
  const slug = pathParams[0];
  const chapterNum = pathParams[1];

  // 1. /novels (List)
  if (!slug) {
    return {
      title: "소설 | 이정원",
      description: "창작 소설 모음",
      openGraph: {
        title: "소설 | 이정원",
        description: "창작 소설 모음",
        url: "https://0010capacity.github.io/novels/",
        type: "website",
      },
    };
  }

  try {
    // Fetch Novel Data
    const novelResponse = await fetch(`${API_BASE_URL}/api/novels/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!novelResponse.ok) {
      return {
        title: "소설을 찾을 수 없습니다",
        description: "요청하신 소설을 찾을 수 없습니다.",
      };
    }

    const novel: Novel = await novelResponse.json();

    // 2. /novels/[slug] (Detail)
    if (!chapterNum) {
      return {
        title: `${novel.title} | 이정원`,
        description: novel.description || `${novel.title} - 소설 상세 정보`,
        openGraph: {
          title: `${novel.title} | 이정원`,
          description: novel.description || `${novel.title} - 소설 상세 정보`,
          url: `https://0010capacity.github.io/novels/${slug}/`,
          type: "article",
        },
      };
    }

    // 3. /novels/[slug]/[chapter] (Chapter)
    const chapterResponse = await fetch(
      `${API_BASE_URL}/api/novels/${slug}/chapters/${chapterNum}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!chapterResponse.ok) {
      return {
        title: `${novel.title} - 찾을 수 없음`,
      };
    }

    const chapter: NovelChapter = await chapterResponse.json();
    const chapterTitle = chapter.title || `${chapter.chapter_number}장`;

    return {
      title: `${chapterTitle} - ${novel.title} | 이정원`,
      description: `${novel.title} ${chapterTitle} 읽기`,
      openGraph: {
        title: `${chapterTitle} - ${novel.title} | 이정원`,
        description: `${novel.title} ${chapterTitle} 읽기`,
        url: `https://0010capacity.github.io/novels/${slug}/${chapterNum}/`,
        type: "article",
      },
    };
  } catch (error) {
    console.warn(`Error fetching metadata for novel/chapter`, error);
    return {
      title: "소설 | 이정원",
    };
  }
}

export const dynamicParams = false;

export default async function NovelsPage({
  params,
}: {
  params: Promise<{ params: string[] }>;
}) {
  const resolvedParams = await params;
  const pathParams = resolvedParams.params || [];
  const slug = pathParams[0];
  const chapterParam = pathParams[1];
  const chapterNumber = chapterParam ? parseInt(chapterParam, 10) : undefined;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-neutral-100 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      }
    >
      <NovelsPageClient slug={slug} chapterNumber={chapterNumber} />
    </Suspense>
  );
}
