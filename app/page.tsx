"use client";

import Link from "next/link";
import GitHubCalendar from "react-github-calendar";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold">내 개인 홈페이지에 오신 것을 환영합니다</h1>
        <p className="text-lg text-center">
          안녕하세요, [귀하의 이름]입니다. 이곳은 제 개인 웹사이트로, 포트폴리오를 소개하고 앱들의 개인정보 처리방침을 제공합니다.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/apps"
          >
            내 앱들 보기
          </Link>
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/privacy-policy"
          >
            개인정보 처리방침
          </Link>
        </div>
        <section className="mt-12 w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">프로필</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold">이름</h3>
              <p>이정원 (LEE JEONG WON)</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">이메일</h3>
              <p>0010capacity@gmail.com</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">국가</h3>
              <p>대한민국</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">학력</h3>
              <p>광운대학교 인공지능학부 졸업</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold">테크 스택</h3>
            <ul className="list-disc list-inside">
              <li>Unity2D</li>
              <li>React</li>
              <li>React Native</li>
              <li>TypeScript</li>
              <li>JavaScript</li>
              <li>Python</li>
              <li>PyTorch</li>
              <li>Deep Learning (DL)</li>
              <li>Reinforcement Learning (RL)</li>
            </ul>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold">GitHub 잔디</h3>
            <GitHubCalendar username="0010capacity" />
          </div>
        </section>
      </main>
    </div>
  );
}
