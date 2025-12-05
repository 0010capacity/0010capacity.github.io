"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { systemApi } from "@/lib/api";

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<"healthy" | "error">("error");

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await systemApi.health();
        setApiStatus("healthy");
      } catch (err) {
        setApiStatus("error");
      }
    };

    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">0010capacity</h1>
          <div className="flex gap-6 items-center">
            <Link
              href="/novels"
              className="hover:text-blue-400 transition-colors"
            >
              📚 Novels
            </Link>
            <Link
              href="/blog"
              className="hover:text-blue-400 transition-colors"
            >
              📝 Blog
            </Link>
            <Link
              href="/apps"
              className="hover:text-blue-400 transition-colors"
            >
              📱 Apps
            </Link>
            <Link
              href="/about"
              className="hover:text-blue-400 transition-colors"
            >
              👤 About
            </Link>
            <Link
              href="/admin/login"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            0010capacity
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            소설, 블로그, 앱을 한곳에서 만나는 창작자의 플랫폼
          </p>
          <p className="text-gray-500 mb-8">
            {apiStatus === "healthy" ? (
              <span className="text-green-400">✓ Backend API 정상 작동</span>
            ) : (
              <span className="text-red-400">✗ Backend API 연결 실패</span>
            )}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Link
            href="/novels"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50 text-lg"
          >
            📚 소설 탐색하기
          </Link>
          <Link
            href="/blog"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 text-lg"
          >
            📝 블로그 읽기
          </Link>
          <Link
            href="/apps"
            className="px-8 py-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-pink-500/50 text-lg"
          >
            📱 앱 보기
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center mb-16">주요 기능</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Novels Feature */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 hover:shadow-lg hover:border-blue-600 transition-all">
            <div className="text-5xl mb-4">📚</div>
            <h4 className="text-2xl font-bold mb-3">소설 플랫폼</h4>
            <p className="text-gray-400 mb-6">
              창작한 소설을 연재하고 독자들과 만나세요. 챕터별로 구성되어 편리한
              읽기 경험을 제공합니다.
            </p>
            <Link
              href="/novels"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              둘러보기 →
            </Link>
          </div>

          {/* Blog Feature */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 hover:shadow-lg hover:border-purple-600 transition-all">
            <div className="text-5xl mb-4">📝</div>
            <h4 className="text-2xl font-bold mb-3">기술 블로그</h4>
            <p className="text-gray-400 mb-6">
              개발 경험, 기술 분석, 그리고 일상의 생각들을 나누는 공간입니다.
              태그로 쉽게 원하는 글을 찾을 수 있습니다.
            </p>
            <Link
              href="/blog"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              글 읽기 →
            </Link>
          </div>

          {/* Apps Feature */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 hover:shadow-lg hover:border-pink-600 transition-all">
            <div className="text-5xl mb-4">📱</div>
            <h4 className="text-2xl font-bold mb-3">앱 마켓</h4>
            <p className="text-gray-400 mb-6">
              iOS, Android, 웹 등 다양한 플랫폼의 앱을 소개합니다. 각 앱의 상세
              정보와 다운로드 링크를 제공합니다.
            </p>
            <Link
              href="/apps"
              className="text-pink-400 hover:text-pink-300 font-medium"
            >
              앱 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-gray-800 rounded-lg border border-gray-700 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-blue-400 mb-2">∞</div>
            <p className="text-gray-400">창작물</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-purple-400 mb-2">∞</div>
            <p className="text-gray-400">기술 블로그</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-pink-400 mb-2">∞</div>
            <p className="text-gray-400">개발 프로젝트</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center mb-12">
        <h3 className="text-4xl font-bold mb-6">시작해보세요</h3>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          0010capacity와 함께 소설, 블로그, 앱의 세계로 떠나보세요.
        </p>
        <Link
          href="/novels"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/50"
        >
          지금 바로 시작하기
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">
          <p>© 2024 0010capacity. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a
              href="https://github.com/0010capacity"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="/privacy-policy"
              className="hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
