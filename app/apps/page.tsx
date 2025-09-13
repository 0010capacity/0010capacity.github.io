import Link from "next/link";

export default function Apps() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold">내 앱들</h1>
        <p className="text-lg text-center">
          제가 개발한 iOS, Android, 웹 앱들을 소개합니다. 각 앱을 다운로드하거나 사용해 보세요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for app items */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold">앱 1</h2>
            <p>앱 1의 설명입니다.</p>
            <Link href="#" className="text-blue-500">다운로드</Link>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold">앱 2</h2>
            <p>앱 2의 설명입니다.</p>
            <Link href="#" className="text-blue-500">다운로드</Link>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold">앱 3</h2>
            <p>앱 3의 설명입니다.</p>
            <Link href="#" className="text-blue-500">다운로드</Link>
          </div>
        </div>
        <Link
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          href="/"
        >
          홈으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
