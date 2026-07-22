import { RecommendationService } from '../src/modules/jobs/services/recommendation.service';

// Create mock objects directly
const createMockGithubService = () => ({
  getUserProfile: jest.fn(),
  getUserRepos: jest.fn(),
  getRepoLanguages: jest.fn(),
  extractSkillsFromProfile: jest.fn()
});

const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn()
  },
  job: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  jobSkill: {
    findMany: jest.fn()
  },
  skill: {
    findMany: jest.fn()
  }
});

const createMockJobService = () => ({
  getJobs: jest.fn(),
  fetchAndStoreJobs: jest.fn(),
  getJobById: jest.fn(),
  getJobByExternalId: jest.fn(),
  searchJobs: jest.fn() // Keep for backward compatibility if needed
});

describe('RecommendationService - GitHub Integration', () => {
  let service: RecommendationService;
  let githubService: ReturnType<typeof createMockGithubService>;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let jobService: ReturnType<typeof createMockJobService>;

  const mockUserId = 'user-123';
  const mockJobId = 'job-456';

  beforeEach(() => {
    githubService = createMockGithubService();
    prismaService = createMockPrismaService();
    jobService = createMockJobService();

    service = new RecommendationService(
      prismaService as any,
      jobService as any,
      githubService as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateJobMatchScore with GitHub skills', () => {
    it('should incorporate GitHub skills into skill matching calculation', async () => {
      // Mock user data with GitHub username
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        githubUsername: 'testuser',
        skills: [
          { skillId: 'skill-1', skill: { id: 'skill-1', name: 'JavaScript', type: 'HARD' }, proficiency: 'INTERMEDIATE' },
          { skillId: 'skill-2', skill: { id: 'skill-2', name: 'Node.js', type: 'HARD' }, proficiency: 'INTERMEDIATE' }
        ],
        resumes: []
      };

      // Mock job data
      const mockJob = {
        id: mockJobId,
        title: 'Full Stack Developer',
        company: 'Tech Corp',
        location: 'Remote',
        salary: 85000,
        jobType: 'Full-time',
        remote: true,
        experienceLevel: 'MID'
      };

      // Mock Prisma service responses - note the actual structure used in the service
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.job.findUnique.mockResolvedValue(mockJob);
      // Mock job skills for skill matching
      prismaService.jobSkill.findMany.mockResolvedValue([
        { skill: { name: 'TypeScript' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'JavaScript' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'Node.js' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'Role' }, isRequired: true, weight: 1.0 }
      ]);

      // Mock GitHub service to return extracted skills
      githubService.extractSkillsFromProfile.mockResolvedValue([
        { name: 'TypeScript', proficiency: 'INTERMEDIATE', confidence: 0.8, evidence: ['repo1'] },
        { name: 'JavaScript', proficiency: 'EXPERT', confidence: 0.9, evidence: ['repo1', 'repo2'] },
        { name: 'Node.js', proficiency: 'INTERMEDIATE', confidence: 0.7, evidence: ['repo2'] }
      ]);

      // Call the method
      const result = await service.calculateJobMatchScore(mockUserId, mockJobId);

      // Assertions - match the actual structure used in the service
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          skills: {
            include: {
              skill: true
            }
          },
          resumes: {
            orderBy: {
              updatedAt: 'desc'
            }
          }
        }
      });
      expect(prismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: mockJobId }
      });
      expect(githubService.extractSkillsFromProfile).toHaveBeenCalledWith('testuser');

      // Verify that the result includes GitHub skills in the analysis
      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('skillGapAnalysis');
      expect(result).toHaveProperty('explanation');

      // The user had JS/Node.js skills from resume, and GitHub showed TS/JS/Node.js
      // So matched skills should include JS and Node.js from both sources, plus TS from GitHub
      // Note: The job requires Role, not React. We'll adjust the test to match the job skills we mocked.
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('Node.js');
      expect(result.matchedSkills).toContain('TypeScript');

      // The job required Role which neither resume nor GitHub showed
      expect(result.missingSkills).toContain('Role');

      // Skill gap analysis should show Role as missing
      expect(result.skillGapAnalysis.criticalMissing).toContain('Role');
    });

    it('should handle user without GitHub username gracefully', async () => {
      // Mock user data without GitHub username
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        githubUsername: null, // No GitHub username
        skills: [
          { skillId: 'skill-1', skill: { id: 'skill-1', name: 'JavaScript', type: 'HARD' }, proficiency: 'INTERMEDIATE' },
          { skillId: 'skill-2', skill: { id: 'skill-2', name: 'Node.js', type: 'HARD' }, proficiency: 'INTERMEDIATE' }
        ],
        resumes: []
      };

      // Mock job data
      const mockJob = {
        id: mockJobId,
        title: 'Backend Developer',
        company: 'Tech Corp',
        location: 'Remote',
        salary: 85000,
        jobType: 'Full-time',
        remote: true,
        experienceLevel: 'MID',
        requiredSkills: ['JavaScript', 'Node.js', 'Python']
      };

      // Mock Prisma service responses
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.job.findUnique.mockResolvedValue(mockJob);
      // Mock job skills for skill matching
      prismaService.jobSkill.findMany.mockResolvedValue([
        { skill: { name: 'JavaScript' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'Node.js' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'Python' }, isRequired: true, weight: 1.0 }
      ]);

      // GitHub service should not be called when there's no GitHub username
      githubService.extractSkillsFromProfile.mockResolvedValue([]);

      // Call the method
      const result = await service.calculateJobMatchScore(mockUserId, mockJobId);

      // Assertions
      expect(githubService.extractSkillsFromProfile).not.toHaveBeenCalled();

      // Should still work with just resume skills
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('Node.js');
      expect(result.missingSkills).toContain('Python');
    });

    it('should handle errors in GitHub service gracefully', async () => {
      // Mock user data with GitHub username
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        githubUsername: 'testuser',
        skills: [
          { skillId: 'skill-1', skill: { id: 'skill-1', name: 'JavaScript', type: 'HARD' }, proficiency: 'INTERMEDIATE' }
        ],
        resumes: []
      };

      // Mock job data
      const mockJob = {
        id: mockJobId,
        title: 'Frontend Developer',
        company: 'Tech Corp',
        location: 'Remote',
        salary: 75000,
        jobType: 'Full-time',
        remote: true,
        experienceLevel: 'MID',
        requiredSkills: ['JavaScript', 'React', 'TypeScript']
      };

      // Mock Prisma service responses
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.job.findUnique.mockResolvedValue(mockJob);
      // Mock job skills for skill matching
      prismaService.jobSkill.findMany.mockResolvedValue([
        { skill: { name: 'JavaScript' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'React' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'TypeScript' }, isRequired: true, weight: 1.0 }
      ]);

      // Mock GitHub service to throw an error
      githubService.extractSkillsFromProfile.mockRejectedValue(
        new Error('GitHub API error')
      );

      // Call the method - should not throw but handle gracefully
      const result = await service.calculateJobMatchScore(mockUserId, mockJobId);

      // Even with GitHub error, should still work with resume data
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.missingSkills).toContain('React');
      expect(result.missingSkills).toContain('TypeScript');
    });

    it('should calculate accurate skill match scores with GitHub data', async () => {
      // Mock user data with GitHub username
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        githubUsername: 'testuser',
        skills: [
          { skillId: 'skill-1', skill: { id: 'skill-1', name: 'JavaScript', type: 'HARD' }, proficiency: 'INTERMEDIATE' }
        ], // Only JS from resume
        resumes: []
      };

      // Mock job requiring multiple skills
      const mockJob = {
        id: mockJobId,
        title: 'Full Stack Developer',
        company: 'Tech Corp',
        location: 'Remote',
        salary: 85000,
        jobType: 'Full-time',
        remote: true,
        experienceLevel: 'MID'
      };

      // Mock Prisma service responses
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.job.findUnique.mockResolvedValue(mockJob);
      // Mock job skills for skill matching
      prismaService.jobSkill.findMany.mockResolvedValue([
        { skill: { name: 'JavaScript' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'Node.js' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'React' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'TypeScript' }, isRequired: true, weight: 1.0 },
        { skill: { name: 'Python' }, isRequired: true, weight: 1.0 }
      ]);

      // Mock GitHub service to show additional skills
      githubService.extractSkillsFromProfile.mockResolvedValue([
        { name: 'JavaScript', proficiency: 'EXPERT', confidence: 0.9, evidence: ['repo1', 'repo2'] },
        { name: 'Node.js', proficiency: 'INTERMEDIATE', confidence: 0.7, evidence: ['backend-repo'] },
        { name: 'React', proficiency: 'BEGINNER', confidence: 0.6, evidence: ['frontend-repo'] },
        { name: 'TypeScript', proficiency: 'BEGINNER', confidence: 0.5, evidence: ['ts-project'] }
        // Note: No Python in GitHub
      ]);

      // Call the method
      const result = await service.calculateJobMatchScore(mockUserId, mockJobId);

      // With resume (JS) + GitHub (JS, Node.js, React, TS) = 4/5 skills matched
      // Proficiency-weighted score:
      //   JavaScript: max(INTERMEDIATE from resume, EXPERT from GitHub) = EXPERT -> 1.0
      //   Node.js: INTERMEDIATE from GitHub -> 0.66
      //   React: BEGINNER from GitHub -> 0.33
      //   TypeScript: BEGINNER from GitHub -> 0.33
      //   Python: 0
      //   Matched weight = 1.0 + 0.66 + 0.33 + 0.33 = 2.32
      //   Total weight = 5
      //   Skill match score = (2.32 / 5) * 100 = 46.4
      //   Explanation skill score = 46.4 / 100 = 0.464
      expect(result.matchedSkills).toEqual(
        expect.arrayContaining(['JavaScript', 'Node.js', 'React', 'TypeScript'])
      );
      expect(result.missingSkills).toEqual(['Python']);

      // Skill score should be 0.464 (based on weighting)
      expect(result.explanation.skill).toBeCloseTo(0.464, 1);
    });
  });

  describe('generateExplanation with GitHub data', () => {
    it('should generate appropriate explanations when GitHub data is available', () => {
      const skillMatch = {
        score: 80, // 80% match
        matchedSkills: ['JavaScript', 'Node.js', 'React'],
        missingSkills: ['Python'],
        skillGapAnalysis: {
          criticalMissing: ['Python'],
          niceToHaveMissing: []
        }
      };

      const explanation = service['generateExplanation'](
        {
          skill: scoreMatch.score,
          experience: 80,
          location: 100,
          salary: 90,
          jobType: 100,
          remote: 100
        },
        skillMatch
      );

      expect(explanation).toContain('skill match');
      expect(explanation).toContain('JavaScript, Node.js, React');
      expect(explanation).toContain('Python');
    });
  });
});