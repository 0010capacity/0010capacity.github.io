/* eslint-disable @typescript-eslint/no-require-imports */
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

// 빌드 시점에 실행되어 앱 데이터를 생성하는 함수
function generateAppsData(): Record<string, AppData> {
  // 클라이언트 사이드에서는 빈 객체 반환
  if (typeof window !== 'undefined') {
    return {};
  }

  try {
    // 서버 사이드에서만 fs 모듈 사용
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');

    const apps: Record<string, AppData> = {};
    const appsDir = path.join(process.cwd(), 'public', 'data', 'apps');

    // apps 폴더가 존재하는지 확인
    if (!fs.existsSync(appsDir)) {
      console.warn('Apps directory not found:', appsDir);
      return apps;
    }

    // 각 JSON 파일을 순회
    const files = fs.readdirSync(appsDir)
      .filter((file: string) => file.endsWith('.json') && file !== 'index.json');

    for (const file of files) {
      const appName = file.replace('.json', '');
      const filePath = path.join(appsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      apps[appName] = JSON.parse(content);
    }

    return apps;
  } catch (error) {
    console.error('Error generating apps data:', error);
    return {};
  }
}

// 빌드 시점에 데이터 생성
export const apps: Record<string, AppData> = generateAppsData();

export const getAppNames = (): string[] => {
  return Object.keys(apps);
};

export const getAppData = (appName: string): AppData | null => {
  return apps[appName] || null;
};
