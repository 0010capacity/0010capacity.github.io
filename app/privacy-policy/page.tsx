import Link from "next/link";
import { Home } from "lucide-react";
import { getAllPrivacyPolicies } from "../data/privacy-policies";
import { getAppNames } from "../data/apps";
import { Button } from "../../components";

export default function PrivacyPolicy() {
  const allPolicies = getAllPrivacyPolicies();
  const appNames = getAppNames();

  // Fetch the latest privacy policy for each app
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
        <div className="mb-6">
          <Button as={Link} href="/" variant="outline" className="mb-4" icon={Home}>
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Check each app's privacy policy below.
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
                    Provides {app.policyCount} language versions
                  </p>
                  {app.latestUpdate && (
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(app.latestUpdate).toLocaleDateString('en-US')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-300">Privacy policy has not been registered yet.</p>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
