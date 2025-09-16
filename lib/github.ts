import { Octokit } from '@octokit/rest';

interface GitHubRepo {
  name: string;
  language: string | null;
  languages_url: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface LanguageStats {
  [key: string]: number;
}

interface TechStackResult {
  languages: { [key: string]: number };
  frameworks: string[];
  technologies: string[];
}

interface Deployment {
  type: 'website' | 'appstore' | 'googleplay' | 'steam' | 'download' | 'other';
  url: string;
  label?: string; // 사용자 정의 라벨
}

interface AppData {
  name: string;
  description: string;
  platform: string;
  deployments: Deployment[];
  githubRepo?: string;
  createdAt: string;
  updatedAt: string;
}

export class GitHubAnalyzer {
  private username: string;
  private token?: string;

  constructor(username: string, token?: string) {
    this.username = username;
    this.token = token;
  }

  private async fetchWithAuth(url: string) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': '0010capacity.github.io/1.0.0', // GitHub API requires User-Agent
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    const repos = await this.fetchWithAuth(
      `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=100`
    );
    return repos;
  }

  async getRepositoryLanguages(languagesUrl: string): Promise<LanguageStats> {
    return await this.fetchWithAuth(languagesUrl);
  }

  async analyzeTechStack(): Promise<TechStackResult> {
    const repos = await this.getRepositories();
    const allLanguages: { [key: string]: number } = {};
    const frameworks = new Set<string>();
    const technologies = new Set<string>();

    // Process each repository
    for (const repo of repos) {
      try {
        // Get language statistics
        const languages = await this.getRepositoryLanguages(repo.languages_url);
        
        // Aggregate languages
        for (const [lang, bytes] of Object.entries(languages)) {
          allLanguages[lang] = (allLanguages[lang] || 0) + bytes;
        }

        // Infer frameworks and technologies based on repository analysis
        await this.inferTechnologies(repo, frameworks, technologies);
        
      } catch (error) {
        console.warn(`Failed to analyze repo ${repo.name}:`, error);
      }
    }

    // Convert sets to arrays and sort
    const sortedLanguages = Object.entries(allLanguages)
      .sort(([,a], [,b]) => b - a)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as { [key: string]: number });

    return {
      languages: sortedLanguages,
      frameworks: Array.from(frameworks).sort(),
      technologies: Array.from(technologies).sort()
    };
  }

  private async inferTechnologies(repo: GitHubRepo, frameworks: Set<string>, technologies: Set<string>) {
    // Infer technologies based on repository name, description, and primary language
    const repoName = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();
    const language = repo.language;

    // Framework inference based on language and common patterns
    if (language === 'JavaScript' || language === 'TypeScript') {
      // Check for common JS/TS frameworks in repo names and descriptions
      if (repoName.includes('react') || description.includes('react')) {
        frameworks.add('React');
      }
      if (repoName.includes('next') || description.includes('next')) {
        frameworks.add('Next.js');
      }
      if (repoName.includes('vue') || description.includes('vue')) {
        frameworks.add('Vue.js');
      }
      if (repoName.includes('angular') || description.includes('angular')) {
        frameworks.add('Angular');
      }
      if (repoName.includes('node') || description.includes('node')) {
        technologies.add('Node.js');
      }
      if (repoName.includes('express') || description.includes('express')) {
        frameworks.add('Express.js');
      }
    }

    if (language === 'Python') {
      if (repoName.includes('django') || description.includes('django')) {
        frameworks.add('Django');
      }
      if (repoName.includes('flask') || description.includes('flask')) {
        frameworks.add('Flask');
      }
      if (repoName.includes('pytorch') || description.includes('pytorch')) {
        frameworks.add('PyTorch');
      }
      if (repoName.includes('tensorflow') || description.includes('tensorflow')) {
        frameworks.add('TensorFlow');
      }
      if (description.includes('machine learning') || description.includes('deep learning') || description.includes('ml') || description.includes('dl')) {
        technologies.add('Machine Learning');
      }
      if (description.includes('reinforcement learning') || description.includes('rl')) {
        technologies.add('Reinforcement Learning');
      }
    }

    if (language === 'C#') {
      if (repoName.includes('unity') || description.includes('unity')) {
        frameworks.add('Unity');
      }
      if (description.includes('game') || repoName.includes('game')) {
        technologies.add('Game Development');
      }
    }

    // Mobile development
    if (language === 'Swift' || repoName.includes('ios')) {
      technologies.add('iOS Development');
    }
    if (language === 'Kotlin' || language === 'Java' && (repoName.includes('android') || description.includes('android'))) {
      technologies.add('Android Development');
    }
    if (repoName.includes('react-native') || description.includes('react native')) {
      frameworks.add('React Native');
      technologies.add('Mobile Development');
    }

    // Web technologies
    if (language === 'HTML' || language === 'CSS') {
      technologies.add('Web Development');
    }

    // Add language as technology if it's a primary one
    if (language && ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin'].includes(language)) {
      technologies.add(language);
    }
  }

  // Helper method to get formatted tech stack for display
  getFormattedTechStack(result: TechStackResult): string[] {
    const techStack: string[] = [];
    
    // Add top languages (limit to top 5)
    const topLanguages = Object.keys(result.languages).slice(0, 5);
    techStack.push(...topLanguages);
    
    // Add frameworks
    techStack.push(...result.frameworks);
    
    // Add unique technologies not already included
    const uniqueTechnologies = result.technologies.filter(tech => 
      !techStack.some(existing => existing.toLowerCase() === tech.toLowerCase())
    );
    techStack.push(...uniqueTechnologies);
    
    return techStack.slice(0, 12); // Limit total to 12 items for display
  }
}

