import * as cheerio from 'cheerio';

export class NativeScraperProvider {
  /**
   * Scrapes public job boards without relying on external APIs.
   * We scrape the highly robust WeWorkRemotely RSS feed which contains real, live remote tech jobs.
   */
  async fetchJobs(params: { query?: string; location?: string } = {}): Promise<any[]> {
    const { query = '', location = '' } = params;
    console.log(`[NativeScraperProvider] Independently scraping jobs for query: "${query}", location: "${location || 'any'}"`);
    
    try {
      // We Work Remotely offers a comprehensive RSS feed of their remote jobs
      // Which is completely public and doesn't require any API keys
      const response = await fetch('https://weworkremotely.com/remote-jobs.rss');
      
      if (!response.ok) {
        throw new Error(`Failed to scrape native jobs: HTTP ${response.status}`);
      }

      const xmlText = await response.text();
      const $ = cheerio.load(xmlText, { xmlMode: true });

      const scrapedJobs: any[] = [];
      const queryLower = query.toLowerCase();

      // Parse the RSS feed items
      $('item').each((_, element) => {
        const titleRaw = $(element).find('title').text() || '';
        const link = $(element).find('link').text() || '';
        const description = $(element).find('description').text() || '';
        const pubDate = $(element).find('pubDate').text() || '';
        const guid = $(element).find('guid').text() || '';

        // Extract company and role from Title format "Company Name: Job Title"
        let company = 'Unknown Company';
        let jobTitle = titleRaw;
        
        if (titleRaw.includes(':')) {
          const parts = titleRaw.split(':');
          company = parts[0].trim();
          jobTitle = parts.slice(1).join(':').trim();
        }

        const titleLower = jobTitle.toLowerCase();
        const descLower = description.toLowerCase();

        // Basic keyword filtering
        const matchesQuery = !query || titleLower.includes(queryLower) || descLower.includes(queryLower);

        // Location is generally 'Remote' since this is a remote job board, 
        // but we'll include it if it loosely matches or is global
        const matchesLocation = !location || true; // WWR is global remote

        if (matchesQuery && matchesLocation) {
          scrapedJobs.push({
            externalId: guid,
            source: 'CY-Jobs Native Scraper',
            title: jobTitle,
            company: company,
            location: 'Remote',
            description: description,
            applyUrl: link,
            postedAt: pubDate ? new Date(pubDate) : new Date(),
            salaryMin: null,
            salaryMax: null,
            currency: 'USD',
            employmentType: 'FULL_TIME',
            remote: true,
            experienceLevel: 'ENTRY',
            metadata: { scrapedAt: new Date().toISOString() },
          });
        }
      });

      console.log(`[NativeScraperProvider] Successfully scraped ${scrapedJobs.length} jobs matching "${query}"`);
      return scrapedJobs;

    } catch (err) {
      console.error('[NativeScraperProvider] Native scraping failed:', err);
      return [];
    }
  }
}
