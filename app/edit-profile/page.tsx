'use client';

import { useState, useEffect } from 'react';
import { createProfilePR } from '../../lib/github';
import { GitHubAnalyzer } from '../../lib/github';

export default function EditProfilePage() {
  const [token, setToken] = useState('');
  const [profileData, setProfileData] = useState({
    name: 'LEE JEONG WON',
    email: '0010capacity@gmail.com',
    country: '대한민국',
    education: '광운대학교 인공지능학부 졸업',
    bio: '게임 개발과 AI를 사랑하는 개발자입니다.',
    techStack: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prUrl, setPrUrl] = useState('');
  const [error, setError] = useState('');
  const [newTech, setNewTech] = useState('');
  const [showTechStackEditor, setShowTechStackEditor] = useState(false);
  const [detectedTechStack, setDetectedTechStack] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
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

  const addTechStack = (tech: string) => {
    if (tech.trim() && !profileData.techStack.includes(tech.trim())) {
      setProfileData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech.trim()]
      }));
    }
    setNewTech('');
  };

  const removeTechStack = (tech: string) => {
    setProfileData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const detectTechStack = async () => {
    if (!token) {
      alert('GitHub 토큰을 입력해주세요.');
      return;
    }

    setIsDetecting(true);
    try {
      const analyzer = new GitHubAnalyzer('0010capacity', token);
      const techStack = await analyzer.analyzeTechStack();
      const formattedTechStack = analyzer.getFormattedTechStack(techStack);
      setDetectedTechStack(formattedTechStack);
      setShowTechStackEditor(true);
    } catch (error) {
      alert('테크 스택 감지에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setIsDetecting(false);
    }
  };

  const addDetectedTech = (tech: string) => {
    if (!profileData.techStack.includes(tech)) {
      setProfileData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
  };

  const addAllDetectedTech = () => {
    const newTechs = detectedTechStack.filter(tech => !profileData.techStack.includes(tech));
    setProfileData(prev => ({
      ...prev,
      techStack: [...prev.techStack, ...newTechs]
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

        {/* 테크 스택 섹션 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">기술 스택</label>
            <button
              type="button"
              onClick={detectTechStack}
              disabled={isDetecting || !token}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isDetecting ? '감지 중...' : '🔍 GitHub에서 자동 감지'}
            </button>
          </div>

          {/* 현재 테크 스택 */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {profileData.techStack.map((tech) => (
                <span key={tech} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechStack(tech)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {profileData.techStack.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">등록된 기술 스택이 없습니다.</p>
            )}
          </div>

          {/* 수동 추가 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack(newTech))}
              className="flex-1 p-2 border rounded text-sm"
              placeholder="기술 스택 입력 (예: React, Python, Node.js)"
            />
            <button
              type="button"
              onClick={() => addTechStack(newTech)}
              disabled={!newTech.trim()}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
            >
              추가
            </button>
          </div>

          {/* 자동 감지 결과 */}
          {showTechStackEditor && detectedTechStack.length > 0 && (
            <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-green-800 dark:text-green-200">GitHub에서 감지된 기술</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addAllDetectedTech}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200"
                  >
                    전체 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTechStackEditor(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded transition-colors duration-200"
                  >
                    닫기
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedTechStack.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addDetectedTech(tech)}
                    disabled={profileData.techStack.includes(tech)}
                    className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    + {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!token && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ GitHub 토큰을 입력해야 자동 감지 기능을 사용할 수 있습니다.
            </p>
          )}
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
