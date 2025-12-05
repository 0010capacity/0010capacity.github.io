import BlogAdminClient from "./client";

export function generateStaticParams() {
  return [{ params: [] }, { params: ["new"] }];
}

export const dynamicParams = false;

export default function BlogAdminPage() {
  return <BlogAdminClient />;
}
