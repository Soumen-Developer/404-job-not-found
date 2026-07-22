import { PrismaClient } from '@prisma/client';
import { AdzunaProvider } from './providers/adzuna.provider';
import { JoobleProvider } from './providers/jooble.provider';
import { GreenhouseProvider } from './providers/greenhouse.provider';
import { LeverProvider } from './providers/lever.provider';
import { RemotiveProvider } from './providers/remotive.provider';
import { ArbeitnowProvider } from './providers/arbeitnow.provider';
import { JobicyProvider } from './providers/jobicy.provider';
import { SerpApiGoogleJobsProvider } from './providers/serpapi.provider';
import { NativeScraperProvider } from './providers/native-scraper.provider';
import { ExternalJob } from './dto/external-job.dto';

const prisma = new PrismaClient();

export class JobService {
  private providers: Map<string, any>;

  constructor() {
    this.providers = new Map<string, any>([
      ['adzuna', new AdzunaProvider()],
      ['jooble', new JoobleProvider()],
      ['greenhouse', new GreenhouseProvider()],
      ['lever', new LeverProvider()],
      ['remotive', new RemotiveProvider()],
      ['arbeitnow', new ArbeitnowProvider()],
      ['jobicy', new JobicyProvider()],
      ['serpapi', new SerpApiGoogleJobsProvider()],
      ['native', new NativeScraperProvider()],
    ]);
  }

  /**
   * Fetch jobs from all providers with deduplication
   * @param params - Search parameters to pass to providers
   * @returns Promise of saved job counts per provider
   */
  async fetchAndStoreJobs(params: any = {}): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    for (const [source, provider] of Array.from(this.providers.entries())) {
      try {
        const externalJobs = await provider.fetchJobs(params[source] || {});
        const savedCount = await this.saveJobs(externalJobs);
        results[source] = savedCount;
        console.log(`Successfully saved ${savedCount} jobs from ${source}`);
      } catch (error) {
        console.error(`Failed to fetch jobs from ${source}:`, error);
        results[source] = 0;
      }
    }

