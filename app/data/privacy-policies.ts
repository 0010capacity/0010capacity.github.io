/* eslint-disable @typescript-eslint/no-require-imports */
export interface PrivacyPolicyData {
  appName: string;
  language: string;
  url: string;
  lastUpdated: string;
  content?: string;
}

// 빌드 시점에 실행되어 개인정보 처리방침 데이터를 생성하는 함수
function generatePrivacyPoliciesData(): PrivacyPolicyData[] {
  // 개발 환경이 아니거나 클라이언트 사이드에서는 하드코딩된 데이터 사용
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
    return [
      {
        appName: 'Logit',
        language: 'ko',
        url: '/data/privacy-policies/Logit/ko.md',
        lastUpdated: '2025-09-17',
      },
      {
        appName: 'Logit',
        language: 'en',
        url: '/data/privacy-policies/Logit/en.md',
        lastUpdated: '2025-09-17',
      }
    ];
  }

  try {
    // 프로덕션 빌드 시점에서만 fs 모듈 사용
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');

    const privacyPolicies: PrivacyPolicyData[] = [];
    const privacyPoliciesDir = path.join(process.cwd(), 'public', 'data', 'privacy-policies');

    // privacy-policies 폴더가 존재하는지 확인
    if (!fs.existsSync(privacyPoliciesDir)) {
      console.warn('Privacy policies directory not found:', privacyPoliciesDir);
      return privacyPolicies;
    }

    // 각 앱 폴더를 순회
    const appDirs = fs.readdirSync(privacyPoliciesDir, { withFileTypes: true })
      .filter((dirent: import('fs').Dirent) => dirent.isDirectory())
      .map((dirent: import('fs').Dirent) => dirent.name);

    for (const appName of appDirs) {
      const appDir = path.join(privacyPoliciesDir, appName);

      // 각 언어 파일을 확인
      const languageFiles = fs.readdirSync(appDir)
        .filter((file: string) => file.endsWith('.md'))
        .map((file: string) => {
          const language = path.parse(file).name; // ko.md -> ko, en.md -> en
          const filePath = path.join(appDir, file);
          const stats = fs.statSync(filePath);

          return {
            appName,
            language,
            url: `/data/privacy-policies/${appName}/${file}`,
            lastUpdated: stats?.mtime?.toISOString().split('T')[0] || '2024-01-01', // YYYY-MM-DD 형식
          };
        });

      privacyPolicies.push(...languageFiles);
    }

    return privacyPolicies;
  } catch (error) {
    console.error('Error generating privacy policies data:', error);
    return [];
  }
}

// 빌드 시점에 데이터 생성
export const privacyPolicies: PrivacyPolicyData[] = generatePrivacyPoliciesData();

export const getPrivacyPoliciesForApp = (appName: string): PrivacyPolicyData[] => {
  return privacyPolicies.filter(policy => policy.appName === appName);
};

export const getAllPrivacyPolicies = (): PrivacyPolicyData[] => {
  return privacyPolicies;
};
