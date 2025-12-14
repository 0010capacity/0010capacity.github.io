import type { Metadata } from "next";
import { Novel } from "@/lib/types";
import NovelsPageClient from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://backend-production-xyz.fly.dev";

// Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/novels?status=ongoing&status=completed&limit=100`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch novels for static generation");
      return [{ params: [] }];
    }

    const novels: Novel[] = await response.json();
    return novels.map(novel => ({
      params: { params: [novel.slug] },
    }));
  } catch (error) {
    console.warn("Error generating static params for novels:", error);
    return [{ params: [] }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { params: string[] | undefined };
}): Promise<Metadata> {
  const slug = params?.params?.[0];

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
