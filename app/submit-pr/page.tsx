'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, ExternalLink } from 'lucide-react';
import { createPrivacyPolicyPR } from '../../lib/github';
import { Button } from '../../components';

function SubmitPRForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [appName, setAppName] = useState('');
  const [language, setLanguage] = useState('ko');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Load URL parameters
  useEffect(() => {
    const appParam = searchParams.get('app');
    const langParam = searchParams.get('lang');

    if (appParam) {
      setAppName(decodeURIComponent(appParam));
    }
    if (langParam) {
      setLanguage(langParam);
    }
  }, [searchParams]);

  // Save or remove token based on remember preference
  useEffect(() => {
    if (rememberToken && token) {
      localStorage.setItem('github_token', token);
    } else if (!rememberToken) {
      localStorage.removeItem('github_token');
    }
  }, [token, rememberToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPrUrl('');

    try {
      const url = await createPrivacyPolicyPR(token, appName, language, content);
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침 PR 제출</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label htmlFor="appName" className="block text-sm font-medium mb-1">
            앱 이름
          </label>
          <input
            type="text"
            id="appName"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="MyApp"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            언어
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="ko">한국어 (ko)</option>
            <option value="en">영어 (en)</option>
            <option value="ja">일본어 (ja)</option>
            <option value="zh">중국어 (zh)</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            개인정보 처리방침 내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-64"
            required
            placeholder="개인정보 처리방침 내용을 입력하세요..."
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="secondary"
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            icon={Send}
          >
            {isLoading ? 'PR 생성 중...' : ''}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {prUrl && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          PR이 성공적으로 생성되었습니다!{' '}
          <Button
            as="a"
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            icon={ExternalLink}
          ></Button>
        </div>
      )}
    </div>
  );
}

export default function SubmitPRPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6">로딩 중...</div>}>
      <SubmitPRForm />
    </Suspense>
  );
}
