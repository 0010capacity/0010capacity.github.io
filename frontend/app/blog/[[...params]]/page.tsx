import type { Metadata } from "next";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/static-blog";
import BlogPageClient from "./client";

export const revalidate = 3600;

export async function generateStaticParams(): Promise<
  Array<{ params: string[] }>
> {
  const posts = await getBlogPosts();
  return [
    { params: [] },
    ...posts.map(post => ({ params: [post.slug] })),
  ];
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
      title: "Blog | DevCapa",
      description: "Developer blog with thoughts on tech and development",
      openGraph: {
        title: "Blog | DevCapa",
        description: "Developer blog with thoughts on tech and development",
        url: "https://0010capacity.github.io/blog/",
        type: "website",
      },
    };
  }

  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found | DevCapa",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | DevCapa`,
    description: post.excerpt || post.title,
    keywords: post.tags,
    authors: [{ name: "DevCapa" }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || post.title,
      url: `https://0010capacity.github.io/blog/${post.slug}/`,
      publishedTime: post.date,
      authors: ["DevCapa"],
      tags: post.tags,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.excerpt || post.title,
    },
    alternates: {
      canonical: `https://0010capacity.github.io/blog/${post.slug}/`,
    },
  };
}

export const dynamicParams = false;

export default async function BlogPage({
  params,
}: {
  params: Promise<{ params: string[] }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.params?.[0];

  let post = null;
  if (slug) {
    post = await getBlogPostBySlug(slug);
  }

  return <BlogPageClient post={post} />;
}
