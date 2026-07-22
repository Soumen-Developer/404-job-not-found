import { Exclude, Expose } from 'class-transformer';

export class JobDto {
  @Expose()
  id!: string;

  @Expose()
  externalId!: string;

  @Expose()
  source!: string;

  @Expose()
  title!: string;

  @Expose()
  company!: string;

  @Expose()
  location?: string;

  @Exclude()
  description!: string; // Excluded from list views for performance

  @Expose()
  applyUrl?: string;

  @Expose()
  postedAt?: Date;

  @Expose()
  salaryMin?: number;

  @Expose()
  salaryMax?: number;

  @Expose()
  currency?: string;

  @Expose()
  employmentType?: string;

  @Expose()
  remote?: boolean;
}