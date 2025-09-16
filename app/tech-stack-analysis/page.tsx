"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { GitHubAnalyzer } from '../../lib/github';
import { Button, Card, Loading, ErrorMessage, Badge, Form, FormField, Input } from '../../components';

interface AnalysisResult {
  languages: { [key: string]: number };
  frameworks: string[];
  technologies: string[];
  repositories: Array<{
    name: string;
    language: string | null;
    description: string | null;
    html_url: string;
  }>;
}

export default function TechStackAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('0010capacity');
  const [token, setToken] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeUserRepos = async (user: string, userToken?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const analyzer = new GitHubAnalyzer(user, userToken);
      const repos = await analyzer.getRepositories();
      const techStack = await analyzer.analyzeTechStack();
      
      setAnalysis({
        languages: techStack.languages,
        frameworks: techStack.frameworks,
        technologies: techStack.technologies,
        repositories: repos.map(repo => ({
          name: repo.name,
          language: repo.language,
          description: repo.description,
          html_url: repo.html_url
        }))
      });
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repositories');
    } finally {
      setLoading(false);
    }
  };

  // 자동 분석 제거 - 사용자가 버튼을 눌러야만 분석 시작

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLanguagePercentage = (bytes: number, total: number): number => {
    return Math.round((bytes / total) * 100);
  };

  const totalBytes = analysis ? Object.values(analysis.languages).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <Card className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            GitHub 기술 스택 분석기
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            GitHub 저장소를 분석하여 개발자의 기술 스택을 자동으로 감지합니다.
          </p>
          
          {/* Username Input */}
          <Form onSubmit={(e) => { e.preventDefault(); analyzeUserRepos(username, token || undefined); }}>
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField label="" className="flex-1">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="GitHub 사용자명"
                />
              </FormField>
              <FormField label="" className="flex-1">
                <Input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="GitHub Personal Access Token (선택)"
                />
              </FormField>
              <Button type="submit" disabled={loading} className="sm:w-auto">
                {loading ? '분석 중...' : '분석하기'}
              </Button>
            </div>
          </Form>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <Loading message="GitHub 저장소 분석 중..." />
          </Card>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={error}
            className="mb-8"
            onRetry={() => analyzeUserRepos(username, token || undefined)}
          />
        )}

        {/* Initial State - 분석 전 */}
        {!hasAnalyzed && !loading && (
          <Card className="mb-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                GitHub 기술 스택 분석
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                위의 정보를 입력하고 &ldquo;분석하기&rdquo; 버튼을 클릭하여 GitHub 저장소를 분석하세요.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 분석 팁</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                  <li>• Personal Access Token을 입력하면 더 정확한 분석이 가능합니다</li>
                  <li>• 공개 저장소만 분석되며, 비공개 저장소는 토큰이 있어도 분석되지 않습니다</li>
                  <li>• API 제한으로 인해 너무 자주 분석하지 마세요</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* Languages */}
            <Card title="프로그래밍 언어">
              <div className="space-y-3">
                {Object.entries(analysis.languages).slice(0, 10).map(([lang, bytes]) => (
                  <div key={lang} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{lang}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getLanguagePercentage(bytes, totalBytes)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                        {getLanguagePercentage(bytes, totalBytes)}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 min-w-[4rem]">
                        {formatBytes(bytes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Frameworks */}
            <Card title="프레임워크 & 라이브러리">
              <div className="flex flex-wrap gap-2">
                {analysis.frameworks.length > 0 ? (
                  analysis.frameworks.map((framework) => (
                    <Badge key={framework} variant="success">
                      {framework}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">감지된 프레임워크가 없습니다.</p>
                )}
              </div>
            </Card>

            {/* Technologies */}
            <Card title="기술 스택">
              <div className="flex flex-wrap gap-2">
                {analysis.technologies.length > 0 ? (
                  analysis.technologies.map((tech) => (
                    <Badge key={tech} variant="info">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">감지된 기술이 없습니다.</p>
                )}
              </div>
            </Card>

            {/* Repositories */}
            <Card title={`분석된 저장소 (${analysis.repositories.length}개)`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.repositories.slice(0, 12).map((repo) => (
                  <div key={repo.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                        {repo.name}
                      </a>
                    </h3>
                    {repo.language && (
                      <Badge variant="default" size="sm" className="mb-2">
                        {repo.language}
                      </Badge>
                    )}
                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button as={Link} href="/" variant="outline" className="flex items-center justify-center gap-2" icon={Home}>
            홈으로 돌아가기
          </Button>
        </div>
      </main>
    </div>
  );
}