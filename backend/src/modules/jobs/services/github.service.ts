import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, timeout, of } from 'rxjs';

interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
  size: number;
}

interface GithubLanguage {
  [language: string]: number; // bytes of code
}

interface GithubProfile {
  login: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface ExtractedSkill {
  name: string;
  proficiency: string; // BEGINNER, INTERMEDIATE, EXPERT
  confidence: number; // 0-1
  evidence: string[]; // repos or activities that indicate this skill
}

@Injectable()
export class GithubService {
  private readonly httpService: HttpService;
  private readonly configService: ConfigService;

  constructor(
    httpService?: HttpService,
    configService?: ConfigService,
  ) {
    this.httpService = httpService || new HttpService();
    this.configService = configService || new ConfigService();
  }

  /**
   * Fetch user profile from GitHub
   */
  async getUserProfile(username: string): Promise<GithubProfile> {
    try {
      const token = this.configService.get<string>('GITHUB_TOKEN');
      const headers = token ? { Authorization: `token ${token}` } : {};

      const response = await firstValueFrom(
        this.httpService.get(`https://api.github.com/users/${username}`, { headers })
          .pipe(
            timeout(10000), // 10 second timeout
            catchError((error: any) => {
              if (error.response?.status === 404) {
                throw new Error(`GitHub user not found: ${username}`);
              }
              throw new Error(error.message);
            })
          )
      ) as any;

      return response.data;
    } catch (error: any) {
      if (error.message.includes('GitHub user not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(`Failed to fetch GitHub profile: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Fetch user's public repositories
   */
  async getUserRepos(username: string, perPage = 100): Promise<GithubRepo[]> {
    try {
      const token = this.configService.get<string>('GITHUB_TOKEN');
      const headers = token ? { Authorization: `token ${token}` } : {};

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/users/${username}/repos?per_page=${perPage}&sort=updated`,
          { headers },
        )
          .pipe(
            timeout(15000), // 15 second timeout for repos (could be large)
            catchError((error: any) => {
                throw new Error(error.message);
            })
          )
      ) as any;

      return response.data;
    } catch (error: any) {
      throw new HttpException(`Failed to fetch GitHub repositories: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get language statistics for a specific repository
   */
  async getRepoLanguages(username: string, repoName: string): Promise<GithubLanguage> {
    try {
      const token = this.configService.get<string>('GITHUB_TOKEN');
      const headers = token ? { Authorization: `token ${token}` } : {};

      const response = await firstValueFrom(
        this.httpService.get(`https://api.github.com/repos/${username}/${repoName}/languages`, { headers })
          .pipe(
            timeout(10000), // 10 second timeout
            catchError((error: any) => {
              // Return empty object if we can't get languages (repo might be private or inaccessible)
              return of({});
            })
          )
      ) as any;

      return response.data ?? {};
    } catch (error: any) {
      // Return empty object if we can't get languages (repo might be private or inaccessible)
      return {};
    }
  }

  /**
   * Extract programming languages and estimate proficiency from user's repos
   */
  async extractSkillsFromProfile(username: string): Promise<ExtractedSkill[]> {
    try {
      // Get user profile and repos
      const [profile, repos] = await Promise.all([
        this.getUserProfile(username),
        this.getUserRepos(username),
      ]);

      if (repos.length === 0) {
        return [];
      }

      // Aggregate language data across all repos
      const languageStats: Record<string, { bytes: number; repos: string[]; recentActivity: number }> = {};

      // Process each repo
      for (const repo of repos) {
        // Skip forks if desired (comment out if you want to include forks)
        // if (repo.fork) continue;

        const languages = await this.getRepoLanguages(username, repo.name);
        const repoAgeInDays = this.calculateDaysSince(repo.updated_at);
        const recencyScore = Math.max(0, 1 - repoAgeInDays / 365); // More recent = higher score

        for (const [language, bytes] of Object.entries(languages)) {
          if (!languageStats[language]) {
            languageStats[language] = { bytes: 0, repos: [], recentActivity: 0 };
          }

          languageStats[language].bytes += bytes;
          languageStats[language].repos.push(repo.name);
          languageStats[language].recentActivity += recencyScore;
        }
      }

      // Calculate proficiency for each language
      const skills: ExtractedSkill[] = [];

      for (const [language, stats] of Object.entries(languageStats)) {
        const proficiency = this.calculateProficiency(stats, repos.length);
        const confidence = Math.min(0.95, 0.5 + stats.repos.length * 0.1); // More repos = higher confidence

        skills.push({
          name: language,
          proficiency,
          confidence,
          evidence: stats.repos.slice(0, 3), // Show up to 3 repos as evidence
        });
      }

      // Sort by confidence and bytes (more important languages first)
      skills.sort((a, b) => {
        const bytesA = languageStats[a.name]?.bytes || 0;
        const bytesB = languageStats[b.name]?.bytes || 0;
        if (bytesB !== bytesA) return bytesB - bytesA;
        return b.confidence - a.confidence;
      });

      return skills;
    } catch (error) {
      console.error('Error extracting skills from GitHub profile:', error);
      return []; // Return empty array on error to not break recommendations
    }
  }

  /**
   * Calculate proficiency level based on language usage and activity
   */
  private calculateProficiency(stats: any, totalRepos: number): string {
    const { bytes, repos, recentActivity } = stats;
    const repoCount = repos.length;

    // Normalize metrics
    const bytesScore = Math.min(1, Math.log(bytes + 1) / 20); // Log scale for bytes
    const repoScore = Math.min(1, repoCount / 10); // Up to 10 repos
    const activityScore = Math.min(1, recentActivity / 5); // Up to 5 recent repos

    // Combined score (weighted)
    const score = bytesScore * 0.5 + repoScore * 0.3 + activityScore * 0.2;

    if (score >= 0.8) return 'EXPERT';
    if (score >= 0.5) return 'INTERMEDIATE';
    return 'BEGINNER';
  }

  /**
   * Calculate days since a date string
   */
  private calculateDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get trending repositories for a language (for discovering popular projects)
   */
  async getTrendingRepos(language: string, limit = 10): Promise<any[]> {
    try {
      const token = this.configService.get<string>('GITHUB_TOKEN');
      const headers = token ? { Authorization: `token ${token}` } : {};

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=${limit}`,
          { headers },
        )
          .pipe(
            timeout(15000), // 15 second timeout
            catchError((error: any) => {
              console.warn(`Could not fetch trending repos for ${language}:`, error.message);
              return of({ items: [] });
            })
          )
      ) as any;

      return response.data.items;
    } catch (error: any) {
      console.warn(`Could not fetch trending repos for ${language}:`, error.message);
      return [];
    }
  }
}