    return results;
  }

  /**
   * Save jobs to database with deduplication
   * @param externalJobs - Array of external job objects
   * @returns Number of jobs saved
   */
  private async saveJobs(externalJobs: ExternalJob[]): Promise<number> {
    let savedCount = 0;

    for (const jobData of externalJobs) {
      try {
        // CROSS-PROVIDER DEDUPLICATION LOGIC
        // Instead of only using 'upsert' with externalId, we first check if the exact same job (Title + Company) exists 
        // to prevent duplicating the same job found on two different platforms.
        
        const existingJob = await prisma.job.findFirst({
          where: {
            title: jobData.title,
            company: jobData.company,
          },
        });

        let savedJob: any;

        if (existingJob) {
          // Update the existing job with potentially newer metadata without recreating it
          savedJob = await prisma.job.update({
            where: { id: existingJob.id },
            data: {
              updatedAt: new Date(),
              applyUrl: jobData.applyUrl || existingJob.applyUrl, // overwrite only if missing
              // we don't overwrite source/externalId so it retains its primary identity
            },
          });
        } else {
          // Job is entirely new across all platforms, create safely using upsert (as fallback constraint)
          savedJob = await prisma.job.upsert({
            where: {
              externalId_source: {
                externalId: jobData.externalId || '',
                source: jobData.source,
              },
            },
            update: {
              title: jobData.title,
              company: jobData.company,
              location: jobData.location,
              description: jobData.description,
              applyUrl: jobData.applyUrl,
              metadata: jobData.metadata ? (jobData.metadata as any) : undefined,
              postedAt: jobData.postedAt,
              salaryMin: jobData.salaryMin,
              salaryMax: jobData.salaryMax,
              currency: jobData.currency,
              employmentType: jobData.employmentType,
              remote: jobData.remote,
              experienceLevel: jobData.experienceLevel,
              updatedAt: new Date(),
            },
            create: {
              externalId: jobData.externalId,
              source: jobData.source,
              title: jobData.title,
              company: jobData.company,
              location: jobData.location,
              description: jobData.description,
              applyUrl: jobData.applyUrl,
              metadata: jobData.metadata ? (jobData.metadata as any) : undefined,
              postedAt: jobData.postedAt,
              salaryMin: jobData.salaryMin,
              salaryMax: jobData.salaryMax,
              currency: jobData.currency,
              employmentType: jobData.employmentType,
              remote: jobData.remote,
              experienceLevel: jobData.experienceLevel,
            },
          });
        }

        savedCount++;

        // Link skills to job based on keyword matching in title and description
        await this.linkSkillsToJob(savedJob.id, jobData.title, jobData.description);
      } catch (error) {
        console.error(`Failed to save job ${jobData.externalId}:`, error);
      }
    }

    return savedCount;
  }

  /**
   * Link skills to a job based on keyword matching
   * @param jobId - Job ID
   * @param title - Job title
   * @param description - Job description
   */
  private async linkSkillsToJob(jobId: string, title: string, description: string): Promise<void> {
    const dbSkills = await prisma.skill.findMany();
    const lowerTitle = title.toLowerCase();
    const lowerDescription = description.toLowerCase();

    for (const skill of dbSkills) {
      const skillNameLower = skill.name.toLowerCase();
      const isTitleMatch = lowerTitle.includes(skillNameLower);
      const isDescMatch = lowerDescription.includes(skillNameLower);

      if (isTitleMatch || isDescMatch) {
        // Connect skill to job if not already linked
        await prisma.jobSkill.upsert({
          where: {
            jobId_skillId: {
              jobId,
              skillId: skill.id
            }
          },
          update: {},
          create: {
            jobId,
            skillId: skill.id,
            isRequired: isTitleMatch, // Assume required if mentioned in title
            weight: isTitleMatch ? 1.0 : 0.5,
          }
        });
      }
    }
  }

  /**
   * Get jobs with filtering and pagination
   * @param filters - Filter criteria
   * @param pagination - Pagination options
   * @returns Promise of jobs and total count
   */
  async getJobs(
    filters: {
      search?: string;
      location?: string;
      remote?: boolean;
      employmentType?: string;
      experienceLevel?: string;
      source?: string;
      salaryMin?: number;
      salaryMax?: number;
    },
    pagination: {
      skip?: number;
      take?: number;
    } = {}
  ): Promise<{ data: any[]; total: number }> {
    const where: any = {};

    // Text search
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Location filter
    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    // Remote filter
    if (filters.remote !== undefined) {
      where.remote = filters.remote;
    }

    // Employment type filter
    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }

    // Experience level filter
    if (filters.experienceLevel) {
      where.experienceLevel = filters.experienceLevel;
    }

    // Source filter
    if (filters.source) {
      where.source = filters.source;
    }

    // Salary filters
    if (filters.salaryMin !== undefined) {
      where.salaryMin = { gte: filters.salaryMin };
    }
    if (filters.salaryMax !== undefined) {
      where.salaryMax = { lte: filters.salaryMax };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: {
          postedAt: 'desc',
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      }),
      prisma.job.count({ where })
    ]);

    // Sort Indian jobs to the top
    const sortedJobs = jobs.sort((a, b) => {
      const aIsIndia = a.location?.toLowerCase().includes('india') || a.location?.toLowerCase().includes('bangalore') || a.location?.toLowerCase().includes('pune');
      const bIsIndia = b.location?.toLowerCase().includes('india') || b.location?.toLowerCase().includes('bangalore') || b.location?.toLowerCase().includes('pune');
      
      if (aIsIndia && !bIsIndia) return -1;
      if (!aIsIndia && bIsIndia) return 1;
      return 0; // maintain original `postedAt` descending order for others
    });

    return { data: sortedJobs, total };
  }

  /**
   * Get a single job by ID
   * @param id - Job ID
   * @returns Promise of job or null if not found
   */
  async getJobById(id: string): Promise<any | null> {
    return prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        matches: true,
        savedBy: true,
        applications: true,
      },
    });
  }

  /**
   * Get a job by external ID and source
   * @param externalId - External job ID
   * @param source - Job source
   * @returns Promise of job or null if not found
   */
  async getJobByExternalId(externalId: string, source: string): Promise<any | null> {
    return prisma.job.findFirst({
      where: {
        externalId,
        source,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  /**
   * Fetch tailored jobs from all external APIs based on a specific query and location
   */
  async fetchTailoredJobs(query: string, location: string = 'India'): Promise<Record<string, number>> {
    console.log(`Fetching tailored jobs for query: "${query}", location: "${location}"...`);
    const results = await this.fetchAndStoreJobs({
      adzuna: { country: 'in', page: 1 }, // Adzuna uses a different param structure but we'll let it be for now
      jooble: { keywords: query || 'developer', location: location, page: 1 },
      greenhouse: {},
      lever: {},
      remotive: { search: query || 'developer', limit: 20 },
      arbeitnow: { page: 1 },
      jobicy: { geo: location || 'india', industry: 'engineering' },
      serpapi: { q: query, location: location },
      native: { query, location }
    });
    
    // Also try an international fetch if needed
    const intlResults = await this.fetchAndStoreJobs({
      serpapi: { q: query, location: 'Remote' }
    });

    return { ...results, ...intlResults };
  }
}