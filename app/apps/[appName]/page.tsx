import Link from 'next/link';
import { Plus, Edit, ArrowLeft, Eye } from 'lucide-react';
import { getAppNames, getAppData, type Deployment } from '../../data/apps';
import { getPrivacyPoliciesForApp } from '../../data/privacy-policies';
import { Button } from '../../../components';

export async function generateStaticParams() {
  // 실제 존재하는 앱들을 기반으로 정적 경로 생성
  const appNames = getAppNames();
  return appNames.map(appName => ({
    appName: encodeURIComponent(appName)
  }));
}

interface AppDetailPageProps {
  params: Promise<{
    appName: string;
  }>;
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { appName } = await params;
  const decodedAppName = decodeURIComponent(appName);

  // 실제 앱 데이터 가져오기
  const appData = getAppData(decodedAppName);
  const deployments = appData?.deployments || [];
  const githubRepo = appData?.githubRepo || null;

  // 실제 개인정보 처리방침 데이터 가져오기
  const privacyPolicies = getPrivacyPoliciesForApp(decodedAppName);

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
          <Button
            as={Link}
            href="/apps"
            variant="outline"
            className="mb-4"
            icon={ArrowLeft}
          ></Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">{decodedAppName}</h1>
              <p className="text-lg text-gray-600 mb-6">
                앱에 대한 자세한 정보와 개인정보 처리방침을 확인하세요.
              </p>
            </div>
            <Link
              href={`/edit-app?app=${encodeURIComponent(decodedAppName)}`}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              앱 정보 수정
            </Link>
          </div>
        </div>

        {/* 앱 정보 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">앱 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">플랫폼</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {deployments.length > 0 ? 
                  (deployments[0].type === 'website' ? '웹' : 
                   deployments[0].type === 'appstore' ? 'iOS' :
                   deployments[0].type === 'googleplay' ? 'Android' : '기타') : '알 수 없음'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">마지막 업데이트</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {appData ? new Date(appData.updatedAt).toLocaleDateString('ko-KR') : '2024-01-15'}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">설명</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {appData ? appData.description : '이 앱은 사용자에게 훌륭한 경험을 제공합니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 배포 정보 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">배포 정보</h2>
          {deployments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deployments.map((deployment, index) => (
                <a
                  key={index}
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">
                    {deployment.type === 'website' ? '🌐' :
                     deployment.type === 'appstore' ? '📱' :
                     deployment.type === 'googleplay' ? '🤖' :
                     deployment.type === 'steam' ? '🎮' :
                     deployment.type === 'download' ? '⬇️' : '🔗'}
                  </span>
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
            <Button
              as={Link}
              href={`/submit-pr?app=${encodeURIComponent(decodedAppName)}`}
              variant="primary"
              size="sm"
              icon={Plus}
            ></Button>
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
                      <Button
                        as="a"
                        href={policy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="success"
                        size="sm"
                        icon={Eye}
                      ></Button>
                      <Button
                        as={Link}
                        href={`/submit-pr?app=${encodeURIComponent(decodedAppName)}&lang=${policy.language}`}
                        variant="warning"
                        size="sm"
                        icon={Edit}
                      ></Button>
                      <Link
                        href={`/submit-pr?app=${encodeURIComponent(decodedAppName)}&lang=${policy.language}&action=delete`}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        삭제
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
                href={`/submit-pr?app=${encodeURIComponent(decodedAppName)}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 inline-block"
              >
                첫 번째 개인정보 처리방침 추가하기
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Button
            as={Link}
            href="/apps"
            variant="secondary"
            icon={ArrowLeft}
          ></Button>
        </div>
      </main>
    </div>
  );
}
