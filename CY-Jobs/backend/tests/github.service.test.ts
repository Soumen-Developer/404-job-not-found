import { GithubService } from '../src/modules/jobs/services/github.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';

// Mock the NestJS services
jest.mock('@nestjs/axios');
jest.mock('@nestjs/config');

describe('GithubService', () => {
  let service: GithubService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    httpService = new HttpService() as jest.Mocked<HttpService>;
    configService = new ConfigService() as jest.Mocked<ConfigService>;

    // Mock config service to return a test token
    configService.get.mockImplementation((key: string) => {
      if (key === 'GITHUB_TOKEN') return 'test-token';
      return null;
    });

    service = new GithubService(httpService, configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile when GitHub API returns success', async () => {
      const mockProfile = {
        login: 'testuser',
        name: 'Test User',
        company: 'Test Company',
        blog: 'https://test.com',
        location: 'Test City',
        email: 'test@example.com',
        bio: 'Test bio',
        twitter_username: 'testuser',
        public_repos: 10,
        public_gists: 5,
        followers: 100,
        following: 50,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      httpService.get.mockReturnValueOnce(of({ data: mockProfile }));

      const result = await service.getUserProfile('testuser');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        { headers: { Authorization: 'token test-token' } }
      );
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException when user is not found', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => ({ response: { status: 404 } }))
      );

      await expect(service.getUserProfile('nonexistent')).rejects.toThrow(
        expect.objectContaining({
          message: 'GitHub user not found: nonexistent',
        })
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => new Error('Network error'))
      );

      await expect(service.getUserProfile('testuser')).rejects.toThrow(
        expect.objectContaining({
          message: 'Failed to fetch GitHub profile: Network error',
        })
      );
    });
  });

  describe('getUserRepos', () => {
    it('should return user repositories when API returns success', async () => {
      const mockRepos = [
        {
          name: 'repo1',
          description: 'Test repo 1',
          language: 'TypeScript',
          stargazers_count: 10,
          forks_count: 2,
          updated_at: '2023-01-01T00:00:00Z',
          pushed_at: '2023-01-01T00:00:00Z',
          size: 100,
          fork: false
        },
        {
          name: 'repo2',
          description: 'Test repo 2',
          language: 'JavaScript',
          stargazers_count: 5,
          forks_count: 1,
          updated_at: '2023-01-02T00:00:00Z',
          pushed_at: '2023-01-02T00:00:00Z',
          size: 200,
          fork: true
        }
      ];

      httpService.get.mockReturnValueOnce(of({ data: mockRepos }));

      const result = await service.getUserRepos('testuser');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser/repos?per_page=100&sort=updated',
        { headers: { Authorization: 'token test-token' } }
      );
      expect(result).toEqual(mockRepos);
    });

    it('should throw InternalServerErrorException when API fails', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => new Error('API error'))
      );

      await expect(service.getUserRepos('testuser')).rejects.toThrow(
        expect.objectContaining({
          message: 'Failed to fetch GitHub repositories: API error',
        })
      );
    });
  });

  describe('getRepoLanguages', () => {
    it('should return language statistics for a repository', async () => {
      const mockLanguages = {
        TypeScript: 15000,
        JavaScript: 5000,
        HTML: 3000
      };

      httpService.get.mockReturnValueOnce(of({ data: mockLanguages }));

      const result = await service.getRepoLanguages('testuser', 'testrepo');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/testuser/testrepo/languages',
        { headers: { Authorization: 'token test-token' } }
      );
      expect(result).toEqual(mockLanguages);
    });

    it('should return empty object when language API fails', async () => {
      httpService.get.mockReturnValueOnce(
        throwError(() => new Error('Language API failed'))
      );

      const result = await service.getRepoLanguages('testuser', 'testrepo');

      expect(result).toEqual({});
    });
  });

  describe('extractSkillsFromProfile', () => {
    it('should extract skills from user profile and repositories', async () => {
      const mockProfile = {
        login: 'testuser',
        name: 'Test User',
        company: null,
        blog: null,
        location: null,
        email: null,
        bio: null,
        twitter_username: null,
        public_repos: 2,
        public_gists: 0,
        followers: 0,
        following: 0,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockRepos = [
        {
          name: 'frontend-project',
          description: 'A frontend project',
          language: 'TypeScript',
          stargazers_count: 10,
          forks_count: 2,
          updated_at: '2023-06-01T00:00:00Z',
          pushed_at: '2023-06-01T00:00:00Z',
          size: 1000,
          fork: false
        },
        {
          name: 'backend-api',
          description: 'A backend API',
          language: 'Node.js',
          stargazers_count: 5,
          forks_count: 1,
          updated_at: '2023-05-01T00:00:00Z',
          pushed_at: '2023-05-01T00:00:00Z',
          size: 2000,
          fork: false
        }
      ];

      // Mock the individual service calls
      jest.spyOn(service, 'getUserProfile').mockResolvedValue(mockProfile);
      jest.spyOn(service, 'getUserRepos').mockResolvedValue(mockRepos);

      // Mock getRepoLanguages to return different languages for each repo
      service.getRepoLanguages = jest.fn()
        .mockResolvedValueOnce({ TypeScript: 8000, JavaScript: 2000 }) // frontend-project
        .mockResolvedValueOnce({ 'Node.js': 15000, JavaScript: 5000 }); // backend-api

      const result = await service.extractSkillsFromProfile('testuser');

      expect(service.getUserProfile).toHaveBeenCalledWith('testuser');
      expect(service.getUserRepos).toHaveBeenCalledWith('testuser');
      expect(service.getRepoLanguages).toHaveBeenCalledTimes(2);

      // Should have skills for TypeScript, JavaScript, and Node.js
      expect(result.length).toBeGreaterThanOrEqual(3);

      // Check that skills have required properties
      const typescriptSkill = result.find(s => s.name === 'TypeScript');
      expect(typescriptSkill).toBeDefined();
      expect(['BEGINNER', 'INTERMEDIATE', 'EXPERT']).toContain(typescriptSkill?.proficiency);
      expect(typeof typescriptSkill?.confidence).toBe('number');
      expect(Array.isArray(typescriptSkill?.evidence)).toBe(true);
    });

    it('should return empty array when user has no repositories', async () => {
      const mockProfile = {
        login: 'testuser',
        name: 'Test User',
        company: null,
        blog: null,
        location: null,
        email: null,
        bio: null,
        twitter_username: null,
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0,
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      jest.spyOn(service, 'getUserProfile').mockResolvedValue(mockProfile);
      jest.spyOn(service, 'getUserRepos').mockResolvedValue([]);

      const result = await service.extractSkillsFromProfile('testuser');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully and return empty array', async () => {
      jest.spyOn(service, 'getUserProfile').mockRejectedValue(
        new Error('API error')
      );

      const result = await service.extractSkillsFromProfile('testuser');

      expect(result).toEqual([]);
    });
  });

  describe('calculateProficiency', () => {
    it('should return EXPERT for high scores', () => {
      const stats = { bytes: 1000000, repos: ['repo1', 'repo2', 'repo3', 'repo4', 'repo5', 'repo6', 'repo7', 'repo8', 'repo9', 'repo10'], recentActivity: 5 };
      const result = service['calculateProficiency'](stats, 10);
      expect(result).toBe('EXPERT');
    });

    it('should return INTERMEDIATE for medium scores', () => {
      const stats = { bytes: 200000, repos: ['repo1', 'repo2', 'repo3', 'repo4', 'repo5'], recentActivity: 3 };
      const result = service['calculateProficiency'](stats, 5);
      expect(result).toBe('INTERMEDIATE');
    });

    it('should return BEGINNER for low scores', () => {
      const stats = { bytes: 1000, repos: ['repo1'], recentActivity: 0 };
      const result = service['calculateProficiency'](stats, 1);
      expect(result).toBe('BEGINNER');
    });
  });

  describe('calculateDaysSince', () => {
    it('should calculate days since a date correctly', () => {
      const pastDate = '2023-01-01T00:00:00Z';
      const result = service['calculateDaysSince'](pastDate);

      // Calculate expected days difference
      const past = new Date(pastDate);
      const now = new Date();
      const expected = Math.ceil(Math.abs(now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));

      expect(result).toBe(expected);
    });
  });
});