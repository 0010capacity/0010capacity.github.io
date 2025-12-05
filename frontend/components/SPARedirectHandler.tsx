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

          // Ensure trailing slash for consistency with Next.js config
          let cleanPath = path;
          if (!cleanPath.endsWith("/")) {
            cleanPath = cleanPath + "/";
          }

          // Clean up the URL (remove spa-redirect param)
          const cleanUrl = cleanPath + (search || "") + (hash || "");
          router.replace(cleanUrl);
        } catch (e) {
          console.error("Failed to parse redirect data:", e);
          sessionStorage.removeItem("spa-redirect");
          // Remove the query param from current URL
          window.history.replaceState({}, "", "/");
        }
      } else {
        // No redirect data, just clean up the URL
        window.history.replaceState({}, "", "/");
      }
    }
  }, [router]);

  return null;
}
