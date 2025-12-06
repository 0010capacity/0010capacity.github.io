import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen text-neutral-100 flex flex-col relative">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 인사 */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-light mb-4 text-neutral-200">
            안녕하세요
          </h1>
          <p className="text-lg text-neutral-500">
            이정원의 공간에 오신 것을 환영합니다
          </p>
        </div>

        {/* 3가지 선택지 */}
        <nav className="flex flex-col md:flex-row gap-6 md:gap-12">
          <Link
            href="/novels"
            className="group flex flex-col items-center p-8 rounded-2xl border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 transition-all duration-300"
          >
            <span className="text-lg font-medium text-neutral-300 group-hover:text-white transition-colors">
              소설
            </span>
            <span className="text-sm text-neutral-600 mt-2">읽으러 가기</span>
          </Link>

          <Link
            href="/blog"
            className="group flex flex-col items-center p-8 rounded-2xl border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 transition-all duration-300"
          >
            <span className="text-lg font-medium text-neutral-300 group-hover:text-white transition-colors">
              블로그
            </span>
            <span className="text-sm text-neutral-600 mt-2">보러 가기</span>
          </Link>

          <Link
            href="/apps"
            className="group flex flex-col items-center p-8 rounded-2xl border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 transition-all duration-300"
          >
            <span className="text-lg font-medium text-neutral-300 group-hover:text-white transition-colors">
              앱
            </span>
            <span className="text-sm text-neutral-600 mt-2">구경하기</span>
          </Link>
        </nav>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center flex justify-center gap-4">
        <Link
          href="/about"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          이정원에 대해
        </Link>
        <span className="text-neutral-800">·</span>
        <Link
          href="/admin/login"
          className="text-sm text-neutral-800 hover:text-neutral-600 transition-colors"
        >
          관리
        </Link>
      </footer>
    </div>
  );
}
