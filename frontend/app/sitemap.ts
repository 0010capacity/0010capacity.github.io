import { MetadataRoute } from "next";
import { BlogPost, Novel } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://backend-production-xyz.fly.dev";

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

  // Fetch all published novels
  try {
    const novelsResponse = await fetch(
      `${API_BASE_URL}/api/novels?limit=1000`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (novelsResponse.ok) {
      const novels: Novel[] = await novelsResponse.json();
      novels.forEach(novel => {
        urls.push({
          url: `${baseUrl}/novels/${novel.slug}/`,
          lastModified: novel.updated_at
            ? new Date(novel.updated_at)
            : new Date(novel.created_at),
          changeFrequency: "never",
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.warn("Failed to fetch novels for sitemap:", error);
  }

  return urls;
}
