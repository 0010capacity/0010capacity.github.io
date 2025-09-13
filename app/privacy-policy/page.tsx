import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="font-sans min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">개인정보 처리방침</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          아래에서 각 앱의 개인정보 처리방침을 확인하세요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/privacy-policy/app1" className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">앱 1</h2>
            <p className="text-gray-300">앱 1의 개인정보 처리방침을 확인하세요.</p>
          </Link>
          <Link href="/privacy-policy/app2" className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">앱 2</h2>
            <p className="text-gray-300">앱 2의 개인정보 처리방침을 확인하세요.</p>
          </Link>
          {/* Add more apps as needed */}
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
