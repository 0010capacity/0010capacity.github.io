"use client";

import Link from "next/link";

/**
 * GitHub Pages + Next.js static export note:
 * - GitHub Pages serves only exported static files.
 * - App-level SPA-style redirect from not-found can easily create redirect loops
 *   (e.g. /some/path -> 404 -> redirect to / -> restore -> 404 -> ...).
 *
 * So we intentionally DO NOT redirect here. We just render a 404 UI with a link home.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen text-neutral-100 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-2xl font-light mb-4">404</h1>
        <p className="text-neutral-600 text-sm mb-8">
          페이지를 찾을 수 없습니다
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>

          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            onClick={() => {
              try {
                // If the SPA fallback stored something stale, clear it.
                sessionStorage.removeItem("spa-redirect");
                sessionStorage.removeItem("spa-redirect-attempted");
              } catch {
                // ignore
              }
            }}
          >
            (리다이렉트 정보 초기화)
          </Link>
        </div>
      </div>
    </div>
  );
}
