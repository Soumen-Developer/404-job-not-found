import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

/**
 * Remotive Provider - Free public API, no key required
 * Returns real remote jobs from https://remotive.com/api/remote-jobs
 */
export class RemotiveProvider extends AbstractJobProvider {
  public readonly source = 'Remotive';

  async fetchJobs(params: { category?: string; search?: string; limit?: number } = {}): Promise<ExternalJob[]> {
    const jobs: ExternalJob[] = [];

    try {
      // Remotive public API - no authentication needed
      const url = new URL('https://remotive.com/api/remote-jobs');
      if (params.category) url.searchParams.set('category', params.category);
      if (params.search) url.searchParams.set('search', params.search);
      if (params.limit) url.searchParams.set('limit', String(params.limit));

      console.log(`[Remotive] Fetching from: ${url.toString()}`);

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CY-Jobs/1.0' },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();

      if (!Array.isArray(data.jobs)) throw new Error('Unexpected response shape');

      for (const job of data.jobs) {
        if (!job.id || !job.title) continue;
        jobs.push({
          externalId: String(job.id),
          source: this.source,
          title: job.title,
          company: job.company_name || 'Unknown',
          location: job.candidate_required_location || 'Remote (Worldwide)',
          description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 2000),
          applyUrl: job.url || '',
          postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
          metadata: { tags: job.tags, category: job.category },
          remote: true,
          employmentType: job.job_type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
          currency: 'USD',
          salaryMin: job.salary ? parseInt(job.salary.replace(/\D/g, '').slice(0, 6)) || null : null,
          salaryMax: null,
        });
      }

      console.log(`[Remotive] Fetched ${jobs.length} real jobs`);
    } catch (err: any) {
      console.error(`[Remotive] Fetch failed: ${err.message}`);
    }

    return jobs;
  }
}