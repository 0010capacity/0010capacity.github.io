"use client";

import Link from "next/link";
import GitHubCalendar from "react-github-calendar";
import { useTechStack } from "../hooks/useTechStack";

export default function Home() {
  const { techStack, loading, error } = useTechStack("0010capacity");
  return (
    <div className="font-sans min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <section className="text-center mb-12">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
            <h1 className="text-6xl font-bold mb-4 text-white">
              LEE JEONG WON
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              게임 개발과 AI를 사랑하는 개발자입니다.
            </p>
            
            {/* GitHub Link */}
            <div className="mb-6">
              <a
                href="https://github.com/0010capacity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub 방문하기
              </a>
            </div>
            
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                href="/edit-profile"
              >
                👤 프로필 편집
              </Link>
              <Link
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105"
                href="/apps"
              >
                제 작품들 보기
              </Link>
              <Link
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                href="/tech-stack-analysis"
              >
                기술 스택 분석기
              </Link>
              <Link
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                href="/privacy-policy"
              >
                개인정보 처리방침
              </Link>
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-white">프로필</h2>
            <Link
              href="/edit-profile"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md flex items-center gap-2"
            >
              ✏️ 프로필 편집
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">이름</h3>
              <p className="text-gray-300">이정원 (LEE JEONG WON)</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">이메일</h3>
              <p className="text-gray-300">0010capacity@gmail.com</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">국가</h3>
              <p className="text-gray-300">대한민국</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">학력</h3>
              <p className="text-gray-300">광운대학교 인공지능학부 졸업</p>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">GitHub</h3>
              <a
                href="https://github.com/0010capacity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                @0010capacity
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">테크 스택</h3>
              <Link
                href="/edit-profile"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md text-sm flex items-center gap-2"
              >
                ✏️ 편집
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-300">GitHub 저장소 분석 중...</span>
              </div>
            ) : error ? (
              <div className="text-amber-600 dark:text-amber-400 text-sm mb-2">
                GitHub API 오류: {error}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
            {!loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * GitHub 저장소 분석을 통해 자동 감지된 기술 스택
              </p>
            )}
          </div>

          {/* GitHub Calendar */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">GitHub 기여도</h3>
            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
              <GitHubCalendar username="0010capacity" colorScheme="dark" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
