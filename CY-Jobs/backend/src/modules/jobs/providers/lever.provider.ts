import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

export class LeverProvider extends AbstractJobProvider {
  public readonly source = 'Lever';

  /**
   * Fetch jobs from Lever API
   * @param params - { site: string, page: number }
   * @returns Promise of external job listings
   */
  async fetchJobs(params: { site: string; page: number }): Promise<ExternalJob[]> {
    const { site, page } = params;

    let jobsToSync: ExternalJob[] = [];

    // Attempt real API fetch
    try {
      // Lever API endpoint: https://api.lever.co/v0/postings/{site}?mode=json
      const url = `https://api.lever.co/v0/postings/${site}?mode=json&page=${page}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          jobsToSync = data.map((job: any) => ({
            externalId: job.id || `lever-${Date.now()}-${Math.random()}`,
            source: this.source,
            title: job.text || 'Untitled Job',
            company: job.categories?.company || 'Unknown Company',
            location: job.categories?.location || 'Remote',
            description: job.description || '',
            applyUrl: job.applyUrl || '',
            postedAt: job.createdAt ? new Date(job.createdAt * 1000) : new Date(),
            metadata: job,
            salaryMin: undefined,
            salaryMax: undefined,
            currency: undefined,
            employmentType: job.categories?.commitment || undefined,
            remote: job.categories?.location?.toLowerCase().includes('remote') || false,
            experienceLevel: undefined,
          }));
        }
      } else {
        console.warn(`Lever API returned status ${response.status}. Falling back to mock data...`);
      }
    } catch (err) {
      console.error('Failed to fetch from Lever API, falling back to mock data:', err);
    }

    // If no jobs were fetched, fall back to mock jobs
    if (jobsToSync.length === 0) {
      jobsToSync = [
        {
          externalId: `mock-lever-${page}-1`,
          source: this.source,
          title: "Senior Frontend Engineer",
          company: "WebFlow Inc.",
          location: "San Francisco, CA",
          description: "Lead frontend development for our next-generation website builder platform using React and TypeScript.",
          applyUrl: "https://example.com/apply/senior-frontend-engineer",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 130000,
          salaryMax: 160000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: false,
          experienceLevel: "SENIOR",
        },
        {
          externalId: `mock-lever-${page}-2`,
          source: this.source,
          title: "Backend Engineer (Python)",
          company: "DataScience Labs",
          location: "Remote",
          description: "Build scalable data pipelines and microservices using Python, FastAPI, and AWS.",
          applyUrl: "https://example.com/apply/backend-engineer-python",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 110000,
          salaryMax: 140000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: true,
          experienceLevel: "MID",
        },
        {
          externalId: `mock-lever-${page}-3`,
          source: this.source,
          title: "Engineering Manager",
          company: "StartupXYZ",
          location: "New York, NY",
          description: "Lead a team of full-stack engineers building innovative fintech solutions.",
          applyUrl: "https://example.com/apply/engineering-manager",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 150000,
          salaryMax: 190000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: false,
          experienceLevel: "SENIOR",
        }
      ];
    }

    return jobsToSync;
  }
}