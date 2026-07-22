import { AbstractJobProvider } from '../provider';
import { ExternalJob } from '../dto/external-job.dto';

/**
 * SerpApi Google Jobs Provider
 * https://serpapi.com/search?engine=google_jobs
 * Returns highly relevant Google Jobs results, perfect for localized (Indian) jobs
 */
export class SerpApiGoogleJobsProvider extends AbstractJobProvider {
  public readonly source = 'GoogleJobs';

  async fetchJobs(params: { q?: string; location?: string; start?: number } = {}): Promise<ExternalJob[]> {
    const jobs: ExternalJob[] = [];
    const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      console.warn('[SerpApi] No SERPAPI_KEY found in env. Skipping Google Jobs fetch.');
      return jobs;
    }

    try {
      const url = new URL('https://serpapi.com/search');
      url.searchParams.set('engine', 'google_jobs');
      url.searchParams.set('q', params.q || 'software developer');
      if (params.location) url.searchParams.set('location', params.location);
      url.searchParams.set('hl', 'en');
      url.searchParams.set('api_key', apiKey);
      if (params.start) url.searchParams.set('start', String(params.start));

      console.log(`[SerpApi] Fetching Google Jobs for: ${params.q || 'software developer'} in ${params.location || 'Anywhere'}`);

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();

      if (!data.jobs_results || !Array.isArray(data.jobs_results)) {
        console.warn('[SerpApi] No jobs_results found in response');
        return jobs;
      }

      for (const job of data.jobs_results) {
        if (!job.job_id || !job.title) continue;

        jobs.push({
          externalId: `google-${job.job_id}`,
          source: this.source,
          title: job.title,
          company: job.company_name || 'Unknown',
          location: job.location || 'Remote',
          description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 2000),
          applyUrl: job.related_links?.[0]?.link || job.share_link || '',
          postedAt: new Date(), // Google Jobs usually returns strings like "10 hours ago", simplified here
          metadata: { extensions: job.extensions },
          remote: (job.location || '').toLowerCase().includes('remote') || (job.extensions || []).join(' ').toLowerCase().includes('work from home'),
          employmentType: 'FULL_TIME',
          currency: 'INR',
          salaryMin: null,
          salaryMax: null,
        });
      }

      console.log(`[SerpApi] Fetched ${jobs.length} real jobs`);
    } catch (err: any) {
      console.error(`[SerpApi] Fetch failed: ${err.message}`);
    }

    return jobs;
  }
}
