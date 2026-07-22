import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

/**
 * Arbeitnow Provider - Free public API, no key required
 * https://arbeitnow.com/api/job-board-api
 * Returns real tech jobs globally, many remote
 */
export class ArbeitnowProvider extends AbstractJobProvider {
  public readonly source = 'Arbeitnow';

  async fetchJobs(params: { page?: number } = {}): Promise<ExternalJob[]> {
    const jobs: ExternalJob[] = [];

    try {
      const url = `https://arbeitnow.com/api/job-board-api?page=${params.page || 1}`;
      console.log(`[Arbeitnow] Fetching: ${url}`);

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CY-Jobs/1.0' },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();

      if (!Array.isArray(data.data)) throw new Error('Unexpected shape');

      for (const job of data.data) {
        if (!job.slug || !job.title) continue;

        const salary = parseSalaryRange(job.salary);

        jobs.push({
          externalId: `arbeitnow-${job.slug}`,
          source: this.source,
          title: job.title,
          company: job.company_name || 'Unknown',
          location: job.location || (job.remote ? 'Remote' : 'Unknown'),
          description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 2000),
          applyUrl: job.url || `https://arbeitnow.com/jobs/${job.slug}`,
          postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date(),
          metadata: { tags: job.tags },
          remote: !!job.remote,
          employmentType: 'FULL_TIME',
          currency: salary.currency,
          salaryMin: salary.min,
          salaryMax: salary.max,
        });
      }

      console.log(`[Arbeitnow] Fetched ${jobs.length} real jobs`);
    } catch (err: any) {
      console.error(`[Arbeitnow] Fetch failed: ${err.message}`);
    }

    return jobs;
  }
}

function parseSalaryRange(salary: string | null): { min: number | null; max: number | null; currency: string } {
  if (!salary) return { min: null, max: null, currency: 'USD' };
  const nums = salary.match(/\d[\d,.]*/g);
  if (!nums) return { min: null, max: null, currency: 'USD' };
  const values = nums.map(n => parseInt(n.replace(/[,.]/g, '')));
  const currency = salary.includes('€') ? 'EUR' : salary.includes('£') ? 'GBP' : 'USD';
  return { min: values[0] || null, max: values[1] || null, currency };
}
