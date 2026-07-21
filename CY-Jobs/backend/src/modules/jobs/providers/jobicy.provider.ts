import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

/**
 * Jobicy Provider - Free public API, no key required
 * https://jobicy.com/api/v2/remote-jobs
 * Returns real remote jobs globally. Supports geo filtering.
 */
export class JobicyProvider extends AbstractJobProvider {
  public readonly source = 'Jobicy';

  async fetchJobs(params: { geo?: string; industry?: string } = {}): Promise<ExternalJob[]> {
    const jobs: ExternalJob[] = [];

    try {
      const url = new URL('https://jobicy.com/api/v2/remote-jobs');
      if (params.geo) url.searchParams.set('geo', params.geo);
      if (params.industry) url.searchParams.set('industry', params.industry);

      console.log(`[Jobicy] Fetching: ${url.toString()}`);

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CY-Jobs/1.0' },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();

      if (!data.jobs || !Array.isArray(data.jobs)) throw new Error('Unexpected shape');

      for (const job of data.jobs) {
        if (!job.id || !job.jobTitle) continue;

        jobs.push({
          externalId: `jobicy-${job.id}`,
          source: this.source,
          title: job.jobTitle,
          company: job.companyName || 'Unknown',
          location: job.jobGeo || 'Remote',
          description: (job.jobDescription || '').replace(/<[^>]*>/g, '').substring(0, 2000),
          applyUrl: job.url || '',
          postedAt: job.pubDate ? new Date(job.pubDate) : new Date(),
          metadata: { tags: job.jobType },
          remote: true,
          employmentType: 'FULL_TIME',
          currency: 'USD',
          salaryMin: null,
          salaryMax: null,
        });
      }

      console.log(`[Jobicy] Fetched ${jobs.length} real jobs`);
    } catch (err: any) {
      console.error(`[Jobicy] Fetch failed: ${err.message}`);
    }

    return jobs;
  }
}
