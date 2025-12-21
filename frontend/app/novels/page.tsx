import type { Metadata } from "next";
import { Suspense } from "react";
import NovelsPageClient from "./client";

export const metadata: Metadata = {
  title: "소설 | 이정원",
  description: "창작 소설 모음",
  openGraph: {
    title: "소설 | 이정원",
    description: "창작 소설 모음",
    url: "https://0010capacity.github.io/novels/",
    type: "website",
  },
};

export default function NovelsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen text-neutral-100 flex items-center justify-center">
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      }
    >
      <NovelsPageClient />
    </Suspense>
  );
}
