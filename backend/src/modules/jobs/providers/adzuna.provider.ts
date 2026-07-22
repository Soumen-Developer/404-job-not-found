import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

export class AdzunaProvider extends AbstractJobProvider {
  public readonly source = 'Adzuna';

  /**
   * Fetch jobs from Adzuna API
   * @param params - { country: string, category?: string, page: number }
   * @returns Promise of external job listings
   */
  async fetchJobs(params: { country: string; category?: string; page: number }): Promise<ExternalJob[]> {
    const { country, category, page } = params;
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    let jobsToSync: ExternalJob[] = [];

    // Attempt real API fetch if credentials are provided
    if (appId && appKey) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=10${category ? `&category=${category}` : ''}`;
        const response = await fetch(url);

        if (response.ok) {
          const data: any = await response.json();
          if (data.results && Array.isArray(data.results)) {
            jobsToSync = data.results.map((r: any) => ({
              externalId: r.id ? String(r.id) : undefined,
              source: this.source,
              title: r.title || 'Untitled Job',
              company: r.company?.display_name || 'Unknown Company',
              location: r.location?.display_name || 'Remote',
              description: r.description || '',
              applyUrl: r.redirect_url || '',
              postedAt: r.created ? new Date(r.created) : new Date(),
              metadata: r,
              // Extract enhanced fields if available
              salaryMin: r.salary_min || null,
              salaryMax: r.salary_max || null,
              currency: r.currency || null,
              employmentType: r.contract_time || null,
              remote: r.location?.area?.includes('remote') || false,
              experienceLevel: r.contract_time === 'contract' ? 'CONTRACT' : undefined, // Simplified mapping
            }));
          }
        } else {
          console.warn(`Adzuna API returned status ${response.status}. Falling back to mock data...`);
        }
      } catch (err) {
        console.error('Failed to fetch from Adzuna API, falling back to mock data:', err);
      }
    } else {
      console.log('No Adzuna API credentials found in environment. Generating rich mock jobs...');
    }

    // If no jobs were fetched, fall back to rich, realistic mock jobs
    if (jobsToSync.length === 0) {
      if (country === 'in') {
        jobsToSync = [
          {
            externalId: `mock-adzuna-in-${page}-1`,
            source: this.source,
            title: "Frontend Developer (React)",
            company: "Infosys",
            location: "Bangalore, India",
            description: "Looking for a skilled React Developer with TypeScript experience to join our core development team.",
            applyUrl: "https://example.com/apply/react-in",
            postedAt: new Date(),
            metadata: { mock: true, salary: "₹8,00,000 - ₹12,00,000/Year", currency: "INR" },
            salaryMin: 800000,
            salaryMax: 1200000,
            currency: "INR",
            employmentType: "FULL_TIME",
            remote: false,
            experienceLevel: "MID",
          },
          {
            externalId: `mock-adzuna-in-${page}-2`,
            source: this.source,
            title: "Backend Node.js Engineer",
            company: "Wipro",
            location: "Pune, India",
            description: "Seeking a backend engineer proficient in Node.js, Express, and PostgreSQL to design microservices.",
            applyUrl: "https://example.com/apply/node-in",
            postedAt: new Date(),
            metadata: { mock: true, salary: "₹10,00,000 - ₹15,00,000/Year", currency: "INR" },
            salaryMin: 1000000,
            salaryMax: 1500000,
            currency: "INR",
            employmentType: "FULL_TIME",
            remote: false,
            experienceLevel: "SENIOR",
          },
          {
            externalId: `mock-adzuna-in-${page}-3`,
            source: this.source,
            title: "Technical Project Manager",
            company: "Tata Consultancy Services",
            location: "Mumbai, India",
            description: "Experienced Technical Project Manager to coordinate agile sprint teams and manage deliverables.",
            applyUrl: "https://example.com/apply/pm-in",
            postedAt: new Date(),
            metadata: { mock: true, salary: "₹18,00,000 - ₹24,00,000/Year", currency: "INR" },
            salaryMin: 1800000,
            salaryMax: 2400000,
            currency: "INR",
            employmentType: "FULL_TIME",
            remote: false,
            experienceLevel: "SENIOR",
          }
        ];
      } else {
        jobsToSync = [
          {
            externalId: `mock-adzuna-${country}-${page}-1`,
            source: this.source,
            title: "React Developer",
            company: "Creative Cloud Solutions",
            location: country === 'gb' ? "London, UK" : "Remote, US",
            description: "We are looking for a Senior React Developer who is proficient in TypeScript and React state management.",
            applyUrl: "https://example.com/apply/react-dev",
            postedAt: new Date(),
            metadata: { mock: true, salary: country === 'gb' ? "£50,000 - £70,000/Year" : "$120,000 - $140,000/Year", currency: country === 'gb' ? "GBP" : "USD" },
            salaryMin: country === 'gb' ? 50000 : 120000,
            salaryMax: country === 'gb' ? 70000 : 140000,
            currency: country === 'gb' ? "GBP" : "USD",
            employmentType: "FULL_TIME",
            remote: country === 'gb' ? false : true,
            experienceLevel: "SENIOR",
          },
          {
            externalId: `mock-adzuna-${country}-${page}-2`,
            source: this.source,
            title: "Node.js Backend Engineer",
            company: "FastStack Inc.",
            location: "New York, NY",
            description: "Seeking a backend engineer with experience building scalable microservices in Node.js and TypeScript.",
            applyUrl: "https://example.com/apply/node-dev",
            postedAt: new Date(),
            metadata: { mock: true, salary: "$130,000 - $160,000/Year", currency: "USD" },
            salaryMin: 130000,
            salaryMax: 160000,
            currency: "USD",
            employmentType: "FULL_TIME",
            remote: false,
            experienceLevel: "SENIOR",
          },
          {
            externalId: `mock-adzuna-${country}-${page}-3`,
            source: this.source,
            title: "Technical Project Manager",
            company: "Aura Media Corp",
            location: "Remote, UK",
            description: "Looking for an experienced Project Manager with excellent communication and team coordination skills.",
            applyUrl: "https://example.com/apply/pm",
            postedAt: new Date(),
            metadata: { mock: true, salary: "£45,000 - £60,000/Year", currency: "GBP" },
            salaryMin: 45000,
            salaryMax: 60000,
            currency: "GBP",
            employmentType: "FULL_TIME",
            remote: true,
            experienceLevel: "SENIOR",
          }
        ];
      }
    }

    return jobsToSync;
  }
}