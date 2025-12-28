import { MetadataRoute } from "next";
import { BlogPost, Novel, NovelChapter } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://0010capacity-backend.fly.dev";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://0010capacity.github.io";

  const urls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/novels/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tech-stack-analysis`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Fetch all published blog posts
  try {
    const blogResponse = await fetch(
      `${API_BASE_URL}/api/blog?published=true&limit=1000`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (blogResponse.ok) {
      const posts: BlogPost[] = await blogResponse.json();
      posts.forEach(post => {
        urls.push({
          url: `${baseUrl}/blog/${post.slug}/`,
          lastModified: post.published_at
            ? new Date(post.published_at)
            : new Date(post.created_at),
          changeFrequency: "never",
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.warn("Failed to fetch blog posts for sitemap:", error);
  }

  // Fetch all published novels and their chapters
  try {
    const ongoingResponse = await fetch(
      `${API_BASE_URL}/api/novels?limit=1000&status=ongoing`,
      { next: { revalidate: 3600 } }
    );
    const completedResponse = await fetch(
      `${API_BASE_URL}/api/novels?limit=1000&status=completed`,
      { next: { revalidate: 3600 } }
    );

    let novels: Novel[] = [];
    if (ongoingResponse.ok) {
      const data = await ongoingResponse.json();
      novels = [...novels, ...(data.novels || [])];
    }
    if (completedResponse.ok) {
      const data = await completedResponse.json();
      novels = [...novels, ...(data.novels || [])];
    }

    // De-duplicate
    const uniqueNovels = Array.from(
      new Map(novels.map(n => [n.slug, n])).values()
    );

    for (const novel of uniqueNovels) {
      if (novel.status === "draft") continue;

      // Novel Detail Page
      urls.push({
        url: `${baseUrl}/novels/${novel.slug}/`,
        lastModified: novel.updated_at
          ? new Date(novel.updated_at)
          : new Date(novel.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // Novel Chapters
      try {
        const chaptersResponse = await fetch(
          `${API_BASE_URL}/api/novels/${novel.slug}/chapters`,
          { next: { revalidate: 3600 } }
        );

        if (chaptersResponse.ok) {
          const chapters: NovelChapter[] = await chaptersResponse.json();
          for (const chapter of chapters) {
            urls.push({
              url: `${baseUrl}/novels/${novel.slug}/${chapter.chapter_number}/`,
              lastModified: chapter.published_at
                ? new Date(chapter.published_at)
                : chapter.created_at
                  ? new Date(chapter.created_at)
                  : new Date(),
              changeFrequency: "never",
              priority: 0.7,
            });
          }
        }
      } catch (err) {
        console.warn(
          `Failed to fetch chapters for novel ${novel.slug} in sitemap`,
          err
        );
      }
    }
  } catch (error) {
    console.warn("Failed to fetch novels for sitemap:", error);
  }

  return urls;
}
