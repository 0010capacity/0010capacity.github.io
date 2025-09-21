import Link from "next/link";
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Upload, Home, Eye } from "lucide-react";
import { Button, Card, Badge } from "../../components";

interface AppData {
  name: string;
  description: string;
  deployments: Array<{
    type: string;
    url: string;
    label?: string;
  }>;
  githubRepo?: string;
  createdAt: string;
  updatedAt: string;
}

export const metadata = {
  title: "Apps",
  description: "0010capacity가 개발한 iOS, Android, 웹 앱들을 소개합니다. 각 앱의 기능과 다운로드 링크를 확인하세요.",
  openGraph: {
    title: "Apps - 0010capacity Portfolio",
    description: "0010capacity가 개발한 iOS, Android, 웹 앱들을 소개합니다.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apps - 0010capacity Portfolio",
    description: "0010capacity가 개발한 iOS, Android, 웹 앱들을 소개합니다.",
  },
};

export default async function Apps() {
  // Read all JSON files from public/data/apps directory
  const appsDir = join(process.cwd(), 'public', 'data', 'apps');
  const files = readdirSync(appsDir).filter(file => file.endsWith('.json') && file !== 'index.json');
  
  const apps: AppData[] = files.map(file => {
    const filePath = join(appsDir, file);
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  });

  const getPlatformBadge = (deployments: AppData['deployments']) => {
    if (deployments.length === 0) return <Badge variant="default">In Development</Badge>;

    const types = deployments.map(d => d.type);
    if (types.includes('appstore')) return <Badge variant="info">iOS</Badge>;
    if (types.includes('googleplay')) return <Badge variant="warning">Android</Badge>;
    if (types.includes('website')) return <Badge variant="default">Web</Badge>;
    if (types.includes('steam')) return <Badge variant="error">PC</Badge>;
    return <Badge variant="default">Other</Badge>;
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <Card className="text-center mb-8">
          <div className="mb-4 flex justify-start">
            <Button as={Link} href="/" variant="outline" icon={Home}>
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-4">My Apps</h1>
          <p className="text-lg text-center mb-6">
            Here are the iOS, Android, and web apps I&apos;ve developed. Download or try them out.
          </p>
          <Button as={Link} href="/upload-app" variant="primary" icon={Upload}>
          </Button>
        </Card>

        {apps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app) => (
              <Card
                key={app.name}
                title={app.name}
                actions={getPlatformBadge(app.deployments)}
              >
                <p className="text-gray-600 mb-4">{app.description}</p>
                <div className="flex gap-2">
                  {app.deployments.length > 0 && app.deployments[0] && (
                    <a
                      href={app.deployments[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {app.deployments[0].type === 'website' ? 'Website' : 'Download'}
                    </a>
                  )}
                  <Button as={Link} href={`/apps/${app.name}`} variant="success" size="sm" icon={Eye}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">No apps registered yet.</p>
            <Button as={Link} href="/upload-app" variant="primary" icon={Upload}>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
