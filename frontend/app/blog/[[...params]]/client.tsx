"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogPost } from "@/lib/types";
import styles from "./client.module.css";

interface BlogPageClientProps {
  post: (BlogPost & { content?: string }) | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPageClient({ post }: BlogPageClientProps) {
  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>
            ← DevCapa
          </Link>
          <h1 className={styles.title}>Blog</h1>
        </div>
        <p className={styles.empty}>No posts yet</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← DevCapa
        </Link>
      </div>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div className={styles.meta}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.tags && post.tags.length > 0 && (
              <span className={styles.tags}>{post.tags.join(", ")}</span>
            )}
          </div>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        </header>

        {post.content && (
          <div className={styles.content}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        )}
      </article>
    </div>
  );
}
