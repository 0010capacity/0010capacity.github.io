"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Check if we've already attempted a redirect to prevent infinite loops
    const hasRedirected = sessionStorage.getItem("spa-redirect-attempted");

    if (hasRedirected) {
      // Already tried redirecting, don't do it again
      sessionStorage.removeItem("spa-redirect-attempted");
      return;
    }

    // SPA redirect: store current path and redirect to root
    // The main app's SPARedirectHandler will restore the route
    const currentPath = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;

    // Only redirect if we're not already at root
    if (currentPath !== "/" && currentPath !== "") {
      // Mark that we've attempted a redirect
      sessionStorage.setItem("spa-redirect-attempted", "true");

      sessionStorage.setItem(
        "spa-redirect",
        JSON.stringify({
          path: currentPath,
          search: search,
          hash: hash,
        })
      );

      // Redirect to root with spa-redirect flag
      router.replace("/?spa-redirect=true");
    }
  }, [router]);

  // Show 404 page after a brief moment (if redirect didn't happen)
  return (
    <div className="min-h-screen text-neutral-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-light mb-4">404</h1>
        <p className="text-neutral-600 text-sm mb-8">
          페이지를 찾을 수 없습니다
        </p>
        <Link
          href="/"
          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
