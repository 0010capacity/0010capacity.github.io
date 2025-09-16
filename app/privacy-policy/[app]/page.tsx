import Link from "next/link";

export function generateStaticParams() {
  return [
    { app: 'app1' },
    { app: 'app2' },
    // Add more apps as needed
  ];
}

export default async function AppPrivacyPolicy({ params }: { params: Promise<{ app: string }> }) {
  const { app } = await params;

  return (
    <div className="font-sans min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">{app} 개인정보 처리방침</h1>
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-400 mb-4">수집하는 정보</h2>
          <p className="text-gray-300 mb-6">
            {app} 앱은 서비스 제공을 위해 귀하의 이름, 이메일 주소, 사용 데이터를 수집할 수 있습니다.
          </p>
          <h2 className="text-2xl font-semibold text-gray-400 mb-4">정보 사용 방법</h2>
          <p className="text-gray-300 mb-6">
            귀하의 정보는 서비스 개선, 귀하와의 소통, 법적 의무 준수를 위해 사용됩니다.
          </p>
          <h2 className="text-2xl font-semibold text-gray-400 mb-4">문의하기</h2>
          <p className="text-gray-300">
            이 개인정보 처리방침에 대한 질문이 있으시면 0010capacity@gmail.com로 연락해 주세요.
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/privacy-policy" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mr-4">
            목록으로 돌아가기
          </Link>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
