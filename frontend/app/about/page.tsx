import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen text-neutral-100 flex flex-col items-center justify-center px-6">
      {/* 명함 카드 */}
      <div className="w-full max-w-md">
        {/* 이름 */}
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-medium tracking-tight mb-2">이정원</h1>
          <p className="text-neutral-500 text-sm">LEE JEONG WON</p>
        </div>

        {/* 정보 */}
        <div className="space-y-6 mb-12">
          <div className="flex justify-between items-center py-3 border-b border-neutral-800">
            <span className="text-neutral-500 text-sm">이메일</span>
            <a
              href="mailto:0010capacity@gmail.com"
              className="text-neutral-300 hover:text-white text-sm transition-colors"
            >
              0010capacity@gmail.com
            </a>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-neutral-800">
            <span className="text-neutral-500 text-sm">GitHub</span>
            <a
              href="https://github.com/0010capacity"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-white text-sm transition-colors"
            >
              @0010capacity
            </a>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-neutral-800">
            <span className="text-neutral-500 text-sm">학교</span>
            <span className="text-neutral-300 text-sm text-right">
              광운대학교 인공지능학과
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-neutral-800">
            <span className="text-neutral-500 text-sm">위치</span>
            <span className="text-neutral-300 text-sm">대한민국</span>
          </div>
        </div>

        {/* 한 줄 소개 */}
        <div className="text-center mb-12">
          <p className="text-neutral-400 text-sm italic">
            &ldquo;뭐든 만듭니다.&rdquo;
          </p>
        </div>

        {/* 기술 스택 */}
        <div className="mb-12">
          <p className="text-neutral-600 text-xs uppercase tracking-widest mb-4 text-center">
            Skills
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "TypeScript",
              "C#",
              "ASP.NET",
              "JavaScript",
              "Java",
              "Kotlin",
              "Swift",
              "iOS",
              "Android",
              "Web",
            ].map(skill => (
              <span
                key={skill}
                className="px-3 py-1 text-xs text-neutral-500 border border-neutral-800 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 돌아가기 */}
      <footer className="mt-8">
        <Link
          href="/"
          className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ← 돌아가기
        </Link>
      </footer>
    </div>
  );
}
