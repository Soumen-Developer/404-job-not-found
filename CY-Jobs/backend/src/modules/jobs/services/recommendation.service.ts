import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobService } from '../job.service';
import { GithubService } from './github.service';
import { User } from '@prisma/client';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  skills: Array<{
    id: string;
    name: string;
    type: string;
    proficiency: string; // BEGINNER, INTERMEDIATE, EXPERT
  }>;
  resumes: Array<{
    id: string;
    parsedData: any; // Skills, experience, education from resume parsing
    status: string;
  }>;
  // Preferences could be stored in user profile or separate table
  preferences?: {
    preferredLocation?: string[];
    preferredJobTypes?: string[]; // FULL_TIME, PART_TIME, CONTRACT, INTERN
    preferredRemote?: boolean;
    salaryExpectationMin?: number;
    salaryExpectationMax?: number;
    experienceLevel?: string; // ENTRY, MID, SENIOR, EXECUTIVE
  };
  // GitHub profile data
  githubUsername?: string;
  githubProfile?: any;
  githubRepos?: any[];
}

interface JobMatchScore {
  jobId: string;
  matchScore: number; // 0-100
  skillMatchScore: number; // 0-100
  experienceMatchScore: number; // 0-100
  locationMatchScore: number; // 0-100
  salaryMatchScore: number; // 0-100
  jobTypeMatchScore: number; // 0-100
  remoteMatchScore: number; // 0-100
  explanation: string;
  matchedSkills: string[]; // Skill names that match
  missingSkills: string[]; // Required skills user doesn't have
  skillGapAnalysis: {
    criticalMissing: string[]; // Required skills missing
    niceToHaveMissing: string[]; // Preferred skills missing
  };
}

