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
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
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
              <Link
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                href="/submit-pr"
              >
                개인정보 처리방침 업로드
              </Link>
            </div>
          </div>
        </section>

        {/* Profile Section */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">프로필</h2>
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
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">GitHub 활동</h3>
            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
              <GitHubCalendar username="0010capacity" colorScheme="dark" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
