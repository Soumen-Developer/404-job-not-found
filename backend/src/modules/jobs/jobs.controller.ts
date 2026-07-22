import { Controller, Get, Query, Post, Path, Header, SuccessResponse, Route } from 'tsoa';
import { JobService } from './job.service';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobDto } from './dto/job.dto';
import { RecommendationService } from './services/recommendation.service';
import { JobRecommendationsDto } from './dto/job-recommendation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GithubService } from './services/github.service';

@Route('jobs')
export class JobsController extends Controller {
  private jobService: JobService;
  private recommendationService: RecommendationService;

  constructor() {
    super();
    this.jobService = new JobService(); // In a real app, use DI container
    this.recommendationService = new RecommendationService(
      new PrismaService(),
      this.jobService,
      new GithubService()
    ); // In a real app, use DI container
  }

  /**
   * Get jobs with filtering and pagination
   * @param query Query parameters for filtering
   */
  @Get()
  async getJobs(
    @Query() q?: string,
    @Query() location?: string,
    @Query() employmentType?: string,
    @Query() remote?: boolean,
    @Query() salaryMin?: number,
    @Query() salaryMax?: number,
    @Query() sort?: 'relevance' | 'recent' | 'salary',
    @Query() page?: number,
    @Query() limit?: number
  ): Promise<{ data: JobDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 20;
    
    // If user is actively searching, perform a live scrape from the internet
    if (q || location) {
      try {
        console.log(`Live scraping data from internet for query: ${q}, location: ${location}`);
        await this.jobService.fetchTailoredJobs(q || 'developer', location || 'India');
      } catch (err) {
        console.error("Error scraping data from the internet:", err);
      }
    }

    const result = await this.jobService.getJobs({
      search: q,
      location,
      employmentType,
      remote,
      salaryMin,
      salaryMax,
    }, {
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });
    return {
      data: result.data,
      total: result.total,
      page: pageNum,
      limit: limitNum
    };
  }

  /**
   * Get a specific job by ID
   * @param id Job ID
   */
  @Get('{id}')
  async getJob(@Path() id: string): Promise<JobDto> {
    return this.jobService.getJobById(id);
  }

  /**
   * Get personalized job recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @param minScore Minimum match score (0-100)
   */
  @Get('recommendations/{userId}')
  async getJobRecommendations(
    @Path() userId: string,
    @Query() limit: number = 10,
    @Query() minScore: number = 0
  ): Promise<JobRecommendationsDto> {
    const recommendations = await this.recommendationService.getRecommendations(userId, {
      limit,
      minScore
    });

    // Convert to DTO format
    const jobDtos = recommendations.map(rec => ({
      ...rec.job,
      // Exclude description from list view for performance (handled by @Exclude in JobDto)
    }));

    const recommendationDtos = recommendations.map(rec => ({
      job: rec.job,
      matchScore: rec.matchScore,
      skillMatch: rec.breakdown.skillMatch,
      experienceMatch: rec.breakdown.experienceMatch,
      locationMatch: rec.breakdown.locationMatch,
      salaryMatch: rec.breakdown.salaryMatch,
      jobTypeMatch: rec.breakdown.jobTypeMatch,
      remoteMatch: rec.breakdown.remoteMatch,
      explanation: rec.explanation,
      matchedSkills: rec.matchedSkills,
      missingSkills: rec.missingSkills,
      skillGapAnalysis: rec.skillGapAnalysis
    }));

    return {
      recommendations: recommendationDtos,
      totalCount: recommendationDtos.length,
      page: 1,
      limit,
      hasMore: false // Simplified for now - could be enhanced with pagination
    };
  }

  /**
   * Manually trigger job sync from all providers
   * @param query Search query
   * @param location Job location
   */
  @Post('sync')
  @SuccessResponse('202', 'Accepted')
  async syncJobs(
    @Query() query: string = '',
    @Query() location: string = ''
  ): Promise<{ message: string; total: number; saved: number }> {
    // Trigger real sync from all providers with India + US + UK coverage
    const results = await this.jobService.fetchAndStoreJobs({
      adzuna: { country: 'in', page: 1 },
      jooble: { keywords: query || 'developer', location: location || 'India', page: 1 },
      greenhouse: {},
      lever: {},
      remotive: { search: query || 'developer', limit: 20 },
      arbeitnow: { page: 1 },
      jobicy: { geo: location || 'india', industry: 'engineering' },
      serpapi: { q: query || 'software engineer', location: location || 'India' }
    });

    // Also fetch US/UK jobs via Adzuna for international listings
    const intlResults = await this.jobService.fetchAndStoreJobs({
      adzuna: { country: 'us', page: 1 },
      serpapi: { q: query || 'remote developer', location: 'United States' }
    });

    const totalSaved = Object.values(results).reduce((sum, n) => sum + n, 0)
      + Object.values(intlResults).reduce((sum, n) => sum + n, 0);

    return {
      message: `Job sync completed from all real providers.`,
      total: totalSaved,
      saved: totalSaved,
    };
  }
}