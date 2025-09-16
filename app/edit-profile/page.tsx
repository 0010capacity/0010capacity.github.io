'use client';

import { useState, useEffect } from 'react';
import { createProfilePR } from '../../lib/github';

export default function EditProfilePage() {
  const [token, setToken] = useState('');
  const [profileData, setProfileData] = useState({
    name: 'LEE JEONG WON',
    email: '0010capacity@gmail.com',
    country: '대한민국',
    education: '광운대학교 인공지능학부 졸업',
    bio: '게임 개발과 AI를 사랑하는 개발자입니다.'
  });
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
      const url = await createProfilePR(token, profileData);
      setPrUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">프로필 편집</h1>

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
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            이름
          </label>
          <input
            type="text"
            id="name"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            국가
          </label>
          <input
            type="text"
            id="country"
            value={profileData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-medium mb-1">
            학력
          </label>
          <input
            type="text"
            id="education"
            value={profileData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            자기소개
          </label>
          <textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full p-2 border rounded h-24"
            required
            placeholder="자기소개를 입력하세요..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : '프로필 업데이트'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {prUrl && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          프로필이 성공적으로 업데이트되었습니다!{' '}
          <a href={prUrl} target="_blank" rel="noopener noreferrer" className="underline">
            PR 보기
          </a>
        </div>
      )}
    </div>
  );
}
