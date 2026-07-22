import { Exclude, Expose } from 'class-transformer';
import { JobDto } from './job.dto';

export class ApplicationDto {
  @Expose()
  id: string = '';

  @Expose()
  userId: string = '';

  @Expose()
  jobId: string = '';

  @Expose()
  status: string = ''; // APPLIED, INTERVIEWING, OFFERED, REJECTED

  @Expose()
  appliedAt: Date = new Date();

  @Expose()
  updatedAt: Date = new Date();

  // Optional: include job details when needed
  @Exclude()
  job?: JobDto;

  constructor(partial: Partial<ApplicationDto>) {
    Object.assign(this, partial);
  }
}