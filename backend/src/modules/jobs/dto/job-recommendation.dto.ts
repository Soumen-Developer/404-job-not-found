import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { JobDto } from './job.dto';

export class JobMatchDto {
  @Expose()
  job: JobDto = {} as JobDto;

  @Expose()
  @IsNumber()
  matchScore: number = 0;

  @Expose()
  @IsNumber()
  skillMatch: number = 0;

  @Expose()
  @IsNumber()
  experienceMatch: number = 0;

  @Expose()
  @IsNumber()
  locationMatch: number = 0;

  @Expose()
  @IsNumber()
  salaryMatch: number = 0;

  @Expose()
  @IsNumber()
  jobTypeMatch: number = 0;

  @Expose()
  @IsNumber()
  remoteMatch: number = 0;

  @Expose()
  @IsString()
  explanation: string = '';

  @Expose()
  @IsArray()
  @IsString({ each: true })
  matchedSkills: string[] = [];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  missingSkills: string[] = [];

  @Expose()
  skillGapAnalysis: {
    criticalMissing: string[];
    niceToHaveMissing: string[];
  } = {
    criticalMissing: [],
    niceToHaveMissing: [],
  };

  constructor(partial: Partial<JobMatchDto>) {
    Object.assign(this, partial);
  }
}

export class JobRecommendationsDto {
  @Expose()
  @IsArray()
  recommendations: JobMatchDto[] = [];

  @Expose()
  @IsNumber()
  totalCount: number = 0;

  @Expose()
  @IsNumber()
  page: number = 1;

  @Expose()
  @IsNumber()
  limit: number = 10;

  @Expose()
  @IsBoolean()
  hasMore: boolean = false;

  constructor(partial: Partial<JobRecommendationsDto>) {
    Object.assign(this, partial);
  }
}