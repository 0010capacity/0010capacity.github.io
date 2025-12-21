import type { Metadata } from "next";
import { Suspense } from "react";
import type { BlogPost } from "@/lib/types";
import BlogPageClient from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://0010capacity-backend.fly.dev";

// Revalidate every hour
export const revalidate = 3600;

// On GitHub Pages static export + trailingSlash, the index route must exist as
// /blog/index.html. If it's missing, visiting /blog/ can 404 and trigger the SPA
// fallback, causing redirect loops.
export async function generateStaticParams(): Promise<
  Array<{ params: string[] }>
> {
  const index = { params: [] as string[] };

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/blog?published=true&limit=100`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.warn("Failed to fetch blog posts for static generation");
      return [index];
    }

    const posts: BlogPost[] = await response.json();

    return [
      index,
      ...(posts ?? [])
        .filter((post): post is BlogPost => Boolean(post?.slug))
        .map(post => ({
          params: [post.slug],
        })),
    ];
  } catch (error) {
    console.warn("Error generating static params for blog:", error);
    return [index];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ params: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.params?.[0];

  if (!slug) {
    return {
      title: "블로그 | 이정원",
      description: "기술, 경험, 그리고 생각들에 대한 블로그",
      openGraph: {
        title: "블로그 | 이정원",
        description: "기술, 경험, 그리고 생각들에 대한 블로그",
        url: "https://0010capacity.github.io/blog/",
        type: "website",
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return {
        title: "글을 찾을 수 없습니다 | 이정원",
        description: "요청하신 글을 찾을 수 없습니다.",
      };
    }

    const post: BlogPost = await response.json();

    const description =
      post.excerpt || post.content.substring(0, 160).replace(/[#*`]/g, "");

    return {
      title: `${post.title} | 이정원`,
      description,
      keywords: post.tags,
      authors: [{ name: "이정원" }],
      openGraph: {
        type: "article",
        title: post.title,
        description,
        url: `https://0010capacity.github.io/blog/${post.slug}/`,
        publishedTime: post.published_at || post.created_at,
        authors: ["이정원"],
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
      },
      alternates: {
        canonical: `https://0010capacity.github.io/blog/${post.slug}/`,
      },
    };
  } catch (error) {
    console.warn(`Error fetching metadata for blog post ${slug}:`, error);
    return {
      title: "블로그 | 이정원",
      description: "기술, 경험, 그리고 생각들에 대한 블로그",
    };
  }
}

export const dynamicParams = false;

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-neutral-100 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      }
    >
      <BlogPageClient />
    </Suspense>
  );
}
