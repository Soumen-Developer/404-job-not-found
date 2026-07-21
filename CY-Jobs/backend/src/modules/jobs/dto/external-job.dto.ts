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