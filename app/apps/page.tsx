import Link from "next/link";

export default function Apps() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">내 앱들</h1>
          <p className="text-lg text-center mb-6">
            제가 개발한 iOS, Android, 웹 앱들을 소개합니다. 각 앱을 다운로드하거나 사용해 보세요.
          </p>
          <Link
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md mb-8"
            href="/upload-app"
          >
            + 새 앱 업로드
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for app items */}
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">앱 1</h2>
            <p className="text-gray-600 mb-4">앱 1의 설명입니다.</p>
            <div className="flex gap-2 mb-4">
              <Link href="#" className="text-blue-500 hover:text-blue-700">다운로드</Link>
              <Link href="/apps/app1" className="text-green-500 hover:text-green-700">자세히 보기</Link>
            </div>
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">웹</span>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">앱 2</h2>
            <p className="text-gray-600 mb-4">앱 2의 설명입니다.</p>
            <div className="flex gap-2 mb-4">
              <Link href="#" className="text-blue-500 hover:text-blue-700">다운로드</Link>
              <Link href="/apps/app2" className="text-green-500 hover:text-green-700">자세히 보기</Link>
            </div>
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">iOS</span>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">앱 3</h2>
            <p className="text-gray-600 mb-4">앱 3의 설명입니다.</p>
            <div className="flex gap-2 mb-4">
              <Link href="#" className="text-blue-500 hover:text-blue-700">다운로드</Link>
              <Link href="/apps/app3" className="text-green-500 hover:text-green-700">자세히 보기</Link>
            </div>
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">Android</span>
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
