'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { updateAppPR } from '../../lib/github';

interface Deployment {
  type: 'website' | 'appstore' | 'googleplay' | 'steam' | 'download' | 'other';
  url: string;
  label?: string;
}

interface AppData {
  name: string;
  description: string;
  platform: string;
  deployments: Deployment[];
  githubRepo?: string;
  createdAt: string;
  updatedAt: string;
}

function EditAppForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('web');
  const [deployments, setDeployments] = useState<Deployment[]>([{ type: 'website', url: '' }]);
  const [githubRepo, setGithubRepo] = useState('');
  const [showGithubField, setShowGithubField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [prUrl, setPrUrl] = useState('');
  const [error, setError] = useState('');
  const [rememberToken, setRememberToken] = useState(false);

  // Load saved token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setToken(savedToken);
      setRememberToken(true);
    }
  }, []);

  // Save or remove token based on remember preference
  useEffect(() => {
    if (rememberToken && token) {
      localStorage.setItem('github_token', token);
    } else if (!rememberToken) {
      localStorage.removeItem('github_token');
    }
  }, [token, rememberToken]);

  // Load app data from URL parameter
  useEffect(() => {
    const loadAppData = async () => {
      const appParam = searchParams.get('app');
      if (!appParam) {
        setError('앱 이름이 지정되지 않았습니다.');
        setIsLoadingApp(false);
        return;
      }

      const decodedAppName = decodeURIComponent(appParam);
      setAppName(decodedAppName);

      try {
        // 실제로는 GitHub API나 파일 시스템에서 앱 데이터를 불러와야 함
        // 현재는 mock 데이터 사용
        const mockAppData: AppData = {
          name: decodedAppName,
          description: '이 앱은 사용자에게 훌륭한 경험을 제공합니다.',
          platform: 'web',
          deployments: [
            { type: 'website', url: 'https://example.com' }
          ],
          githubRepo: 'https://github.com/username/repo',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        };

        setDescription(mockAppData.description);
        setPlatform(mockAppData.platform);
        setDeployments(mockAppData.deployments.length > 0 ? mockAppData.deployments : [{ type: 'website', url: '' }]);
        if (mockAppData.githubRepo) {
          setGithubRepo(mockAppData.githubRepo);
          setShowGithubField(true);
        }
      } catch (err) {
        setError('앱 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingApp(false);
      }
    };

    loadAppData();
  }, [searchParams]);

  const addDeployment = () => {
    setDeployments([...deployments, { type: 'website', url: '' }]);
  };

  const removeDeployment = (index: number) => {
    if (deployments.length > 1) {
      setDeployments(deployments.filter((_, i) => i !== index));
    }
  };

  const updateDeployment = (index: number, field: keyof Deployment, value: string) => {
    const updated = deployments.map((deployment, i) =>
      i === index ? { ...deployment, [field]: value } : deployment
    );
    setDeployments(updated);
  };

  const getDeploymentTypeLabel = (type: string) => {
    switch (type) {
      case 'website': return '웹사이트';
      case 'appstore': return 'App Store';
      case 'googleplay': return 'Google Play';
      case 'steam': return 'Steam';
      case 'download': return '다운로드';
      case 'other': return '기타';
      default: return type;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPrUrl('');

    // Validate deployments
    const validDeployments = deployments.filter(d => d.url.trim() !== '');
    if (validDeployments.length === 0) {
      setError('최소 하나의 배포 URL을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const url = await updateAppPR(
        token,
        appName,
        description,
        platform,
        validDeployments,
        showGithubField ? githubRepo : undefined
      );
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingApp) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">앱 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href={`/apps/${encodeURIComponent(appName)}`}
          className="text-blue-500 hover:text-blue-700 mb-4 inline-block"
        >
          ← 앱 상세로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold">앱 수정: {appName}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GitHub Token */}
        <div>
          <label htmlFor="token" className="block text-sm font-medium mb-1">
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="ghp_..."
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="rememberToken"
              checked={rememberToken}
              onChange={(e) => setRememberToken(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberToken" className="text-sm text-gray-600">
              토큰 기억하기 (브라우저에 저장)
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            repo 권한이 있는 토큰을 입력하세요.
          </p>
        </div>

        {/* 앱 이름 (읽기 전용) */}
        <div>
          <label htmlFor="appName" className="block text-sm font-medium mb-1">
            앱 이름
          </label>
          <input
            type="text"
            id="appName"
            value={appName}
            className="w-full p-2 border rounded bg-gray-100"
            readOnly
          />
          <p className="text-sm text-gray-600 mt-1">
            앱 이름은 수정할 수 없습니다.
          </p>
        </div>

        {/* 플랫폼 */}
        <div>
          <label htmlFor="platform" className="block text-sm font-medium mb-1">
            플랫폼
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="web">웹</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="desktop">데스크톱</option>
            <option value="mobile">모바일</option>
            <option value="other">기타</option>
          </select>
        </div>

        {/* 앱 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            앱 설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded h-24"
            required
            placeholder="앱에 대한 자세한 설명을 입력하세요..."
          />
        </div>

        {/* 배포 정보 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">배포 정보</label>
            <button
              type="button"
              onClick={addDeployment}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + 배포 추가
            </button>
          </div>

          <div className="space-y-3">
            {deployments.map((deployment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-gray-700">배포 {index + 1}</h4>
                  {deployments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeployment(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      배포 유형
                    </label>
                    <select
                      value={deployment.type}
                      onChange={(e) => updateDeployment(index, 'type', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="website">웹사이트</option>
                      <option value="appstore">App Store</option>
                      <option value="googleplay">Google Play</option>
                      <option value="steam">Steam</option>
                      <option value="download">다운로드</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={deployment.url}
                      onChange={(e) => updateDeployment(index, 'url', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>

                {deployment.type === 'other' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      사용자 정의 라벨 (선택사항)
                    </label>
                    <input
                      type="text"
                      value={deployment.label || ''}
                      onChange={(e) => updateDeployment(index, 'label', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="예: Microsoft Store, Itch.io 등"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GitHub 레포지토리 */}
        <div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="showGithubField"
              checked={showGithubField}
              onChange={(e) => setShowGithubField(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showGithubField" className="text-sm font-medium">
              GitHub 레포지토리 추가
            </label>
          </div>

          {showGithubField && (
            <div>
              <label htmlFor="githubRepo" className="block text-sm font-medium mb-1">
                GitHub 레포지토리 URL
              </label>
              <input
                type="url"
                id="githubRepo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://github.com/username/repo"
              />
              <p className="text-sm text-gray-600 mt-1">
                앱의 소스 코드가 있는 GitHub 레포지토리 URL을 입력하세요.
              </p>
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
        >
          {isLoading ? '수정 중...' : '앱 정보 수정'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {prUrl && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          앱 정보가 성공적으로 수정되었습니다!{' '}
          <a href={prUrl} target="_blank" rel="noopener noreferrer" className="underline">
            PR 보기
          </a>
        </div>
      )}
    </div>
  );
}

export default function EditAppPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6">로딩 중...</div>}>
      <EditAppForm />
    </Suspense>
  );
}
