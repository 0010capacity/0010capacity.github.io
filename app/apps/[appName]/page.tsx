import Link from 'next/link';

interface PrivacyPolicy {
  language: string;
  url: string;
  lastUpdated: string;
}

export async function generateStaticParams() {
  // 실제 앱 목록을 기반으로 정적 경로 생성
  // 현재는 샘플 앱들로 설정
  return [
    { appName: 'app1' },
    { appName: 'app2' },
    { appName: 'app3' },
  ];
}

interface AppDetailPageProps {
  params: {
    appName: string;
  };
}

export default function AppDetailPage({ params }: AppDetailPageProps) {
  const appName = decodeURIComponent(params.appName);

  // Mock data - 실제로는 API나 파일 시스템에서 불러와야 함
  const privacyPolicies: PrivacyPolicy[] = [
    { language: 'ko', url: `/privacy-policies/${appName}/ko.md`, lastUpdated: '2024-01-15' },
    { language: 'en', url: `/privacy-policies/${appName}/en.md`, lastUpdated: '2024-01-10' },
  ];

  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/apps"
            className="text-blue-500 hover:text-blue-700 mb-4 inline-block"
          >
            ← 앱 목록으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold mb-4">{appName}</h1>
          <p className="text-lg text-gray-600 mb-6">
            앱에 대한 자세한 정보와 개인정보 처리방침을 확인하세요.
          </p>
        </div>

        {/* 앱 정보 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">앱 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">플랫폼</h3>
              <p className="text-gray-600 dark:text-gray-400">웹</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">다운로드</h3>
              <a href="#" className="text-blue-500 hover:text-blue-700">다운로드 링크</a>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">설명</h3>
              <p className="text-gray-600 dark:text-gray-400">
                이 앱은 사용자에게 훌륭한 경험을 제공합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 개인정보 처리방침 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">개인정보 처리방침</h2>
            <Link
              href={`/submit-pr?app=${encodeURIComponent(appName)}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              + 개인정보 처리방침 추가
            </Link>
          </div>

          {privacyPolicies.length > 0 ? (
            <div className="space-y-4">
              {privacyPolicies.map((policy) => (
                <div key={policy.language} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {policy.language === 'ko' ? '한국어' :
                         policy.language === 'en' ? 'English' :
                         policy.language}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        마지막 업데이트: {policy.lastUpdated}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={policy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        보기
                      </a>
                      <Link
                        href={`/submit-pr?app=${encodeURIComponent(appName)}&lang=${policy.language}`}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        수정
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                아직 등록된 개인정보 처리방침이 없습니다.
              </p>
              <Link
                href={`/submit-pr?app=${encodeURIComponent(appName)}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 inline-block"
              >
                첫 번째 개인정보 처리방침 추가하기
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/apps"
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            앱 목록으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