interface RecommendationFilter {
  limit?: number;
  minScore?: number;
  location?: string[];
  jobType?: string[];
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string[];
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobService: JobService,
    private readonly githubService: GithubService,
  ) {}

  /**
   * Get comprehensive user profile including skills, resumes, and preferences
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        resumes: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Extract skills with proficiency
    const userSkills = user.skills.map((us: any) => ({
      id: us.skillId,
      name: us.skill.name,
      type: us.skill.type || 'UNKNOWN',
      proficiency: us.proficiency || 'BEGINNER',
    }));

    // For now, we'll assume preferences are stored separately or can be inferred
    // In a real implementation, you might have a UserPreference table
    const preferences = {
      preferredLocation: [], // Would come from user profile or settings
      preferredJobTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
      preferredRemote: false,
      salaryExpectationMin: 0,
      salaryExpectationMax: 999999,
      experienceLevel: 'ENTRY',
    };

    // Fetch GitHub data if username exists
    let githubData = null;
    if (user.githubUsername) {
      try {
        const [githubProfile, githubRepos] = await Promise.all([
          this.githubService.getUserProfile(user.githubUsername),
          this.githubService.getUserRepos(user.githubUsername),
        ]);
        githubData = { profile: githubProfile, repos: githubRepos };
      } catch (error: any) {
        console.warn(`Failed to fetch GitHub data for user ${userId}:`, error.message);
        // Continue without GitHub data
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      skills: userSkills,
      resumes: user.resumes.map(r => ({
        id: r.id,
        parsedData: r.parsedData,
        status: r.status,
      })),
      ...(user as any).preferences && { preferences: (user as any).preferences },
      preferences,
      // GitHub profile data
      githubUsername: user.githubUsername,
      githubData,
    };
  }

  /**
   * Extract skills from resume parsed data
   * This would depend on the structure of your parsed resume data
   */
  extractSkillsFromResume(resumeData: any): Array<{ name: string; proficiency: string }> {
    const skills: Array<{ name: string; proficiency: string }> = [];

    // This is a placeholder - actual implementation depends on your resume parsing structure
    if (resumeData && typeof resumeData === 'object') {
      // Extract skills from various possible locations in parsed data
      if (resumeData.skills && Array.isArray(resumeData.skills)) {
        resumeData.skills.forEach((skill: any) => {
          if (typeof skill === 'string') {
            skills.push({ name: skill, proficiency: 'INTERMEDIATE' }); // Default assumption
          } else if (skill && typeof skill === 'object') {
            skills.push({
              name: skill.name || skill.skill || '',
              proficiency: skill.proficiency || skill.level || 'INTERMEDIATE',
            });
          }
        });
      }

      // Also check for skills in experience descriptions
      if (resumeData.experience && Array.isArray(resumeData.experience)) {
        resumeData.experience.forEach((exp: any) => {
          // Extract skills from description or technologies used
          if (exp.technologies && Array.isArray(exp.technologies)) {
            exp.technologies.forEach((tech: string) => {
              skills.push({ name: tech, proficiency: 'INTERMEDIATE' });
            });
          }
        });
      }
    }

    // Deduplicate skills by name, keeping highest proficiency
    const skillMap = new Map<string, string>();
    skills.forEach(skill => {
      const current = skillMap.get(skill.name);
      if (!current || this.isHigherProficiency(skill.proficiency, current)) {
        skillMap.set(skill.name, skill.proficiency);
      }
    });

    return Array.from(skillMap.entries()).map(([name, proficiency]) => ({
      name,
      proficiency,
    }));
  }

  private isHigherProficiency(p1: string, p2: string): boolean {
    const levels = { BEGINNER: 1, INTERMEDIATE: 2, EXPERT: 3 };
    return (levels[p1 as keyof typeof levels] || 0) > (levels[p2 as keyof typeof levels] || 0);
  }

  /**
   * Get comprehensive user skills including those from resume
   */
  async getAllUserSkills(userId: string): Promise<Array<{ name: string; proficiency: string }>> {
    const profile = await this.getUserProfile(userId);
    let allSkills = [...profile.skills.map(s => ({
      name: s.name,
      proficiency: s.proficiency,
    }))];

    // Add skills from resumes
    for (const resume of profile.resumes) {
      if (resume.parsedData && resume.status === 'COMPLETED') {
        const resumeSkills = this.extractSkillsFromResume(resume.parsedData);
        allSkills = [...allSkills, ...resumeSkills];
      }
    }

    // Add skills from GitHub profile if available
    if (profile.githubUsername) {
      try {
        const githubSkills = await this.githubService.extractSkillsFromProfile(profile.githubUsername);
        allSkills = [...allSkills, ...githubSkills];
      } catch (error: any) {
        console.warn(`Failed to extract skills from GitHub profile for user ${userId}:`, error.message);
        // Continue without GitHub skills rather than failing
      }
    }

    // Deduplicate again, keeping highest proficiency
    const skillMap = new Map<string, string>();
    allSkills.forEach(skill => {
      const current = skillMap.get(skill.name);
      if (!current || this.isHigherProficiency(skill.proficiency, current)) {
        skillMap.set(skill.name, skill.proficiency);
      }
    });

    return Array.from(skillMap.entries()).map(([name, proficiency]) => ({
      name,
      proficiency,
    }));
  }

  /**
   * Calculate skill match between user and job
   */
  async calculateSkillMatch(
    userSkills: Array<{ name: string; proficiency: string }>,
    jobId: string,
  ): Promise<{
    score: number; // 0-100
    matchedSkills: string[];
    missingSkills: string[];
    skillGapAnalysis: {
      criticalMissing: string[];
      niceToHaveMissing: string[];
    };
  }> {
    // Get job skills with requirement levels
    const jobSkills = await this.prisma.jobSkill.findMany({
      where: { jobId },
      include: {
        skill: true,
      },
    });

    if (jobSkills.length === 0) {
      return {
        score: 50, // Neutral score when no skill requirements
        matchedSkills: [],
        missingSkills: [],
        skillGapAnalysis: {
          criticalMissing: [],
          niceToHaveMissing: [],
        },
      };
    }

    // Create user skills map for quick lookup
    const userSkillMap = new Map<string, string>();
    userSkills.forEach(us => {
      userSkillMap.set(us.name.toLowerCase(), us.proficiency);
    });

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    // Process each job skill requirement
    for (const jobSkill of jobSkills) {
      const skillName = jobSkill.skill.name.toLowerCase();
      const isRequired = jobSkill.isRequired;

      const weight = jobSkill.weight || 1.0;

      totalWeight += weight;

      const userProficiency = userSkillMap.get(skillName);

      if (userProficiency) {
        // User has this skill, calculate proficiency match
        const proficiencyScore = this.calculateProficiencyMatch(userProficiency);
        matchedWeight += weight * proficiencyScore;
        matchedSkills.push(jobSkill.skill.name);
      } else if (isRequired) {
        // Required skill that user doesn't have
        missingSkills.push(jobSkill.skill.name);
      }
      // Optional skills that user doesn't have don't count against them as much
    }

    // Calculate skill match score (0-100)
    const skillMatchScore = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

    // Categorize missing skills
    const criticalMissing = missingSkills.filter(skillName =>
      jobSkills.some(js => js.skill.name.toLowerCase() === skillName.toLowerCase() && js.isRequired)
    );
    const niceToHaveMissing = missingSkills.filter(skillName =>
      !jobSkills.some(js => js.skill.name.toLowerCase() === skillName.toLowerCase() && js.isRequired)
    );

    return {
      score: Math.round(skillMatchScore * 100) / 100,
      matchedSkills,
      missingSkills,
      skillGapAnalysis: {
        criticalMissing,
        niceToHaveMissing: niceToHaveMissing,
      },
    };
  }

  private calculateProficiencyMatch(proficiency: string): number {
    switch (proficiency.toUpperCase()) {
      case 'EXPERT':
        return 1.0;
      case 'INTERMEDIATE':
        return 0.66;
      case 'BEGINNER':
      default:
        return 0.33;
    }
  }

  /**
   * Calculate job match score between user and job
   * @param userId User ID
   * @param jobId Job ID
   * @returns Object containing match score and details
   */
  async calculateJobMatchScore(
    userId: string,
    jobId: string,
  ): Promise<{
    matchedSkills: string[];
    missingSkills: string[];
    skillGapAnalysis: {
      criticalMissing: string[];
      niceToHaveMissing: string[];
    };
    explanation: {
      skill: number; // 0-1 scale
    };
  }> {
    // Get user profile and skills
    const profile = await this.getUserProfile(userId);
    const userSkills = await this.getAllUserSkills(userId);

    // Get job details
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Calculate skill match
    const skillMatch = await this.calculateSkillMatch(userSkills, job.id);

    // Convert score from 0-100 to 0-1 scale for explanation
    const skillScore = skillMatch.score / 100;

    return {
      matchedSkills: skillMatch.matchedSkills,
      missingSkills: skillMatch.missingSkills,
      skillGapAnalysis: skillMatch.skillGapAnalysis,
      explanation: {
        skill: skillScore,
      },
    };
  }

  /**
   * Calculate experience match based on resume and job requirements
   */
  async calculateExperienceMatch(
    userId: string,
    jobId: string,
  ): Promise<number> {
    // Get user's resume data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: {
          where: {
            status: 'COMPLETED',
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 1, // Get most recent completed resume
        },
      },
    });

    if (!user || !user.resumes || user.resumes.length === 0) {
      return 50; // Neutral score if no resume data
    }

    const resume = user.resumes[0];
    if (!resume.parsedData) {
      return 50; // Neutral score if no parsed data
    }

    // Get job details
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return 0;
    }

    // Extract years of experience from resume
    const resumeExperience = this.extractYearsOfExperience(resume.parsedData);

    // Get required experience level from job
    const requiredExperienceLevel = job.experienceLevel || 'MID';

    // Map experience levels to years
    const experienceLevels: Record<string, { min: number, max: number }> = {
      ENTRY: { min: 0, max: 2 },
      MID: { min: 2, max: 5 },
      SENIOR: { min: 5, max: 10 },
      EXECUTIVE: { min: 10, max: 20 },
    };

    const requiredRange = experienceLevels[requiredExperienceLevel] || { min: 2, max: 5 };

    // Calculate match based on overlap
    if (resumeExperience >= requiredRange.min && resumeExperience <= requiredRange.max) {
      return 100; // Perfect match
    } else if (resumeExperience < requiredRange.min) {
      // Below required - calculate how close
      const gap = requiredRange.min - resumeExperience;
      const penalty = Math.min(gap / requiredRange.min * 50, 50); // Max 50 point penalty
      return Math.max(50 - penalty, 0);
    } else {
      // Above required - slight bonus but cap it
      const bonus = Math.min((resumeExperience - requiredRange.max) / 10 * 20, 20); // Max 20 point bonus
      return Math.min(100 + bonus, 120); // Cap at 120 but will normalize later
    }
  }

  private extractYearsOfExperience(resumeData: any): number {
    // Default to 0 if we can't determine
    if (!resumeData || typeof resumeData !== 'object') {
      return 0;
    }

    // Try to get from explicit field
    if (resumeData.yearsOfExperience !== undefined) {
      return Math.max(0, parseFloat(resumeData.yearsOfExperience));
    }

    // Try to calculate from work history
    if (resumeData.experience && Array.isArray(resumeData.experience)) {
      let totalMonths = 0;
      const currentDate = new Date();

      for (const exp of resumeData.experience) {
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        // Try different date formats
        if (exp.startDate) {
          startDate = new Date(exp.startDate);
        } else if (exp.from) {
          startDate = new Date(exp.from);
        }

        if (exp.endDate) {
          endDate = new Date(exp.endDate);
        } else if (exp.to) {
          endDate = new Date(exp.to);
        } else if (exp.current === true) {
          endDate = currentDate;
        }

        if (startDate && !isNaN(startDate.getTime())) {
          if (!endDate || isNaN(endDate.getTime())) {
            endDate = currentDate;
          }

          if (!isNaN(endDate.getTime())) {
            const diffTime = endDate.getTime() - startDate.getTime();
            const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Approximate months per day
            totalMonths += Math.max(0, diffMonths);
          }
        }
      }

      return Math.max(0, totalMonths / 12);
    }

    return 0;
  }

  /**
   * Calculate location match
   */
  calculateLocationMatch(
    userPreferredLocations: string[] | undefined,
    jobLocation: string | undefined,
  ): number {
    if (!jobLocation) {
      return 50; // Neutral if no location specified
    }

    if (!userPreferredLocations || userPreferredLocations.length === 0) {
      return 75; // Slightly positive if no preference specified
    }

    const jobLocationLower = jobLocation.toLowerCase();

    // Exact match
    for (const prefLoc of userPreferredLocations) {
      if (prefLoc.toLowerCase() === jobLocationLower) {
        return 100;
      }

      // Partial match (city contains preference or vice versa)
      if (jobLocationLower.includes(prefLoc.toLowerCase()) ||
          prefLoc.toLowerCase().includes(jobLocationLower)) {
        return 80;
      }
    }

    // Check for remote keyword
    if (jobLocationLower.includes('remote')) {
      return 90; // Remote jobs are generally good
    }

    return 30; // Location mismatch penalty
  }

  /**
   * Calculate salary match
   */
  calculateSalaryMatch(
    userMin: number | undefined,
    userMax: number | undefined,
    jobMin: number | undefined,
    jobMax: number | undefined,
  ): number {
    // If no user preferences, return neutral
    if ((userMin === undefined && userMax === undefined) ||
        (jobMin === undefined && jobMax === undefined)) {
      return 50;
    }

    // Use defaults if only one bound is provided
    const effUserMin = userMin ?? 0;
    const effUserMax = userMax ?? 999999;
    const effJobMin = jobMin ?? 0;
    const effJobMax = jobMax ?? 999999;

    // Check for overlap
    const overlapMin = Math.max(effUserMin, effJobMin);
    const overlapMax = Math.min(effUserMax, effJobMax);

    if (overlapMax >= overlapMin) {
      // There's overlap - calculate how good the match is
      const userRange = effUserMax - effUserMin;
      const jobRange = effJobMax - effJobMin;
      const overlapRange = overlapMax - overlapMin;

      // Avoid division by zero
      if (userRange === 0 && jobRange === 0) {
        return 100; // Both fixed values and they match
      } else if (userRange === 0) {
        // User has fixed salary, check if job range includes it
        return (effUserMin >= effJobMin && effUserMax <= effJobMax) ? 100 : 0;
      } else if (jobRange === 0) {
        // Job has fixed salary, check if user range includes it
        return (effJobMin >= effUserMin && effJobMax <= effUserMax) ? 100 : 0;
      } else {
        // Both have ranges - calculate overlap ratio
        const overlapRatio = overlapRange / Math.min(userRange, jobRange);
        return Math.min(100, 50 + (overlapRatio * 50)); // 50-100 based on overlap
      }
    } else {
      // No overlap - calculate gap
      if (effUserMax < effJobMin) {
        // User max below job min
        const gap = effJobMin - effUserMax;
        const penalty = Math.min(gap / 10000 * 50, 50); // Scale penalty
        return Math.max(50 - penalty, 0);
      } else {
        // User min above job max
        const gap = effUserMin - effJobMax;
        const penalty = Math.min(gap / 10000 * 50, 50); // Scale penalty
        return Math.max(50 - penalty, 0);
      }
    }
  }

  /**
   * Calculate job type match
   */
  calculateJobTypeMatch(
    userPreferredTypes: string[] | undefined,
    jobType: string | undefined,
  ): number {
    if (!jobType) {
      return 50; // Neutral if not specified
    }

    if (!userPreferredTypes || userPreferredTypes.length === 0) {
      return 75; // Slightly positive if no preference
    }

    const jobTypeUpper = jobType.toUpperCase();

    for (const prefType of userPreferredTypes) {
      if (prefType.toUpperCase() === jobTypeUpper) {
        return 100;
      }
    }

    return 30; // Penalty for mismatch
  }

  /**
   * Calculate remote work match
   */
  calculateRemoteMatch(
    userPrefersRemote: boolean | undefined,
    jobIsRemote: boolean | undefined,
  ): number {
    if (jobIsRemote === undefined) {
      return 50; // Neutral if not specified
    }

    if (userPrefersRemote === undefined) {
      return jobIsRemote ? 75 : 50; // Slight preference for remote if unspecified
    }

    if (userPrefersRemote === jobIsRemote) {
      return 100; // Perfect match
    } else {
      return 20; // Significant penalty for mismatch
    }
  }

  /**
   * Generate explanation for the match score
   */
  generateExplanation(
    scores: {
      skill: number,
      experience: number,
      location: number,
      salary: number,
      jobType: number,
      remote: number,
    },
    skillMatch: {
      matchedSkills: string[],
      missingSkills: string[],
      skillGapAnalysis: {
        criticalMissing: string[],
        niceToHaveMissing: string[],
      },
    }
  ): string {
    const explanations = [];

    // Skill explanation
    if (scores.skill >= 80) {
      explanations.push(`Strong skill match (${Math.round(scores.skill)}%)`);
    } else if (scores.skill >= 60) {
      explanations.push(`Good skill match (${Math.round(scores.skill)}%)`);
    } else if (scores.skill >= 40) {
      explanations.push(`Moderate skill match (${Math.round(scores.skill)}%)`);
    } else {
      explanations.push(`Weak skill match (${Math.round(scores.skill)}%)`);
    }

    if (skillMatch.matchedSkills.length > 0) {
      explanations.push(`You have ${skillMatch.matchedSkills.length} matching skills`);
    }

    if (skillMatch.missingSkills.length > 0) {
      explanations.push(`You're missing ${skillMatch.missingSkills.length} required skills`);
    }

    // Experience explanation
    if (scores.experience >= 80) {
      explanations.push(`Experience level is a strong match`);
    } else if (scores.experience >= 60) {
      explanations.push(`Experience level is a good match`);
    } else if (scores.experience >= 40) {
      explanations.push(`Experience level is a moderate match`);
    } else {
      explanations.push(`Experience level may need development`);
    }

    // Location explanation
    if (scores.location >= 80) {
      explanations.push(`Location is an excellent fit`);
    } else if (scores.location >= 60) {
      explanations.push(`Location is a good fit`);
    } else if (scores.location >= 40) {
      explanations.push(`Location is acceptable`);
    } else {
      explanations.push(`Location may not be ideal`);
    }

    // Combine explanations
    if (explanations.length === 0) {
      return "Moderate overall match - consider developing skills in key areas";
    }

    return explanations.join('. ') + '.';
  }

  /**
   * Generate job recommendations for a user
   */
  async getRecommendations(
    userId: string,
    filters: RecommendationFilter = {},
  ): Promise<Array<{
    job: any;
    matchScore: number;
    breakdown: {
      skillMatch: number;
      experienceMatch: number;
      locationMatch: number;
      salaryMatch: number;
      jobTypeMatch: number;
      remoteMatch: number;
    };
    explanation: string;
    matchedSkills: string[];
    missingSkills: string[];
    skillGapAnalysis: {
      criticalMissing: string[];
      niceToHaveMissing: string[];
    };
  }>> {
    try {
      // Get user profile
      const profile = await this.getUserProfile(userId);
      const userSkills = await this.getAllUserSkills(userId);

      // Extract top skills to fetch fresh, tailored jobs from external APIs
      const topSkills = userSkills
        .sort((a, b) => this.calculateProficiencyMatch(b.proficiency) - this.calculateProficiencyMatch(a.proficiency))
        .slice(0, 3)
        .map(s => s.name)
        .join(' ');

      if (topSkills) {
        // Fetch fresh jobs tailored to user's skills
        const preferredLocation = profile.preferences?.preferredLocation?.[0] || 'India';
        await this.jobService.fetchTailoredJobs(topSkills, preferredLocation);
      }

      // Build where clause for job search
      const where: any = {};

      // Apply filters
      if (filters.location && filters.location.length > 0) {
        where.OR = filters.location.map(loc => ({
          location: { contains: loc, mode: 'insensitive' }
        }));
      }

      if (filters.jobType && filters.jobType.length > 0) {
        where.employmentType = { in: filters.jobType };
      }

      if (filters.remote !== undefined) {
        where.remote = filters.remote;
      }

      if (filters.salaryMin !== undefined) {
        where.salaryMin = { gte: filters.salaryMin };
      }

      if (filters.salaryMax !== undefined) {
        where.salaryMax = { lte: filters.salaryMax };
      }

      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        where.experienceLevel = { in: filters.experienceLevel };
      }

      // Get jobs (with limit for performance)
      const limit = filters.limit || 50;
      const jobs = await this.prisma.job.findMany({
        where,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      // Calculate match scores for each job
      const recommendations = [];

      for (const job of jobs) {
        // Calculate individual match components
        const skillMatch = await this.calculateSkillMatch(userSkills, job.id);
        const experienceMatch = await this.calculateExperienceMatch(userId, job.id);
        const locationMatch = this.calculateLocationMatch(
          [], // Would come from user preferences in a real implementation
          job.location || undefined
        );
        const salaryMatch = this.calculateSalaryMatch(
          0, // Would come from user preferences
          999999,
          job.salaryMin || undefined,
          job.salaryMax || undefined
        );
        const jobTypeMatch = this.calculateJobTypeMatch(
          [], // Would come from user preferences
          job.employmentType || undefined
        );
        const remoteMatch = this.calculateRemoteMatch(
          false, // Would come from user preferences
          job.remote === null ? undefined : job.remote
        );

        // Calculate weighted total score
        const weights = {
          skill: 0.35,      // Skills are most important
          experience: 0.20,  // Experience is important
          location: 0.15,    // Location matters
          salary: 0.10,      // Salary is a factor
          jobType: 0.10,     // Job type preference
          remote: 0.10,      // Remote work preference
        };

        const totalScore =
          (skillMatch.score * weights.skill) +
          (experienceMatch * weights.experience) +
          (locationMatch * weights.location) +
          (salaryMatch * weights.salary) +
          (jobTypeMatch * weights.jobType) +
          (remoteMatch * weights.remote);

        // Only include if above minimum threshold
        const minScore = filters.minScore || 0;
        if (totalScore >= minScore) {
          recommendations.push({
            job,
            matchScore: Math.round(totalScore * 100) / 100,
            breakdown: {
              skillMatch: Math.round(skillMatch.score * 100) / 100,
              experienceMatch: Math.round(experienceMatch * 100) / 100,
              locationMatch: Math.round(locationMatch * 100) / 100,
              salaryMatch: Math.round(salaryMatch * 100) / 100,
              jobTypeMatch: Math.round(jobTypeMatch * 100) / 100,
              remoteMatch: Math.round(remoteMatch * 100) / 100,
            },
            explanation: this.generateExplanation(
              {
                skill: skillMatch.score,
                experience: experienceMatch,
                location: locationMatch,
                salary: salaryMatch,
                jobType: jobTypeMatch,
                remote: remoteMatch,
              },
              skillMatch
            ),
            matchedSkills: skillMatch.matchedSkills,
            missingSkills: skillMatch.missingSkills,
            skillGapAnalysis: skillMatch.skillGapAnalysis
          });
        }
      }

      // Sort by match score descending
      recommendations.sort((a, b) => b.matchScore - a.matchScore);

      // Apply final limit
      const finalLimit = filters.limit || 10;
      return recommendations.slice(0, finalLimit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error(`Failed to generate recommendations: ${(error as any).message}`);
    }
  }

  /**
   * Alternative method using the job service for searching
   */
  async getRecommendationsViaJobService(
    userId: string,
    filters: RecommendationFilter = {},
  ): Promise<any[]> {
    try {
      // Get user profile and skills
      const profile = await this.getUserProfile(userId);
      const userSkills = await this.getAllUserSkills(userId);

      // Convert recommendation filters to job service format
      const jobFilters: any = {
        search: '',
        location: undefined,
        remote: undefined,
        employmentType: undefined,
        experienceLevel: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        source: undefined,
      };

      // Map filters appropriately
      if (filters.location && filters.location.length > 0) {
        // For simplicity, use first location - in reality you'd want OR logic
        jobFilters.location = filters.location[0];
      }

      if (filters.jobType && filters.jobType.length > 0) {
        jobFilters.employmentType = filters.jobType[0];
      }

      if (filters.remote !== undefined) {
        jobFilters.remote = filters.remote;
      }

      if (filters.salaryMin !== undefined) {
        jobFilters.salaryMin = filters.salaryMin;
      }

      if (filters.salaryMax !== undefined) {
        jobFilters.salaryMax = filters.salaryMax;
      }

      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        jobFilters.experienceLevel = filters.experienceLevel[0];
      }

      // Get jobs from service
      const jobsResult = await this.jobService.getJobs({
        q: '',
        location: jobFilters.location || '',
        employmentType: jobFilters.employmentType,
        remote: jobFilters.remote,
        salaryMin: jobFilters.salaryMin,
        salaryMax: jobFilters.salaryMax,
        page: 1,
        limit: 50,
      } as any);

      const jobs = jobsResult.data;

      // Process each job for scoring
      const recommendations = [];

      for (const jobDto of jobs) {
        // Get full job details including skills
        const job = await this.prisma.job.findUnique({
          where: { id: jobDto.id },
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });

        if (!job) continue;

        // Calculate match components (same as above)
        const skillMatch = await this.calculateSkillMatch(userSkills, job.id);
        const experienceMatch = await this.calculateExperienceMatch(userId, job.id);
        const locationMatch = this.calculateLocationMatch(
          [], // Would come from user preferences
          job.location || undefined
        );
        const salaryMatch = this.calculateSalaryMatch(
          0, // Would come from user preferences
          999999,
          job.salaryMin || undefined,
          job.salaryMax || undefined
        );
        const jobTypeMatch = this.calculateJobTypeMatch(
          [], // Would come from user preferences
          job.employmentType || undefined
        );
        const remoteMatch = this.calculateRemoteMatch(
          false, // Would come from user preferences
          job.remote === null ? undefined : job.remote
        );

        // Weighted total score
        const weights = {
          skill: 0.35,
          experience: 0.20,
          location: 0.15,
          salary: 0.10,
          jobType: 0.10,
          remote: 0.10,
        };

        const totalScore =
          (skillMatch.score * weights.skill) +
          (experienceMatch * weights.experience) +
          (locationMatch * weights.location) +
          (salaryMatch * weights.salary) +
          (jobTypeMatch * weights.jobType) +
          (remoteMatch * weights.remote);

        const minScore = filters.minScore || 0;
        if (totalScore >= minScore) {
          recommendations.push({
            job,
            matchScore: Math.round(totalScore * 100) / 100,
            breakdown: {
              skillMatch: Math.round(skillMatch.score * 100) / 100,
              experienceMatch: Math.round(experienceMatch * 100) / 100,
              locationMatch: Math.round(locationMatch * 100) / 100,
              salaryMatch: Math.round(salaryMatch * 100) / 100,
              jobTypeMatch: Math.round(jobTypeMatch * 100) / 100,
              remoteMatch: Math.round(remoteMatch * 100) / 100,
            },
            explanation: this.generateExplanation(
              {
                skill: skillMatch.score,
                experience: experienceMatch,
                location: locationMatch,
                salary: salaryMatch,
                jobType: jobTypeMatch,
                remote: remoteMatch,
              },
              skillMatch
            ),
            matchedSkills: skillMatch.matchedSkills,
            missingSkills: skillMatch.missingSkills,
            skillGapAnalysis: skillMatch.skillGapAnalysis,
          });
        }
      }

      // Sort and limit
      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      const finalLimit = Math.min(filters.limit || 10, recommendations.length);
      return recommendations.slice(0, finalLimit);
    } catch (error) {
      console.error('Error in getRecommendationsViaJobService:', error);
      throw new Error(`Failed to generate recommendations: ${(error as any).message}`);
    }
  }
}