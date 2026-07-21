import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UserDto {
  @Expose()
  id: string = '';

  @Expose()
  email: string = '';

  @Expose()
  @IsOptional()
  @IsString()
  githubUsername: string | null = null;

  @Expose()
  @IsOptional()
  @IsString()
  role: string = '';

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}