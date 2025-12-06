"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken || !storedUser) {
      router.push("/admin/login/");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login/");
  };

  if (!user) {
    return (
      <div className="min-h-screen text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-16">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 메인으로
          </Link>
          <div className="flex justify-between items-center mt-8">
            <div>
              <h1 className="text-2xl font-light mb-2">관리자</h1>
              <p className="text-neutral-500 text-sm">{user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* Menu */}
        <nav className="space-y-4">
          <Link
            href="/admin/novels"
            className="group flex items-center justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
          >
            <span className="text-neutral-300 group-hover:text-white transition-colors">
              소설 관리
            </span>
            <span className="text-neutral-700 text-sm">→</span>
          </Link>

          <Link
            href="/admin/blog"
            className="group flex items-center justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
          >
            <span className="text-neutral-300 group-hover:text-white transition-colors">
              블로그 관리
            </span>
            <span className="text-neutral-700 text-sm">→</span>
          </Link>

          <Link
            href="/admin/apps"
            className="group flex items-center justify-between py-4 border-b border-neutral-900 hover:border-neutral-700 transition-colors"
          >
            <span className="text-neutral-300 group-hover:text-white transition-colors">
              앱 관리
            </span>
            <span className="text-neutral-700 text-sm">→</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