export const analyzeUserTechStack = async (username: string, token?: string): Promise<string[]> => {
  const analyzer = new GitHubAnalyzer(username, token);
  const result = await analyzer.analyzeTechStack();
  return analyzer.getFormattedTechStack(result);
};

// 일반적인 PR 생성 함수
export const createFilePR = async (
  token: string,
  filePath: string,
  content: string,
  commitMessage: string,
  prTitle: string,
  prBody: string
): Promise<string> => {
  const octokit = new Octokit({ auth: token });
  const owner = '0010capacity'; // 레포지토리 소유자
  const repo = '0010capacity.github.io'; // 레포지토리 이름
  const branchName = `feature/update-${Date.now()}`;

  try {
    // 메인 브랜치의 최신 커밋 SHA 가져오기
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main',
    });
    const sha = refData.object.sha;

    // 새 브랜치 생성
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });

    // 파일 내용 base64 인코딩
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    // 파일 생성 또는 업데이트
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: contentBase64,
      branch: branchName,
    });

    // PR 생성
    const { data: prData } = await octokit.pulls.create({
      owner,
      repo,
      title: prTitle,
      head: branchName,
      base: 'main',
      body: prBody,
    });

    return prData.html_url; // PR URL 반환
  } catch (error) {
    console.error('Error creating PR:', error);
    throw new Error('Failed to create PR. Please check your token and try again.');
  }
};

// PR 생성 함수들
export const createPrivacyPolicyPR = async (
  token: string,
  appName: string,
  language: string,
  content: string
): Promise<string> => {
  const filePath = `privacy-policies/${appName}/${language}.md`;
  const commitMessage = `Add privacy policy for ${appName} in ${language}`;
  const prTitle = `Add privacy policy for ${appName} in ${language}`;
  const prBody = `This PR adds a privacy policy for the app "${appName}" in language "${language}".`;

  return await createFilePR(token, filePath, content, commitMessage, prTitle, prBody);
};

export const createAppPR = async (
  token: string,
  appName: string,
  description: string,
  platform: string,
  deployments: Deployment[],
  githubRepo?: string
): Promise<string> => {
  const filePath = `apps/${appName}.json`;
  const appData = JSON.stringify({
    name: appName,
    description,
    platform,
    deployments,
    githubRepo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, null, 2);
  
  const commitMessage = `Add app: ${appName}`;
  const prTitle = `Add new app: ${appName}`;
  const prBody = `This PR adds a new app "${appName}" for ${platform} platform.`;

  return await createFilePR(token, filePath, appData, commitMessage, prTitle, prBody);
};

export const updateAppPR = async (
  token: string,
  appName: string,
  description: string,
  platform: string,
  deployments: Deployment[],
  githubRepo?: string
): Promise<string> => {
  const filePath = `apps/${appName}.json`;
  const appData = JSON.stringify({
    name: appName,
    description,
    platform,
    deployments,
    githubRepo,
    updatedAt: new Date().toISOString()
  }, null, 2);
  
  const commitMessage = `Update app: ${appName}`;
  const prTitle = `Update app: ${appName}`;
  const prBody = `This PR updates the app "${appName}".`;

  return await createFilePR(token, filePath, appData, commitMessage, prTitle, prBody);
};

export const createProfilePR = async (
  token: string,
  profileData: {
    name: string;
    email: string;
    country: string;
    education: string;
    bio: string;
    techStack?: string[];
  }
): Promise<string> => {
  const filePath = `data/profile.json`;
  const profileJson = JSON.stringify(profileData, null, 2);
  
  const commitMessage = `Update profile information`;
  const prTitle = `Update profile information`;
  const prBody = `This PR updates the profile information.`;

  return await createFilePR(token, filePath, profileJson, commitMessage, prTitle, prBody);
};