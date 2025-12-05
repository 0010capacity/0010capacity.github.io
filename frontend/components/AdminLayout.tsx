"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  backHref?: string;
  backLabel?: string;
}

export default function AdminLayout({
  children,
  title,
  backHref = "/admin/dashboard",
  backLabel = "← 대시보드",
}: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken || !storedUser) {
      router.push("/admin/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={backHref}
              className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              {backLabel}
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-500">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-light">{title}</h1>
        </header>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
