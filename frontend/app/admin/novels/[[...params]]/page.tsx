import NovelsAdminClient from "./client";

export function generateStaticParams() {
  // Base static paths for output: 'export'
  // Dynamic paths will be handled via 404.html SPA fallback in production
  return [
    { params: [] }, // /admin/novels
    { params: ["new"] }, // /admin/novels/new
  ];
}

export default function NovelsAdminPage() {
  return <NovelsAdminClient />;
}
