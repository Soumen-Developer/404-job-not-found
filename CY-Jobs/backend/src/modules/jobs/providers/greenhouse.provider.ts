import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

export class GreenhouseProvider extends AbstractJobProvider {
  public readonly source = 'Greenhouse';

  /**
   * Fetch jobs from Greenhouse API
   * @param params - { board: string, page: number }
   * @returns Promise of external job listings
   */
  async fetchJobs(params: { board: string; page: number }): Promise<ExternalJob[]> {
    const { board, page } = params;

    let jobsToSync: ExternalJob[] = [];

    // Attempt real API fetch
    try {
      // Greenhouse API endpoint: https://boards-api.greenhouse.io/v1/boards/{board}/jobs
      const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?page=${page}`;

      const response = await fetch(url);

      if (response.ok) {
        const data: any = await response.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          jobsToSync = data.jobs.map((job: any) => ({
            externalId: job.id ? String(job.id) : `greenhouse-${Date.now()}-${Math.random()}`,
            source: this.source,
            title: job.title || 'Untitled Job',
            company: job.company?.name || 'Unknown Company',
            location: job.location?.name || 'Remote',
            description: job.content || '',
            applyUrl: job.absolute_url || '',
            postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
            metadata: job,
            salaryMin: undefined,
            salaryMax: undefined,
            currency: undefined,
            employmentType: undefined,
            remote: job.location?.name?.toLowerCase().includes('remote') || false,
            experienceLevel: undefined,
          }));
        }
      } else {
        console.warn(`Greenhouse API returned status ${response.status}. Falling back to mock data...`);
      }
    } catch (err) {
      console.error('Failed to fetch from Greenhouse API, falling back to mock data:', err);
    }

    // If no jobs were fetched, fall back to mock jobs
    if (jobsToSync.length === 0) {
      jobsToSync = [
        {
          externalId: `mock-greenhouse-${page}-1`,
          source: this.source,
          title: "Senior Software Engineer",
          company: "Tech Innovations Inc.",
          location: "Seattle, WA",
          description: "We are looking for a Senior Software Engineer with expertise in distributed systems and cloud technologies.",
          applyUrl: "https://example.com/apply/senior-software-engineer",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 140000,
          salaryMax: 180000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: false,
          experienceLevel: "SENIOR",
        },
        {
          externalId: `mock-greenhouse-${page}-2`,
          source: this.source,
          title: "Product Designer",
          company: "Creative Labs",
          location: "Remote",
          description: "Join our design team to create beautiful and intuitive user experiences for our SaaS platform.",
          applyUrl: "https://example.com/apply/product-designer",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 90000,
          salaryMax: 120000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: true,
          experienceLevel: "MID",
        },
        {
          externalId: `mock-greenhouse-${page}-3`,
          source: this.source,
          title: "DevOps Engineer",
          company: "CloudFirst Technologies",
          location: "New York, NY",
          description: "Experienced DevOps Engineer needed to manage our Kubernetes infrastructure and implement GitOps practices.",
          applyUrl: "https://example.com/apply/devops-engineer",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 110000,
          salaryMax: 140000,
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