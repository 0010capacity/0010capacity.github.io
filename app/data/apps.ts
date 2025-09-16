export interface Deployment {
  type: 'website' | 'appstore' | 'googleplay' | 'steam' | 'download' | 'other';
  url: string;
  label?: string;
}

export interface AppData {
  name: string;
  description: string;
  deployments: Deployment[];
  githubRepo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const apps: Record<string, AppData> = {
  Logit: {
    name: 'Logit',
    description: '미니멀 하루 기록 앱',
    deployments: [
      {
        type: 'website',
        url: 'http://localhost'
      }
    ],
    githubRepo: null,
    createdAt: '2025-09-16T14:48:02.375Z',
    updatedAt: '2025-09-16T14:48:02.375Z'
  }
};

export const getAppNames = (): string[] => {
  return Object.keys(apps);
};

export const getAppData = (appName: string): AppData | null => {
  return apps[appName] || null;
};
