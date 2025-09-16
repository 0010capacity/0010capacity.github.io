export interface PrivacyPolicyData {
  appName: string;
  language: string;
  url: string;
  lastUpdated: string;
  content?: string;
}

export const privacyPolicies: PrivacyPolicyData[] = [
  // 실제 개인정보 처리방침 데이터가 여기에 추가됩니다
  // 예시:
  // {
  //   appName: 'Logit',
  //   language: 'ko',
  //   url: '/privacy-policies/Logit/ko.md',
  //   lastUpdated: '2024-01-15',
  //   content: '...'
  // }
];

export const getPrivacyPoliciesForApp = (appName: string): PrivacyPolicyData[] => {
  return privacyPolicies.filter(policy => policy.appName === appName);
};

export const getAllPrivacyPolicies = (): PrivacyPolicyData[] => {
  return privacyPolicies;
};
