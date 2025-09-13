"use client";

import Link from "next/link";
import GitHubCalendar from "react-github-calendar";

export default function Home() {
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
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105"
                href="/privacy-policy"
              >
                개인정보 처리방침
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
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">기술 스택</h3>
            <div className="flex flex-wrap gap-3">
              {["Unity2D", "React", "React Native", "TypeScript", "JavaScript", "Python", "PyTorch", "Deep Learning", "Reinforcement Learning"].map((tech) => (
                <span key={tech} className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow duration-300">
                  {tech}
                </span>
              ))}
            </div>
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
