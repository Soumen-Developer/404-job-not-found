import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';

export class SearchJobsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  employmentType?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  sort?: 'relevance' | 'recent' | 'salary'; // relevance, recent, salary

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}