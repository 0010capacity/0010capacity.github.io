import AppsPageClient from "./client";

// Required for static export
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ params: [] }];
}

export default function AppsPage() {
  return <AppsPageClient />;
}
