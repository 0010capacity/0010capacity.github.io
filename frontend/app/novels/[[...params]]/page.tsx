import type { Metadata } from "next";
import { Novel, NovelChapter } from "@/lib/types";
import NovelsPageClient from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://0010capacity-backend.fly.dev";

// Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/novels?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("Failed to fetch novels for static generation");
      return [{ params: [] }];
    }

    const novels: Novel[] = await response.json();

    // Initialize paths with the index page
    const paths = [{ params: [] }];

    // Create promises to fetch chapters for each novel
    const chaptersPromises = novels.map(async (novel) => {
        // Add novel detail page
        const novelPaths = [{ params: [novel.slug] }];

        try {
            const res = await fetch(`${API_BASE_URL}/api/novels/${novel.slug}/chapters`, {
                next: { revalidate: 3600 }
            });
            if (res.ok) {
                const chapters: NovelChapter[] = await res.json();
                // Add chapter pages
                for (const chapter of chapters) {
                    novelPaths.push({ params: [novel.slug, String(chapter.chapter_number)] });
                }
            }
        } catch (error) {
            console.warn(`Failed to fetch chapters for novel ${novel.slug}:`, error);
        }
        return novelPaths;
    });

    // Resolve all promises and flatten the array
    const allPaths = (await Promise.all(chaptersPromises)).flat();

    // Combine index page with all other paths
    return [...paths, ...allPaths];

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
  const urlParams = resolvedParams.params || [];
  const slug = urlParams[0];
  const chapterNumber = urlParams[1];

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
    const response = await fetch(`${API_BASE_URL}/api/novels/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return {
        title: "소설을 찾을 수 없습니다 | 이정원",
        description: "요청하신 소설을 찾을 수 없습니다.",
      };
    }

    const novel: Novel = await response.json();

    // If looking at a specific chapter
    if (chapterNumber) {
        try {
            const chapterResponse = await fetch(`${API_BASE_URL}/api/novels/${slug}/chapters/${chapterNumber}`, {
                next: { revalidate: 3600 },
            });

            if (chapterResponse.ok) {
                const chapter: NovelChapter = await chapterResponse.json();
                const description = `[${novel.title}] ${chapter.chapter_number}화 - ${chapter.title}`;

                return {
                    title: `${chapter.title} - ${novel.title} | 이정원`,
                    description,
                    openGraph: {
                        type: "article",
                        title: `${chapter.title} - ${novel.title}`,
                        description,
                        url: `https://0010capacity.github.io/novels/${novel.slug}/${chapter.chapter_number}/`,
                        publishedTime: chapter.published_at || chapter.created_at,
                        authors: ["이정원"],
                    },
                    twitter: {
                        card: "summary_large_image",
                        title: `${chapter.title} - ${novel.title}`,
                        description,
                    },
                    alternates: {
                        canonical: `https://0010capacity.github.io/novels/${novel.slug}/${chapter.chapter_number}/`,
                    },
                };
            }
        } catch (error) {
            console.warn(`Error fetching metadata for chapter ${chapterNumber} of ${slug}:`, error);
        }
    }

    const description = novel.description || "창작 소설";

    return {
      title: `${novel.title} | 이정원`,
      description,
      authors: [{ name: "이정원" }],
      openGraph: {
        type: "article",
        title: novel.title,
        description,
        url: `https://0010capacity.github.io/novels/${novel.slug}/`,
        publishedTime: novel.created_at,
        authors: ["이정원"],
      },
      twitter: {
        card: "summary_large_image",
        title: novel.title,
        description,
      },
      alternates: {
        canonical: `https://0010capacity.github.io/novels/${novel.slug}/`,
      },
    };
  } catch (error) {
    console.warn(`Error fetching metadata for novel ${slug}:`, error);
    return {
      title: "소설 | 이정원",
      description: "창작 소설 모음",
    };
  }
}

export const dynamicParams = false;

export default function NovelsPage() {
  return <NovelsPageClient />;
}
