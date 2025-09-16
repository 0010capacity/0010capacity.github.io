import Link from "next/link";
import { Plus, ArrowLeft, Home, Eye } from "lucide-react";
import { getAppNames } from "@/app/data/apps";
import { getPrivacyPoliciesForApp } from "@/app/data/privacy-policies";
import { Button } from "@/components";

export async function generateStaticParams() {
  const appNames = getAppNames();
  return appNames.map(appName => ({
    app: appName
  }));
}

export default async function AppPrivacyPolicy({ params }: { params: Promise<{ app: string }> }) {
  const { app } = await params;
  const policies = getPrivacyPoliciesForApp(app);

  return (
    <div className="font-sans min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button as={Link} href="/privacy-policy" variant="outline" className="mb-4" icon={ArrowLeft}>
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-center">{app} 개인정보 처리방침</h1>

        {policies.length > 0 ? (
          <div className="space-y-6">
            {policies.map((policy) => (
              <div key={policy.language} className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-400">
                    {policy.language === 'ko' ? '한국어 버전' :
                     policy.language === 'en' ? 'English Version' :
                     policy.language}
                  </h2>
                  <div className="text-sm text-gray-500">
                    마지막 업데이트: {policy.lastUpdated}
                  </div>
                </div>
                <div className="mb-4">
                  <Button
                    as="a"
                    href={policy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    size="sm"
                    icon={Eye}
                  ></Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 text-center">
            <h2 className="text-2xl font-semibold text-gray-400 mb-4">개인정보 처리방침이 없습니다</h2>
            <p className="text-gray-300 mb-6">
              {app} 앱의 개인정보 처리방침이 아직 등록되지 않았습니다.
            </p>
            <Button
              as={Link}
              href={`/submit-pr?app=${app}`}
              variant="primary"
              size="md"
              icon={Plus}
            ></Button>
          </div>
        )}

      </main>
    </div>
  );
}
