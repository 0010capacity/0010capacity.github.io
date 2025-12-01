import Link from "next/link";
import { Plus, ArrowLeft, Eye } from "lucide-react";
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
        <h1 className="text-4xl font-bold mb-8 text-center">{app} Privacy Policy</h1>

        {policies.length > 0 ? (
          <div className="space-y-6">
            {policies.map((policy) => (
              <div key={policy.language} className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-400">
                    {policy.language === 'ko' ? 'Korean Version' :
                     policy.language === 'en' ? 'English Version' :
                     policy.language}
                  </h2>
                  <div className="text-sm text-gray-500">
                    Last updated: {policy.lastUpdated}
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
            <h2 className="text-2xl font-semibold text-gray-400 mb-4">No Privacy Policy</h2>
            <p className="text-gray-300 mb-6">
              The privacy policy for {app} app has not been registered yet.
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
