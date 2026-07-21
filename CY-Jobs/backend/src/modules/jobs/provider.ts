export interface ExternalJob {
  externalId: string;
  source: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  applyUrl?: string;
  metadata?: Record<string, any>;
  postedAt?: Date;
  // Enhanced fields (optional)
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  employmentType?: string;
  remote?: boolean;
  experienceLevel?: string;
}

export abstract class AbstractJobProvider {
  abstract readonly source: string;

  /**
   * Fetch jobs from the provider
   * @param params - Provider-specific parameters (e.g., search query, location, page)
   * @returns Promise of external job listings
   */
  abstract fetchJobs(params?: any): Promise<ExternalJob[]>;

  /**
   * Optional: transform external job to internal job format
   * Default implementation returns the external job as-is (assuming it matches ExternalJob interface)
   */
  protected mapToInternalJob(externalJob: ExternalJob): any {
    return {
      externalId: externalJob.externalId,
      source: this.source,
      title: externalJob.title,
      company: externalJob.company,
      location: externalJob.location,
      description: externalJob.description,
      applyUrl: externalJob.applyUrl,
      metadata: externalJob.metadata,
      postedAt: externalJob.postedAt,
      salaryMin: externalJob.salaryMin,
      salaryMax: externalJob.salaryMax,
      currency: externalJob.currency,
      employmentType: externalJob.employmentType,
      remote: externalJob.remote,
      experienceLevel: externalJob.experienceLevel,
    };
  }
}