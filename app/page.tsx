"use client";

import Link from "next/link";
import GitHubCalendar from "react-github-calendar";
import { useState, useEffect } from "react";
import { Button, Card, Badge } from "../components";

interface ProfileData {
  name: string;
  email: string;
  country: string;
  education: string;
  bio: string;
  techStack: string[];
}

export default function Home() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 실제 profile.json 데이터를 가져옴
        const response = await fetch('/data/profile.json');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          // fallback 데이터
          setProfile({
            name: "LEE JEONG WON",
            email: "0010capacity@gmail.com",
            country: "대한민국",
            education: "광운대학교 인공지능학부 졸업",
            bio: "게임 개발과 AI를 사랑하는 개발자입니다.",
            techStack: ["TypeScript", "JavaScript", "Python", "React", "Next.js", "Unity", "PyTorch", "React Native", "Machine Learning", "Game Development"]
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // fallback 데이터
        setProfile({
          name: "LEE JEONG WON",
          email: "0010capacity@gmail.com",
          country: "대한민국",
          education: "광운대학교 인공지능학부 졸업",
          bio: "게임 개발과 AI를 사랑하는 개발자입니다.",
          techStack: ["TypeScript", "JavaScript", "Python", "React", "Next.js", "Unity", "PyTorch", "React Native", "Machine Learning", "Game Development"]
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="font-sans min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 프로필 데이터가 없을 때
  if (!profile) {
    return (
      <div className="font-sans min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p>프로필 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 하드코딩된 기술 스택 대신 실제 프로필 데이터 사용
  const techStack = profile.techStack;
  return (
    <div className="font-sans min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <section className="text-center mb-12">
          <Card className="bg-gray-800 border-gray-700 shadow-2xl">
            <h1 className="text-6xl font-bold mb-4 text-white">
              {profile.name}
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              {profile.bio}
            </p>
            
            {/* GitHub Link */}
            <div className="mb-6">
              <a
                href="https://github.com/0010capacity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub 방문하기
              </a>
            </div>
            
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Button as={Link} href="/edit-profile" variant="primary">
                👤 프로필 편집
              </Button>
              <Button as={Link} href="/apps" variant="secondary">
                제 작품들 보기
              </Button>
              <Button as={Link} href="/tech-stack-analysis" variant="success">
                기술 스택 분석기
              </Button>
              <Button as={Link} href="/privacy-policy" variant="outline">
                개인정보 처리방침
              </Button>
            </div>
          </Card>
        </section>

        {/* Profile Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-white">프로필</h2>
            <Button as={Link} href="/edit-profile" variant="primary" size="sm">
              ✏️ 프로필 편집
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">이름</h3>
              <p className="text-gray-300">{profile.name}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">이메일</h3>
              <p className="text-gray-300">{profile.email}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">국가</h3>
              <p className="text-gray-300">{profile.country}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">학력</h3>
              <p className="text-gray-300">{profile.education}</p>
            </Card>
            <Card className="bg-gray-800 border-gray-700 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">GitHub</h3>
              <a
                href="https://github.com/0010capacity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                @0010capacity
              </a>
            </Card>
          </div>

          {/* Tech Stack */}
          <Card
            title="테크 스택"
            actions={
              <Button as={Link} href="/edit-profile" variant="primary" size="sm">
                ✏️ 편집
              </Button>
            }
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <Badge key={tech} variant="info">
                  {tech}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * 프로필에서 기술 스택을 편집할 수 있습니다
            </p>
          </Card>

          {/* GitHub Calendar */}
          <Card title="GitHub 기여도" className="bg-gray-800 border-gray-700">
            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
              <GitHubCalendar username="0010capacity" colorScheme="dark" />
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
