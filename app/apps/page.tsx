"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Upload, Home, Eye } from "lucide-react";
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

export default function Apps() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        // public/data/apps 폴더의 모든 JSON 파일을 가져옵니다
        const response = await fetch('/data/apps/index.json');
        if (response.ok) {
          const appList = await response.json();
          const appDataPromises = appList.map(async (appName: string) => {
            const appResponse = await fetch(`/data/apps/${appName}.json`);
            if (appResponse.ok) {
              return await appResponse.json();
            }
            return null;
          });
          const appData = await Promise.all(appDataPromises);
          setApps(appData.filter(app => app !== null));
        } else {
          // If index.json doesn't exist, try files directly
          const knownApps = ['Logit'];
          const appDataPromises = knownApps.map(async (appName: string) => {
            try {
              const appResponse = await fetch(`/data/apps/${appName}.json`);
              if (appResponse.ok) {
                return await appResponse.json();
              }
            } catch (error) {
              console.warn(`Failed to load app ${appName}:`, error);
            }
            return null;
          });
          const appData = await Promise.all(appDataPromises);
          setApps(appData.filter(app => app !== null));
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
        setApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const getDeploymentIcon = (type: string) => {
    switch (type) {
      case 'website': return '🌐';
      case 'appstore': return '📱';
      case 'googleplay': return '🤖';
      case 'steam': return '🎮';
      case 'download': return '⬇️';
      case 'other': return '🔗';
      default: return '🔗';
    }
  };

  const getPlatformBadge = (deployments: AppData['deployments']) => {
    if (deployments.length === 0) return <Badge variant="default">In Development</Badge>;

    const types = deployments.map(d => d.type);
    if (types.includes('appstore')) return <Badge variant="info">iOS</Badge>;
    if (types.includes('googleplay')) return <Badge variant="warning">Android</Badge>;
    if (types.includes('website')) return <Badge variant="default">Web</Badge>;
    if (types.includes('steam')) return <Badge variant="error">PC</Badge>;
    return <Badge variant="default">Other</Badge>;
  };

  if (loading) {
    return (
      <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-8 items-center">
          <div className="text-xl">Loading app list...</div>
        </main>
      </div>
    );
  }

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
                  {app.deployments.length > 0 && (
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
