"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // SPA redirect: store current path and redirect to root
    // The main app's SPARedirectHandler will restore the route
    const currentPath = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;

    // Only redirect if we're not already at root
    if (currentPath !== "/" && currentPath !== "") {
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

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
      <p className="text-neutral-600 text-sm">불러오는 중...</p>
    </div>
  );
}
