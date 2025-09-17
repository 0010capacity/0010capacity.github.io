import Link from 'next/link';
import { Plus, Edit, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import { getAppNames, getAppData, type Deployment } from '../../data/apps';
import { getPrivacyPoliciesForApp } from '../../data/privacy-policies';
import { Button } from '../../../components';

export async function generateStaticParams() {
  // Generate static paths based on actually existing apps
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

  // Fetch actual app data
  const appData = getAppData(decodedAppName);
  const deployments = appData?.deployments || [];
  const githubRepo = appData?.githubRepo || null;

  // Fetch actual privacy policy data
  const privacyPolicies = getPrivacyPoliciesForApp(decodedAppName);

  const getDeploymentLabel = (deployment: Deployment) => {
    if (deployment.type === 'other' && deployment.label) {
      return deployment.label;
    }
    switch (deployment.type) {
      case 'website': return 'Website';
      case 'appstore': return 'App Store';
      case 'googleplay': return 'Google Play';
      case 'steam': return 'Steam';
      case 'download': return 'Download';
      case 'other': return 'Other';
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
                Check detailed information and privacy policy for this app.
              </p>
            </div>
            <Button
              as={Link}
              href={`/edit-app?app=${encodeURIComponent(decodedAppName)}`}
              variant="warning"
              icon={Edit}
            ></Button>
          </div>
        </div>

        {/* App Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">App Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Platform</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {deployments.length > 0 ? 
                  (deployments[0].type === 'website' ? 'Web' : 
                   deployments[0].type === 'appstore' ? 'iOS' :
                   deployments[0].type === 'googleplay' ? 'Android' : 'Other') : 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Last Updated</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {appData ? new Date(appData.updatedAt).toLocaleDateString('ko-KR') : '2024-01-15'}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {appData ? appData.description : 'This app provides a great experience to users.'}
              </p>
            </div>
          </div>
        </div>

        {/* 배포 정보 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Deployment Information</h2>
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
            <p className="text-gray-600 dark:text-gray-400">No deployment information available.</p>
          )}
        </div>

        {/* GitHub 레포지토리 섹션 */}
        {githubRepo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Source Code</h2>
            <a
              href={githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="text-2xl mr-3">📂</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">GitHub Repository</h3>
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
            <h2 className="text-2xl font-semibold">Privacy Policy</h2>
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
                        {policy.language === 'ko' ? 'Korean' :
                         policy.language === 'en' ? 'English' :
                         policy.language}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last updated: {policy.lastUpdated}
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
                      <Button
                        as={Link}
                        href={`/submit-pr?app=${encodeURIComponent(decodedAppName)}&lang=${policy.language}&action=delete`}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                      ></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No privacy policies have been registered yet.
              </p>
              <Link
                href={`/submit-pr?app=${encodeURIComponent(decodedAppName)}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 inline-block"
              >
                Add First Privacy Policy
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
