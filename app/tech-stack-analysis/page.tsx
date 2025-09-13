"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitHubAnalyzer } from '../../lib/github';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('0010capacity');

  const analyzeUserRepos = async (user: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const analyzer = new GitHubAnalyzer(user);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repositories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeUserRepos(username);
  }, [username]);

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            GitHub 기술 스택 분석기
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            GitHub 저장소를 분석하여 개발자의 기술 스택을 자동으로 감지합니다.
          </p>
          
          {/* Username Input */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub 사용자명"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => analyzeUserRepos(username)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? '분석 중...' : '분석하기'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 dark:text-gray-300">GitHub 저장소 분석 중...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">분석 오류</h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              • GitHub API 제한에 도달했을 수 있습니다.<br/>
              • 사용자명이 존재하지 않을 수 있습니다.<br/>
              • 네트워크 연결을 확인해주세요.
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* Languages */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">프로그래밍 언어</h2>
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
            </div>

            {/* Frameworks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">프레임워크 & 라이브러리</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.frameworks.length > 0 ? (
                  analysis.frameworks.map((framework) => (
                    <span key={framework} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      {framework}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">감지된 프레임워크가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">기술 스택</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.technologies.length > 0 ? (
                  analysis.technologies.map((tech) => (
                    <span key={tech} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                      {tech}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">감지된 기술이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Repositories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                분석된 저장소 ({analysis.repositories.length}개)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.repositories.slice(0, 12).map((repo) => (
                  <div key={repo.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                        {repo.name}
                      </a>
                    </h3>
                    {repo.language && (
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs mb-2">
                        {repo.language}
                      </span>
                    )}
                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}