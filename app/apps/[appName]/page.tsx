import Link from 'next/link';

interface Deployment {
  type: 'website' | 'appstore' | 'googleplay' | 'steam' | 'download' | 'other';
  url: string;
  label?: string;
}

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
  const mockDeployments: Deployment[] = [
    { type: 'website', url: 'https://example.com' },
    { type: 'appstore', url: 'https://apps.apple.com/app/example' },
    { type: 'googleplay', url: 'https://play.google.com/store/apps/details?id=com.example' }
  ];

  const privacyPolicies: PrivacyPolicy[] = [
    { language: 'ko', url: `/privacy-policies/${appName}/ko.md`, lastUpdated: '2024-01-15' },
    { language: 'en', url: `/privacy-policies/${appName}/en.md`, lastUpdated: '2024-01-10' },
  ];

  const githubRepo = 'https://github.com/username/example-app'; // Mock GitHub repo

  const getDeploymentIcon = (type: string) => {
    switch (type) {
      case 'website': return '🌐';
      case 'appstore': return '📱';
      case 'googleplay': return '🤖';
      case 'steam': return '🎮';
      case 'download': return '⬇️';
      case 'other': return '🔗';
      default: return '🔗';
    }
  };

  const getDeploymentLabel = (deployment: Deployment) => {
    if (deployment.type === 'other' && deployment.label) {
      return deployment.label;
    }
    switch (deployment.type) {
      case 'website': return '웹사이트';
      case 'appstore': return 'App Store';
      case 'googleplay': return 'Google Play';
      case 'steam': return 'Steam';
      case 'download': return '다운로드';
      case 'other': return '기타';
      default: return deployment.type;
    }
  };

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">{appName}</h1>
              <p className="text-lg text-gray-600 mb-6">
                앱에 대한 자세한 정보와 개인정보 처리방침을 확인하세요.
              </p>
            </div>
            <Link
              href={`/edit-app?app=${encodeURIComponent(appName)}`}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              ✏️ 앱 정보 수정
            </Link>
          </div>
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
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">마지막 업데이트</h3>
              <p className="text-gray-600 dark:text-gray-400">2024-01-15</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">설명</h3>
              <p className="text-gray-600 dark:text-gray-400">
                이 앱은 사용자에게 훌륭한 경험을 제공합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 배포 정보 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">배포 정보</h2>
          {mockDeployments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDeployments.map((deployment, index) => (
                <a
                  key={index}
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">{getDeploymentIcon(deployment.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getDeploymentLabel(deployment)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {deployment.url}
                    </p>
                  </div>
                  <span className="ml-auto text-gray-400">→</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">배포 정보가 없습니다.</p>
          )}
        </div>

        {/* GitHub 레포지토리 섹션 */}
        {githubRepo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">소스 코드</h2>
            <a
              href={githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="text-2xl mr-3">📂</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">GitHub 레포지토리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {githubRepo}
                </p>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </a>
          </div>
        )}

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
