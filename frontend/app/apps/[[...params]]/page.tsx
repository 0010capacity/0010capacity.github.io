import type { Metadata } from "next";
import { Suspense } from "react";
import type { App } from "@/lib/types";
import AppsPageClient from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://0010capacity-backend.fly.dev";

// Revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams(): Promise<
  Array<{ params: string[] }>
> {
  const index = { params: [] as string[] };

  try {
    const response = await fetch(`${API_BASE_URL}/api/apps?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("Failed to fetch apps for static generation");
      return [index];
    }

    const apps: App[] = await response.json();

    return [
      index,
      ...(apps ?? [])
        .filter((app): app is App => Boolean(app?.slug))
        .map(app => ({
          params: [app.slug],
        })),
    ];
  } catch (error) {
    console.warn("Error generating static params for apps:", error);
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
      title: "앱 | 이정원",
      description: "개발한 앱들의 모음",
      openGraph: {
        title: "앱 | 이정원",
        description: "개발한 앱들의 모음",
        url: "https://0010capacity.github.io/apps/",
        type: "website",
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/apps/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return {
        title: "앱을 찾을 수 없습니다 | 이정원",
        description: "요청하신 앱을 찾을 수 없습니다.",
      };
    }

    const app: App = await response.json();

    const description = app.description || `${app.name} - 앱 상세 정보`;
    const platforms = app.platforms
      ? app.platforms.map(p => p.toUpperCase()).join(", ")
      : "";

    return {
      title: `${app.name} | 이정원`,
      description,
      keywords: platforms ? [app.name, platforms] : [app.name],
      authors: [{ name: "이정원" }],
      openGraph: {
        type: "website",
        title: app.name,
        description,
        url: `https://0010capacity.github.io/apps/${app.slug}/`,
      },
      twitter: {
        card: "summary",
        title: app.name,
        description,
      },
      alternates: {
        canonical: `https://0010capacity.github.io/apps/${app.slug}/`,
      },
    };
  } catch (error) {
    console.warn(`Error fetching metadata for app ${slug}:`, error);
    return {
      title: "앱 | 이정원",
      description: "개발한 앱들의 모음",
    };
  }
}

export const dynamicParams = false;

export default async function AppsPage({
  params,
}: {
  params: Promise<{ params: string[] }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.params?.[0];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-neutral-100 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      }
    >
      <AppsPageClient slug={slug} />
    </Suspense>
  );
}
