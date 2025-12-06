"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (storedToken && storedUser) {
      router.push("/admin/dashboard/");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">로딩 중...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = (await authApi.login({
        username,
        password,
      })) as LoginResponse;

      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_user", JSON.stringify(response.user));

      router.push("/admin/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-2xl font-light mb-2">관리자 로그인</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 border border-red-900/50 text-red-400 text-sm rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm text-neutral-500 mb-2"
            >
              사용자명
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-neutral-500 mb-2"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 text-neutral-100 rounded transition-colors"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            ← 돌아가기
          </Link>
        </footer>
      </div>
    </div>
  );
}
