"use client";

import Link from "next/link";
import GitHubCalendar from "react-github-calendar";
import { useTechStack } from "../hooks/useTechStack";

export default function Home() {
  const { techStack, loading, error } = useTechStack("0010capacity");
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <section className="text-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              이정원의 포트폴리오
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              안녕하세요! 저는 이정원입니다. 게임 개발과 AI를 좋아하는 개발자로, 여기서 제 작품과 프로젝트를 소개합니다.
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                href="/apps"
              >
                제 앱들 보기
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
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">프로필</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">이름</h3>
              <p className="text-gray-600 dark:text-gray-300">이정원 (LEE JEONG WON)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">이메일</h3>
              <p className="text-gray-600 dark:text-gray-300">0010capacity@gmail.com</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">국가</h3>
              <p className="text-gray-600 dark:text-gray-300">대한민국</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">학력</h3>
              <p className="text-gray-600 dark:text-gray-300">광운대학교 인공지능학부 졸업</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">테크 스택</h3>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">GitHub 잔디</h3>
            <div className="overflow-x-auto">
              <GitHubCalendar username="0010capacity" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
