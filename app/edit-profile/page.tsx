'use client';

import { useState, useEffect } from 'react';
import { createProfilePR } from '../../lib/github';
import { GitHubAnalyzer } from '../../lib/github';
import { Button, Card, Loading, ErrorMessage, Badge, Form, FormField, FormActions, Input, Textarea } from '../../components';

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

      <Form onSubmit={handleSubmit}>
        <FormField label="GitHub Personal Access Token" required>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
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
        </FormField>

        <FormField label="이름" required>
          <Input
            type="text"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </FormField>

        <FormField label="이메일" required>
          <Input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </FormField>

        <FormField label="국가" required>
          <Input
            type="text"
            value={profileData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
          />
        </FormField>

        <FormField label="학력" required>
          <Input
            type="text"
            value={profileData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
          />
        </FormField>

        <FormField label="자기소개" required>
          <Textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="자기소개를 입력하세요..."
            className="h-24"
          />
        </FormField>

        {/* 테크 스택 섹션 */}
        <Card
          title="기술 스택"
          actions={
            <Button
              type="button"
              onClick={detectTechStack}
              disabled={isDetecting || !token}
              variant="success"
              size="sm"
            >
              {isDetecting ? '감지 중...' : '🔍 GitHub에서 자동 감지'}
            </Button>
          }
        >

          {/* 현재 테크 스택 */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {profileData.techStack.map((tech) => (
                <Badge key={tech} variant="info" className="flex items-center gap-2">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechStack(tech)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-1"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {profileData.techStack.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">등록된 기술 스택이 없습니다.</p>
            )}
          </div>

          {/* 수동 추가 */}
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack(newTech))}
              placeholder="기술 스택 입력 (예: React, Python, Node.js)"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => addTechStack(newTech)}
              disabled={!newTech.trim()}
              variant="secondary"
              size="sm"
            >
              추가
            </Button>
          </div>

          {/* 자동 감지 결과 */}
          {showTechStackEditor && detectedTechStack.length > 0 && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-green-800 dark:text-green-200">GitHub에서 감지된 기술</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addAllDetectedTech}
                    variant="success"
                    size="sm"
                  >
                    전체 추가
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowTechStackEditor(false)}
                    variant="secondary"
                    size="sm"
                  >
                    닫기
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedTechStack.map((tech) => (
                  <Button
                    key={tech}
                    type="button"
                    onClick={() => addDetectedTech(tech)}
                    disabled={profileData.techStack.includes(tech)}
                    variant="outline"
                    size="sm"
                    className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700 disabled:opacity-50"
                  >
                    + {tech}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {!token && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ GitHub 토큰을 입력해야 자동 감지 기능을 사용할 수 있습니다.
            </p>
          )}
        </Card>

        <FormActions>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? '저장 중...' : '프로필 업데이트'}
          </Button>
        </FormActions>
      </Form>

      {error && (
        <ErrorMessage message={error} className="mt-4" />
      )}

      {prUrl && (
        <Card className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="text-green-800 dark:text-green-200">
            프로필이 성공적으로 업데이트되었습니다!{' '}
            <a href={prUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">
              PR 보기
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
