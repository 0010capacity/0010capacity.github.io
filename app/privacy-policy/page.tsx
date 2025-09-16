import Link from "next/link";
import { Home } from "lucide-react";
import { getAllPrivacyPolicies } from "../data/privacy-policies";
import { getAppNames } from "../data/apps";
import { Button } from "../../components";

export default function PrivacyPolicy() {
  const allPolicies = getAllPrivacyPolicies();
  const appNames = getAppNames();

  // 각 앱별로 최신 개인정보 처리방침을 가져옴
  const appsWithPolicies = appNames.map(appName => {
    const policies = allPolicies.filter(policy => policy.appName === appName);
    return {
      name: appName,
      hasPolicies: policies.length > 0,
      policyCount: policies.length,
      latestUpdate: policies.length > 0 ? Math.max(...policies.map(p => new Date(p.lastUpdated).getTime())) : null
    };
  });

  return (
    <div className="font-sans min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">개인정보 처리방침</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          아래에서 각 앱의 개인정보 처리방침을 확인하세요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appsWithPolicies.map((app) => (
            <Link
              key={app.name}
              href={`/privacy-policy/${app.name}`}
              className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">{app.name}</h2>
              {app.hasPolicies ? (
                <div>
                  <p className="text-gray-300 mb-2">
                    {app.policyCount}개의 언어 버전 제공
                  </p>
                  {app.latestUpdate && (
                    <p className="text-sm text-gray-500">
                      마지막 업데이트: {new Date(app.latestUpdate).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">개인정보 처리방침이 아직 등록되지 않았습니다.</p>
              )}
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button as={Link} href="/" variant="secondary" icon={Home}>
          </Button>
        </div>
      </main>
    </div>
  );
}
