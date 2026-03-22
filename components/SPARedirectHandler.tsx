"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SPARedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if we were redirected from 404.html
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const isRedirect = searchParams.get("spa-redirect");

    if (isRedirect) {
      // Get the stored redirect info
      const redirectData = sessionStorage.getItem("spa-redirect");
      if (redirectData) {
        try {
          const { path, search, hash } = JSON.parse(redirectData);
          sessionStorage.removeItem("spa-redirect");
          sessionStorage.removeItem("spa-redirect-attempted");

          // Normalize to the exported trailing-slash URL form on GitHub Pages.
          // Next.js static export with `trailingSlash: true` serves "/x/" as "/x/index.html".
          // Accessing "/x" may 404 on GitHub Pages (no directory index for that path),
          // which can trigger the SPA fallback repeatedly.
          let cleanPath: string = typeof path === "string" ? path : "/";

          if (cleanPath === "") cleanPath = "/";
          if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

          // If it's not root, ensure trailing slash.
          if (cleanPath !== "/" && !cleanPath.endsWith("/")) {
            cleanPath = cleanPath + "/";
          }

          // Clean up the URL (remove spa-redirect param)
          const cleanUrl = cleanPath + (search || "") + (hash || "");
          router.replace(cleanUrl);
        } catch (e) {
          console.error("Failed to parse redirect data:", e);
          sessionStorage.removeItem("spa-redirect");
          sessionStorage.removeItem("spa-redirect-attempted");
          // Remove the query param from current URL
          window.history.replaceState({}, "", "/");
        }
      } else {
        // No redirect data, just clean up the URL
        sessionStorage.removeItem("spa-redirect-attempted");
        window.history.replaceState({}, "", "/");
      }
    }
  }, [router]);

  return null;
}
