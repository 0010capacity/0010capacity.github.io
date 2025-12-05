import Link from "next/link";

interface ProfileData {
  name: string;
  email: string;
  country: string;
  education: string;
  bio: string;
  techStack: string[];
}

// Server Component - reads static JSON at build time
async function getProfileData(): Promise<ProfileData> {
  const profileData: ProfileData = {
    name: "LEE JEONG WON",
    email: "0010capacity@gmail.com",
    country: "South Korea",
    education: "Kwangwoon University, Department of Artificial Intelligence",
    bio: "I make anything.",
    techStack: [
      "TypeScript",
      "C#",
      "ASP.NET",
      "CSS",
      "JavaScript",
      "Android Development",
      "Java",
      "Kotlin",
      "Web Development",
      "iOS Development",
    ],
  };
  return profileData;
}

export default async function AboutPage() {
  const profile = await getProfileData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 font-medium mb-8 inline-block"
        >
          ← 메인 페이지
        </Link>

        {/* Header Section */}
        <section className="text-center mb-16">
          <div className="mb-8">
            <div className="text-8xl mb-4">👤</div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {profile.name}
            </h1>
            <p className="text-xl text-gray-400 mb-6 max-w-2xl mx-auto">
              {profile.bio}
            </p>
          </div>

          {/* GitHub Link */}
          <div className="mb-8">
            <a
              href="https://github.com/0010capacity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              aria-label="Visit GitHub profile"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub 프로필 보기
            </a>
          </div>
        </section>

        {/* Profile Details */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8">👤 프로필</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-600 transition-all">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">이름</h3>
              <p className="text-2xl font-bold text-white">{profile.name}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-purple-600 transition-all">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                이메일
              </h3>
              <p className="text-lg text-gray-300 break-all">{profile.email}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-pink-600 transition-all">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">국가</h3>
              <p className="text-xl font-bold text-white">{profile.country}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-green-600 transition-all">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">교육</h3>
              <p className="text-lg text-gray-300">{profile.education}</p>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8">🛠️ 기술 스택</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="flex flex-wrap gap-3">
              {profile.techStack.map(tech => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-6 pt-6 border-t border-gray-700">
              * 기술 스택은 계속 업데이트됩니다.
            </p>
          </div>
        </section>

        {/* Projects Highlight */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8">🚀 주요 프로젝트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/novels"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-blue-600 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                소설 플랫폼
              </h3>
              <p className="text-gray-400">
                창작 소설을 연재하고 독자와 만나는 플랫폼
              </p>
            </Link>

            <Link
              href="/blog"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-purple-600 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                기술 블로그
              </h3>
              <p className="text-gray-400">
                개발 경험과 기술 지식을 공유하는 블로그
              </p>
            </Link>

            <Link
              href="/apps"
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-pink-600 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                📱
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                앱 마켓
              </h3>
              <p className="text-gray-400">
                개발한 iOS, Android, 웹 앱을 소개하는 마켓
              </p>
            </Link>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8">💼 소개</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              안녕하세요! 저는 풀스택 개발자로, iOS, Android, 웹 개발을 통해
              다양한 플랫폼에서 경험을 쌓았습니다.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              이 플랫폼은 제 창작물, 기술 블로그, 그리고 개발 프로젝트를
              한곳에서 소개하기 위해 만들었습니다. 여기서 제 작업물을
              둘러보시고, 피드백을 주시면 감사하겠습니다.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              계속해서 좋은 컨텐츠를 만들고, 기술을 발전시키기 위해 노력하고
              있습니다.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-6">더 알아보기</h3>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/novels"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
            >
              📚 소설 둘러보기
            </Link>
            <Link
              href="/blog"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all"
            >
              📝 블로그 읽기
            </Link>
            <Link
              href="/apps"
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition-all"
            >
              📱 앱 보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
