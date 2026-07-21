import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

export class JoobleProvider extends AbstractJobProvider {
  public readonly source = 'Jooble';

  /**
   * Fetch jobs from Jooble API
   * @param params - { keywords: string, location?: string, page: number }
   * @returns Promise of external job listings
   */
  async fetchJobs(params: { keywords: string; location?: string; page: number }): Promise<ExternalJob[]> {
    const { keywords, location, page } = params;
    const apiKey = process.env.JOBLE_API_KEY;

    let jobsToSync: ExternalJob[] = [];

    // Attempt real API fetch if credentials are provided
    if (apiKey) {
      try {
        // Jooble API endpoint: https://jooble.org/api/{apiKey}
        const url = `https://jooble.org/api/${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keywords: keywords,
            location: location || '',
            page: page,
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.jobs && Array.isArray(data.jobs)) {
            jobsToSync = data.jobs.map((job: any) => ({
              externalId: job.id || `jooble-${Date.now()}-${Math.random()}`,
              source: this.source,
              title: job.title || 'Untitled Job',
              company: job.company || 'Unknown Company',
              location: job.location || 'Remote',
              description: job.snippet || '',
              applyUrl: job.link || '',
              postedAt: job.updated ? new Date(job.updated) : new Date(),
              metadata: job,
              salaryMin: undefined,
              salaryMax: undefined,
              currency: undefined,
              employmentType: undefined,
              remote: job.location?.toLowerCase().includes('remote') || false,
              experienceLevel: undefined,
            }));
          }
        } else {
          console.warn(`Jooble API returned status ${response.status}. Falling back to mock data...`);
        }
      } catch (err) {
        console.error('Failed to fetch from Jooble API, falling back to mock data:', err);
      }
    } else {
      console.log('No Jooble API credentials found in environment. Generating mock jobs...');
    }

    // If no jobs were fetched, fall back to mock jobs
    if (jobsToSync.length === 0) {
      jobsToSync = [
        {
          externalId: `mock-jooble-${page}-1`,
          source: this.source,
          title: "Full Stack Developer",
          company: "TechCorp Solutions",
          location: location || "San Francisco, CA",
          description: "We are seeking a Full Stack Developer with expertise in React, Node.js, and MongoDB to join our dynamic team.",
          applyUrl: "https://example.com/apply/fullstack",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 110000,
          salaryMax: 140000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: false,
          experienceLevel: "MID",
        },
        {
          externalId: `mock-jooble-${page}-2`,
          source: this.source,
          title: "DevOps Engineer",
          company: "CloudScale Inc.",
          location: location || "New York, NY",
          description: "Experienced DevOps Engineer needed to manage AWS infrastructure and implement CI/CD pipelines.",
          applyUrl: "https://example.com/apply/devops",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 120000,
          salaryMax: 150000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: true,
          experienceLevel: "SENIOR",
        },
        {
          externalId: `mock-jooble-${page}-3`,
          source: this.source,
          title: "UI/UX Designer",
          company: "DesignStudio",
          location: location || "Remote",
          description: "Creative UI/UX Designer to craft intuitive user interfaces for web and mobile applications.",
          applyUrl: "https://example.com/apply/designer",
          postedAt: new Date(),
          metadata: { mock: true },
          salaryMin: 80000,
          salaryMax: 110000,
          currency: "USD",
          employmentType: "FULL_TIME",
          remote: true,
          experienceLevel: "MID",
        }
      ];
    }

    return jobsToSync;
  }
}