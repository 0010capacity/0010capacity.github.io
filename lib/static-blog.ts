import fs from "fs/promises";
import path from "path";
import type { BlogPost } from "./types";

interface BlogIndex {
  slug: string;
  title: string;
  excerpt?: string;
  date: string;
  tags?: string[];
}

const BLOG_INDEX_PATH = path.join(process.cwd(), "public/data/blog-index.json");
const BLOG_DIR = path.join(process.cwd(), "public/blog");

export async function getBlogPosts(): Promise<BlogPost[]> {
  const content = await fs.readFile(BLOG_INDEX_PATH, "utf-8");
  const posts: BlogIndex[] = JSON.parse(content);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    const content = await fs.readFile(filePath, "utf-8");

    // Get the index post data
    const posts = await getBlogPosts();
    const indexPost = posts.find(p => p.slug === slug);

    if (!indexPost) {
      return null;
    }

    return {
      ...indexPost,
      content,
    };
  } catch {
    return null;
  }
}
