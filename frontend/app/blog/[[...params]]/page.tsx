import BlogPageClient from "./client";

// Required for static export
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ params: undefined }];
}

export default function BlogPage() {
  return <BlogPageClient />;
}
