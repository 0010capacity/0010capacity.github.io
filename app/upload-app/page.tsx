'use client';

import { useState, useEffect } from 'react';
import { createAppPR } from '../../lib/github';

export default function UploadAppPage() {
  const [token, setToken] = useState('');
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [platform, setPlatform] = useState('web');
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
      const url = await createAppPR(token, appName, description, downloadUrl, platform);
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">앱 업로드</h1>

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
            placeholder="My Awesome App"
          />
        </div>

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
            <option value="other">기타</option>
          </select>
        </div>

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

        <div>
          <label htmlFor="downloadUrl" className="block text-sm font-medium mb-1">
            다운로드 URL
          </label>
          <input
            type="url"
            id="downloadUrl"
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            className="w-full p-2 border rounded"
            required
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '업로드 중...' : '앱 업로드'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {prUrl && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          앱이 성공적으로 업로드되었습니다!{' '}
          <a href={prUrl} target="_blank" rel="noopener noreferrer" className="underline">
            PR 보기
          </a>
        </div>
      )}
    </div>
  );
}
