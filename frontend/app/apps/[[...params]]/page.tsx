import { Suspense } from "react";
import AppsPageClient from "./client";

// Required for static export
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ params: [] }];
}

export default function AppsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-neutral-100 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      }
    >
      <AppsPageClient />
    </Suspense>
  );
}
